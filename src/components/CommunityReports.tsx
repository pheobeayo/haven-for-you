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

export function reportsLine(n: number, pcm: boolean) {
  return pcm
    ? `⚠️ ${n} ${n === 1 ? "person" : "people"} don report am for last 30 days`
    : `⚠️ Reported by ${n} ${n === 1 ? "person" : "people"} in the last 30 days`;
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
  if (!result.community?.length) return null;
  return (
    <div>
      <h3 className="mb-2 text-xl font-bold">{pcm ? "Wetin people don report" : "Community reports"}</h3>
      <ul className="space-y-2">
        {result.community.map((c) => (
          <li key={c.type + c.value} className="rounded-xl border-2 border-foreground p-3">
            <p className="break-all text-base">
              <span className="font-bold">{LABEL[c.type]?.[pcm ? 1 : 0] ?? c.type}:</span> {c.value}
            </p>
            <p className="mt-2 inline-block rounded-full bg-scam px-3 py-1 text-base font-bold text-verdict-foreground">{reportsLine(c.reports, pcm)}</p>
          </li>
        ))}
      </ul>
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
