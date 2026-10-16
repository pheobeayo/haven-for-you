import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ShieldCheck } from "lucide-react";
import { reportScam } from "@/lib/reports.functions";
import type { ScanResult } from "@/lib/scan.functions";
import { useLang } from "@/lib/lang";
import { getDeviceId } from "@/components/CommunityReports";

const KIND_LABEL: Record<string, [string, string]> = {
  phone: ["Phone number", "Phone number"],
  bank_account: ["Account number", "Account number"],
  link: ["Website", "Website"],
  wallet: ["Wallet", "Wallet"],
};

export function ProtectOthers({ result }: { result: ScanResult }) {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const report = useServerFn(reportScam);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [state, setState] = useState<"idle" | "busy" | "done" | "limit" | "error">("idle");

  const entities = result.entities ?? [];
  if (result.verdict === "safe" || entities.length === 0) return null;

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const onReport = async () => {
    if (state === "busy" || state === "done" || checked.size === 0) return;
    setState("busy");
    const items = entities
      .filter((e) => checked.has(e.kind + ":" + e.value))
      .map((e) => ({ kind: e.kind, value: e.value }));
    try {
      const r = await report({ data: { deviceId: getDeviceId(), scamType: result.scam_type, items } });
      setState(r.ok ? "done" : r.code === "rate_limit" ? "limit" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="rounded-xl border-2 border-foreground p-4">
      <h3 className="flex items-center gap-2 text-xl font-bold">
        <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />
        {pcm ? "Help protect other people" : "Help protect others"}
      </h3>
      <p className="mt-1 text-base text-muted-foreground">
        {pcm
          ? "Tick only the details wey belong to the scammer — no tick your own number or account."
          : "Only tick details that belong to the scammer, not your own number or account."}
      </p>
      <ul className="mt-3 space-y-2">
        {entities.map((e) => {
          const key = e.kind + ":" + e.value;
          return (
            <li key={key}>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-border p-3 has-checked:border-primary has-checked:bg-muted">
                <input
                  type="checkbox"
                  checked={checked.has(key)}
                  onChange={() => toggle(key)}
                  disabled={state === "done" || state === "busy"}
                  className="h-6 w-6 shrink-0 accent-primary"
                />
                <span className="min-w-0 text-base">
                  <span className="font-bold">{KIND_LABEL[e.kind]?.[pcm ? 1 : 0] ?? e.kind}:</span>{" "}
                  <span className="break-all">{e.value_masked}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {state === "done" ? (
        <p className="mt-3 rounded-xl bg-safe-soft p-3 text-base font-semibold text-safe">
          {pcm ? "Thank you. Your report go help other people see this scam." : "Thank you. Your report helps others spot this scam."}
        </p>
      ) : (
        <button
          onClick={onReport}
          disabled={state === "busy" || checked.size === 0}
          className="tap mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-60"
        >
          {state === "busy" && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
          {pcm ? "Report the ones you tick" : "Report selected"}
        </button>
      )}
      {state === "limit" && (
        <p className="mt-2 text-base font-semibold text-scam">
          {pcm ? "You don report plenty for this hour. Try again later." : "You have sent 5 reports this hour. Please try again later."}
        </p>
      )}
      {state === "error" && (
        <p className="mt-2 text-base font-semibold text-scam">{pcm ? "E no work. Try again." : "Could not save the report. Please try again."}</p>
      )}
    </div>
  );
}
