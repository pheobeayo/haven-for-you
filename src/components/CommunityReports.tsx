import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Flag, Loader2 } from "lucide-react";
import { reportScam } from "@/lib/reports.functions";
import type { ScanResult } from "@/lib/scan.functions";
import { useLang } from "@/lib/lang";

const LABEL: Record<string, [string, string]> = {
  phone_number: ["Phone number", "Phone number"],
  bank_account: ["Account number", "Account number"],
  link: ["Website", "Website"],
  wallet: ["Wallet", "Wallet"],
  message_pattern: ["Message type", "Kind of message"],
};

function daysAgo(iso: string, pcm: boolean) {
  const d = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 864e5));
  if (d === 0) return pcm ? "today" : "today";
  if (d === 1) return pcm ? "yesterday" : "yesterday";
  return pcm ? `${d} days ago` : `${d} days ago`;
}

export function reportsLine(n: number, pcm: boolean) {
  return pcm
    ? `⚠️ ${n} ${n === 1 ? "person" : "people"} don report am for last 90 days`
    : `⚠️ Reported by ${n} ${n === 1 ? "person" : "people"} in the last 90 days`;
}

export function getDeviceId() {
  let id = localStorage.getItem("sye-device");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sye-device", id);
  }
  return id;
}

export function CommunityMatches({ result }: { result: ScanResult }) {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  if (!result.community_matches?.length) return null;
  return (
    <div>
      <ul className="space-y-2">
        {result.community_matches.map((c) => (
          <li key={c.type + c.value} className="rounded-xl bg-scam px-3 py-2 text-base font-bold text-verdict-foreground">
            <p className="break-all">
              ⚠️ {c.value_masked} {pcm ? "don be reported" : "was reported"} {c.reports} {c.reports === 1 ? (pcm ? "time" : "time") : pcm ? "times" : "times"} {pcm ? "by other users" : "by other users"}
              {c.top_scam_type ? (pcm ? ` (mostly: ${c.top_scam_type}, latest ${daysAgo(c.latest, pcm)})` : ` (mostly: ${c.top_scam_type}, latest ${daysAgo(c.latest, pcm)})`) : ""}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-muted-foreground">
        {pcm ? "Na users send these reports; we never verify dem." : "Reports come from users and are not verified."}
      </p>
    </div>
  );
}

export function ReportButton({ result }: { result: ScanResult }) {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const report = useServerFn(reportScam);
  const [state, setState] = useState<"idle" | "busy" | "done" | "limit" | "error">("idle");
  if (result.verdict === "safe") return null;

  const onClick = async () => {
    if (state === "busy" || state === "done") return;
    setState("busy");
    try {
      const r = await report({ data: { deviceId: getDeviceId(), scamType: result.scam_type, items: result.identifiers ?? [] } });
      setState(r.ok ? "done" : r.code === "rate_limit" ? "limit" : "error");
    } catch {
      setState("error");
    }
  };

  const items = result.identifiers ?? [];
  return (
    <div className="rounded-xl border-2 border-foreground p-3">
      <button
        onClick={onClick}
        disabled={state === "busy" || state === "done"}
        className="tap flex w-full items-center justify-center gap-2 rounded-xl bg-scam text-lg font-bold text-verdict-foreground disabled:opacity-70"
      >
        {state === "busy" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Flag className="h-5 w-5" aria-hidden />}
        {state === "done" ? (pcm ? "Thank you, we don save am" : "Thank you, report saved") : pcm ? "Report this scam" : "Report this scam"}
      </button>
      <p className="mt-2 text-sm text-muted-foreground">
        {items.length
          ? (pcm ? "We go save only: " : "We only save: ") + items.map((i) => i.value).join(", ")
          : pcm ? "We go save only the kind of scam." : "We only save the kind of scam."}{" "}
        {pcm ? "No your name, no your message." : "Not your name or your message."}
      </p>
      {state === "limit" && <p className="mt-2 text-base font-semibold text-scam">{pcm ? "You don report plenty for this hour. Try again later." : "You have sent 5 reports this hour. Please try again later."}</p>}
      {state === "error" && <p className="mt-2 text-base font-semibold text-scam">{pcm ? "E no work. Try again." : "Could not save the report. Please try again."}</p>}
    </div>
  );
}
