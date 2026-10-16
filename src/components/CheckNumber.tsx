import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search } from "lucide-react";
import { checkValue } from "@/lib/reports.functions";
import { useLang } from "@/lib/lang";
import { getDeviceId } from "@/components/CommunityReports";
import type { SingleLookup } from "@/lib/reports.server";

type Out =
  | { kind: "hit" | "none"; r: SingleLookup }
  | { kind: "bad" | "limit" | "error" };

function daysAgo(iso: string) {
  const d = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 864e5));
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}

export function CheckNumber() {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const check = useServerFn(checkValue);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<Out | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !value.trim()) return;
    setBusy(true);
    setOut(null);
    try {
      const r = await check({ data: { value, deviceId: getDeviceId() } });
      if (!r.ok) setOut({ kind: r.code === "rate_limit" ? "limit" : r.code === "bad_input" ? "bad" : "error" });
      else setOut({ kind: r.result.count ? "hit" : "none", r: r.result });
    } catch {
      setOut({ kind: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="check-a-number" aria-label="Check a number, account or link" className="rounded-2xl border-2 border-foreground bg-card p-4 md:p-6">
      <h2 className="text-xl font-extrabold">{pcm ? "Check number, account or link" : "Check a number, account or link"}</h2>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="text"
          maxLength={300}
          placeholder={pcm ? "Phone number, account number, link or wallet" : "Phone number, account number, link or wallet"}
          aria-label={pcm ? "Number or link" : "Number or link to check"}
          className="tap min-w-0 flex-1 rounded-xl border-2 border-foreground bg-background px-3 text-lg"
        />
        <button type="submit" disabled={busy || !value.trim()} className="tap flex items-center justify-center gap-2 rounded-xl bg-primary px-5 text-lg font-bold text-primary-foreground disabled:opacity-60">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Search className="h-5 w-5" aria-hidden />}
          {pcm ? "Search" : "Search"}
        </button>
      </form>
      <div aria-live="polite">
        {out?.kind === "hit" && (
          <div className={`mt-3 rounded-xl p-3 ${out.r.count >= 3 ? "bg-scam text-verdict-foreground" : "bg-careful"}`}>
            <p className="break-all text-base font-bold">
              {pcm
                ? `⚠️ ${out.r.value_masked} — people don report am ${out.r.count} ${out.r.count === 1 ? "time" : "times"}${out.r.top_scam_type ? ` · mostly ${out.r.top_scam_type}` : ""} · latest ${daysAgo(out.r.latest_date)}`
                : `⚠️ Reported ${out.r.count} ${out.r.count === 1 ? "time" : "times"}${out.r.top_scam_type ? ` · mostly ${out.r.top_scam_type}` : ""} · latest ${daysAgo(out.r.latest_date)}`}
            </p>
            <p className="mt-1 text-base font-semibold">
              {pcm ? "No send money or goods. Confirm am through your bank app." : "Don't send money or goods. Confirm through your bank app."}
            </p>
          </div>
        )}
        {out?.kind === "none" && (
          <div className="mt-3 rounded-xl bg-muted p-3">
            <p className="text-base font-semibold">
              {pcm
                ? "No reports yet. That one no mean say e safe; scammers dey change numbers well well. Check the full message above."
                : "No reports yet. That doesn't mean it's safe; scammers change numbers often. Check the full message above."}
            </p>
          </div>
        )}
        {out?.kind === "bad" && <p className="mt-3 text-base font-semibold text-scam">{pcm ? "We no understand am. Paste one phone number, 10-digit account number, link or wallet." : "We could not read that. Enter one phone number, 10-digit account number, link or wallet."}</p>}
        {out?.kind === "limit" && <p className="mt-3 text-base font-semibold text-scam">{pcm ? "You don check plenty for this hour. Try again later." : "You have done 30 searches this hour. Please try again later."}</p>}
        {out?.kind === "error" && <p className="mt-3 text-base font-semibold text-scam">{pcm ? "E no work. Try again." : "Something went wrong. Please try again."}</p>}
      </div>
    </section>
  );
}
