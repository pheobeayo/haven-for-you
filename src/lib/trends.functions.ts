import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";

export type Trends = {
  ok: boolean;
  total: number;
  scams: number;
  suspicious: number;
  types: { label: string; count: number }[];
};

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export const getTrends = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async (): Promise<Trends> => {
  try {
    const { fetchTrends } = await import("./reports.server");
    const rows = await fetchTrends();
    let total = 0, scams = 0, suspicious = 0;
    const byType = new Map<string, { label: string; count: number }>();
    for (const r of rows) {
      total += r.n;
      if (r.verdict === "scam") scams += r.n;
      if (r.verdict === "suspicious") suspicious += r.n;
      if (r.verdict === "safe") continue;
      const label = r.scam_type.trim();
      if (!label || /^(none|n\/a|no scam|not a scam|safe)/i.test(label)) continue;
      const key = label.toLowerCase();
      const cur = byType.get(key) ?? { label: titleCase(label), count: 0 };
      cur.count += r.n;
      byType.set(key, cur);
    }
    const types = [...byType.values()].sort((a, b) => b.count - a.count).slice(0, 6);
    return { ok: true, total, scams, suspicious, types };
  } catch (e) {
    console.error("getTrends failed", e);
    return { ok: false, total: 0, scams: 0, suspicious: 0, types: [] };
  }
});

export const trendsQuery = queryOptions({ queryKey: ["trends"], queryFn: () => getTrends(), staleTime: 60_000 });

const TIPS: [RegExp, string, string][] = [
  [/alert|credit|transfer|reversal|receipt/i, "Check your bank app before you release goods. Screenshots and SMS can be faked.", "Check your bank app before you release goods. Screenshot and SMS fit be fake."],
  [/job|recruit|scholarship|employ/i, "Real jobs don't ask you to pay a fee to get hired.", "Real work no dey ask you to pay money before dem hire you."],
  [/bvn|nin|otp|pin|bank imperson|account update|verif/i, "Your bank will never ask for your BVN, PIN or OTP by message or call.", "Your bank no go ever ask for your BVN, PIN or OTP for message or call."],
  [/ponzi|invest|double|return|forex/i, "Guaranteed or very high returns are a warning sign.", "If dem promise sure profit or big returns, shine your eye."],
  [/crypto|airdrop|wallet|token/i, "Never connect your wallet or share your seed phrase to 'claim' anything.", "No connect your wallet or share seed phrase to 'claim' anything."],
  [/loan/i, "Real lenders don't ask for money upfront before giving a loan.", "Real loan people no dey collect money first before dem give loan."],
  [/romance|love|stranded|abroad/i, "Don't send money to someone you have only met online.", "No send money give person wey you only meet online."],
  [/phish|link|website|domain/i, "Don't tap links in messages. Open the official app or type the address yourself.", "No tap link for message. Open the real app or type the address yourself."],
];

export function watchFor(type: string, pcm: boolean) {
  const hit = TIPS.find(([re]) => re.test(type));
  if (hit) return pcm ? hit[2] : hit[1];
  return pcm ? "If dem rush you or ask for money first, stop and confirm." : "If they rush you or ask for money first, stop and confirm.";
}
