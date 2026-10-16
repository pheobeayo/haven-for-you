import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createServerFn } from "@tanstack/react-start";

export type Verdict = "scam" | "suspicious" | "safe";
export type ScanResult = {
  verdict: Verdict;
  risk_score: number;
  scam_type: string;
  red_flags: { flag: string; evidence: string }[];
  what_to_do: string[];
  explanation_en: string;
  explanation_pcm: string;
  onchain?: OnchainCheck[];
  identifiers?: Identifier[];
  community_matches?: ReportMatch[];
  entities?: Entity[];
};
export type Entity = { kind: string; value: string; value_masked: string };
export type ScanResponse =
  | { ok: true; result: ScanResult }
  | { ok: false; code: "rate_limit" | "no_credits" | "bad_input" | "ai_error"; message: string };

import { extractIdentifiers, type Identifier } from "./identifiers";
import { maskValue, normalizeValue, toKind } from "./report-normalize";
import { lookupReports, recordScanEvent, type ReportMatch } from "./reports.server";
import { goplusToken, type OnchainCheck } from "./goplus";
import { checkUrl, detectKind, explorerFor, NETWORKS, type Network } from "./link-checks";

type ScanInput = { text?: string; link?: string; imageDataUrl?: string; network?: string };

const SYSTEM = `You are a fraud analyst who specialises in scams targeting Nigerians. Analyse the message and decide if it is a scam.
Know these common patterns: fake bank credit alerts and 'wrong transfer, please reverse' requests; jobs or scholarships asking for a processing or registration fee; 'double your money' investment and Ponzi schemes; loan offers needing an upfront fee; impersonation of banks, CBN, EFCC, NIMC or telcos asking to 'update BVN/NIN'; requests for OTP, PIN or BVN; romance and 'stranded abroad' requests; fake crypto airdrops, giveaways and wallet-connect links.
Watch for: urgency or threats, upfront payment, guaranteed returns, shortened or look-alike links, bank messages sent from ordinary phone numbers, and mismatched names or amounts.
Be careful not to over-flag. Normal bank notices (transaction alerts, balance and statement messages, maintenance or service updates that ask for nothing) and genuine job posts (clear role, pay and company, no fee to apply) are common and should be marked "safe". Only mark "scam" or "suspicious" when there is a clear red flag such as a request for a fee or payment, a request for OTP, PIN, BVN or password, a suspicious or look-alike link, guaranteed returns, or threats. Urgency alone, without one of these, is not enough. When in doubt between "safe" and "suspicious", prefer "suspicious" only if you can quote the exact words that are worrying.
If the image is a bank credit alert or transfer receipt, check for signs of a fake: sender is a regular phone number or app notification instead of the bank; wrong or inconsistent bank name, logo, fonts or spacing; amounts formatted wrongly (e.g. missing commas, wrong currency symbol); balance that doesn't make sense; date or time errors; edited-looking text. Always tell the user to confirm by checking their bank app or calling the bank, never by trusting the alert.
Quote the exact words from the message as evidence for every red flag. Do not invent evidence. If the message looks normal, say 'safe' and explain why. Give 2-4 short, practical next steps. Write explanation_en in plain simple English and explanation_pcm in natural Nigerian Pidgin. Return JSON only.
Return ONLY JSON, no markdown, exactly this shape:
{"verdict":"scam"|"suspicious"|"safe","risk_score":0-100,"scam_type":string,"red_flags":[{"flag":string,"evidence":string}],"what_to_do":[string],"explanation_en":string,"explanation_pcm":string,"entities":[{"kind":"phone"|"bank_account"|"link"|"wallet","value":string}]}
For "safe", red_flags may be empty and scam_type should be "None found".
In "entities", list every possible scammer detail you can see in the message or screenshot: Nigerian phone numbers, 10-digit bank account numbers, domains from links, and 0x wallet addresses. Copy each value exactly as written. If none, use an empty array.`;

function validate(raw: string): ScanResult | null {
  try {
    const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const o = JSON.parse(cleaned);
    if (!["scam", "suspicious", "safe"].includes(o.verdict)) return null;
    const score = Number(o.risk_score);
    if (!Number.isFinite(score) || score < 0 || score > 100) return null;
    if (typeof o.scam_type !== "string") return null;
    if (!Array.isArray(o.red_flags) || !o.red_flags.every((f: any) => typeof f?.flag === "string" && typeof f?.evidence === "string")) return null;
    if (!Array.isArray(o.what_to_do) || !o.what_to_do.every((s: any) => typeof s === "string")) return null;
    if (typeof o.explanation_en !== "string" || typeof o.explanation_pcm !== "string") return null;
    if (o.entities !== undefined && (!Array.isArray(o.entities) || !o.entities.every((e: any) => typeof e?.kind === "string" && typeof e?.value === "string"))) return null;
    return { ...o, risk_score: Math.round(score) };
  } catch {
    return null;
  }
}

async function callAI(key: string, content: any[]): Promise<{ status: number; text: string }> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      stream: true,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content },
      ],
    }),
  });
  if (!res.ok || !res.body) return { status: res.status, text: await res.text().catch(() => "") };
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let out = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const d = t.slice(5).trim();
      if (d === "[DONE]") continue;
      try {
        out += JSON.parse(d).choices?.[0]?.delta?.content ?? "";
      } catch {
        /* partial */
      }
    }
  }
  return { status: 200, text: out };
}

/** Merge offline-extracted identifiers with AI-found entities; normalise + mask each. */
function mergeEntities(identifiers: Identifier[], aiEntities: { kind: string; value: string }[] | undefined): Entity[] {
  const out = new Map<string, Entity>();
  const add = (kindRaw: string, raw: string) => {
    const kind = toKind(kindRaw);
    if (!kind) return;
    const value = normalizeValue(kind, raw);
    if (!value) return;
    out.set(kind + ":" + value, { kind, value, value_masked: maskValue(kind, value) });
  };
  for (const i of identifiers) add(i.type, i.value);
  for (const e of aiEntities ?? []) add(e.kind, e.value);
  return [...out.values()].slice(0, 20);
}

export const scanContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ScanInput) => {
    const text = (input.text ?? "").slice(0, 5000);
    const link = (input.link ?? "").slice(0, 500);
    let img = input.imageDataUrl ?? "";
    const badImage = !!img && (!img.startsWith("data:image/") || img.length > 4_000_000);
    if (badImage) img = "";
    const network = (NETWORKS as readonly string[]).includes(input.network ?? "") ? (input.network as Network) : undefined;
    return { text, link, imageDataUrl: img, network, badImage };
  })
  .handler(async ({ data }): Promise<ScanResponse> => {
    if (data.badImage)
      return { ok: false, code: "bad_input", message: "This picture is too big or not a photo we can read. Please try a JPG or PNG screenshot." };
    if (!data.text.trim() && !data.link.trim() && !data.imageDataUrl)
      return { ok: false, code: "bad_input", message: "Please paste a message, add a screenshot, or enter a link." };
    if (data.text.trim() && !data.link.trim() && !data.imageDataUrl && data.text.trim().length < 15)
      return { ok: false, code: "bad_input", message: "This message is too short to check. Please paste the full message." };
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { ok: false, code: "ai_error", message: "The checker is not set up yet. Please try later." };

    const content: any[] = [];
    let onchain: OnchainCheck[] | null = null;
    let prompt = "Check this for scams.\n";
    if (data.text.trim()) prompt += `\nMessage:\n"""${data.text}"""\n`;
    if (data.link.trim()) {
      const kind = detectKind(data.link);
      if (kind === "wallet") {
        if (!data.network) return { ok: false, code: "bad_input", message: "Please choose the network for this address." };
        const ex = explorerFor(data.network);
        onchain = await goplusToken(data.link.trim(), data.network);
        if (onchain) prompt += `\nOn-chain facts from GoPlus token security (treat as facts, quote them as evidence; a honeypot, owner-changeable balances, or tax above 10% are serious red flags):\n${onchain.map((c) => `- ${c.label}: ${c.value}`).join("\n")}\n`;
        else prompt += `\nNo on-chain security data was available for this address.\n`;
        prompt += `\nCrypto wallet or token address: ${data.link.trim()}\nNetwork: ${data.network}\nYou cannot look this address up. Judge from what you know (e.g. known scam patterns, fake token contracts). Usually say "suspicious" unless there is a clear reason, and in what_to_do tell the user exactly what to check on ${ex}: search the address, see if it is a verified contract, how old it is, number of holders/transactions, and any "phish/hack" warning label. Never tell them to connect their wallet. red_flags evidence should quote the address or network.\n`;
      } else {
        const findings = kind === "url" ? checkUrl(data.link) : [];
        prompt += `\nLink (we did NOT open it): ${data.link.trim()}\nAutomatic checks found: ${findings.length ? findings.map((f) => "- " + f).join("\n") : "nothing unusual"}\nUse these findings as red flags where relevant, quoting the exact part of the link as evidence. Do not claim to have visited the site.\n`;
      }
    }
    const identifiers = extractIdentifiers(`${data.text}\n${data.link}`);
    const community = await lookupReports(identifiers);
    if (community.length)
      prompt += `\nCommunity reports (facts from our database of user scam reports in the last 90 days; treat as a strong red flag and quote them as evidence):\n${community.map((c) => `- This ${c.type.replace("_", " ")} was reported ${c.reports} time(s)${c.top_scam_type ? ` as a ${c.top_scam_type}` : ""}.`).join("\n")}\nA community match should raise the risk score. When there is no match, do not lower the risk score because of that.\n`;
    if (data.imageDataUrl) prompt += `\nA screenshot is attached. Read it carefully.\n`;
    content.push({ type: "text", text: prompt });
    if (data.imageDataUrl) content.push({ type: "image_url", image_url: { url: data.imageDataUrl } });

    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await callAI(key, content);
      if (r.status === 429)
        return { ok: false, code: "rate_limit", message: "Too many people are checking right now. Please wait a minute and try again." };
      if (r.status === 402)
        return { ok: false, code: "no_credits", message: "The checker has run out of AI balance for now. Please try again later." };
      if (r.status !== 200) {
        console.error("AI error", r.status, r.text.slice(0, 300));
        if (r.status >= 500 && attempt === 0) continue;
        return { ok: false, code: "ai_error", message: "We could not check this right now. Please try again." };
      }
      const v = validate(r.text);
      if (v) {
        await recordScanEvent(v.verdict, v.scam_type);
        const entities = mergeEntities(identifiers, (v as any).entities);
        // Look up any AI-found entities (e.g. from screenshots) not already checked.
        const seen = new Set(identifiers.map((i) => i.type + ":" + i.value));
        const extra = entities
          .filter((e) => !seen.has(e.kind === "phone" ? "phone_number:" + e.value : e.kind + ":" + e.value))
          .map((e) => ({ type: e.kind === "phone" ? "phone_number" : e.kind, value: e.value }) as Identifier);
        const extraMatches = extra.length ? await lookupReports(extra) : [];
        const community_matches = [...community];
        for (const m of extraMatches) if (!community_matches.some((c) => c.value_masked === m.value_masked)) community_matches.push(m);
        return { ok: true, result: { ...v, ...(onchain ? { onchain } : {}), identifiers, community_matches, entities } };
      }
      console.error("Invalid AI JSON", r.text.slice(0, 300));
    }
    return { ok: false, code: "ai_error", message: "Sorry, we could not read the answer. Please try again." };
  });
