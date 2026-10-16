import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search } from "lucide-react";
import { checkValue } from "@/lib/reports.functions";
import { useLang } from "@/lib/lang";
import { reportsLine } from "@/components/CommunityReports";

export function CheckNumber() {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const check = useServerFn(checkValue);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<{ kind: "bad" | "none" | "hit" | "error"; n?: number; v?: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !value.trim()) return;
    setBusy(true);
    setOut(null);
    try {
      const r = await check({ data: { value } });
      if (!r.ok) setOut({ kind: "bad" });
      else setOut({ kind: r.reports ? "hit" : "none", n: r.reports, v: r.item.value });
    } catch {
      setOut({ kind: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="check-a-number" aria-label="Check a number" className="rounded-2xl border-2 border-foreground bg-card p-4 md:p-6">
      <h2 className="text-xl font-extrabold">{pcm ? "Check number or link" : "Check a number"}</h2>
      <p className="mt-1 text-base text-muted-foreground">
        {pcm ? "Paste phone number, account number, link or wallet. See if people don report am." : "Paste a phone number, account number, link or wallet to see if others reported it."}
      </p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="text"
          maxLength={300}
          placeholder="08031234567"
          aria-label={pcm ? "Number or link" : "Number or link to check"}
          className="tap min-w-0 flex-1 rounded-xl border-2 border-foreground bg-background px-3 text-lg"
        />
        <button type="submit" disabled={busy || !value.trim()} className="tap flex items-center justify-center gap-2 rounded-xl bg-primary px-5 text-lg font-bold text-primary-foreground disabled:opacity-60">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Search className="h-5 w-5" aria-hidden />}
          {pcm ? "Check am" : "Search"}
        </button>
      </form>
      <div aria-live="polite">
        {out?.kind === "hit" && (
          <p className="mt-3 inline-block rounded-full bg-scam px-3 py-1 text-base font-bold text-verdict-foreground">{reportsLine(out.n!, pcm)}</p>
        )}
        {out?.kind === "none" && (
          <p className="mt-3 text-base font-semibold">
            {pcm ? `Nobody don report ${out.v} for last 30 days. But e no mean say e safe — still shine your eye.` : `No reports for ${out.v} in the last 30 days. That does not mean it is safe — stay careful.`}
          </p>
        )}
        {out?.kind === "bad" && <p className="mt-3 text-base font-semibold text-scam">{pcm ? "We no understand am. Paste one phone number, 10-digit account number, link or wallet." : "We could not read that. Enter one phone number, 10-digit account number, link or wallet."}</p>}
        {out?.kind === "error" && <p className="mt-3 text-base font-semibold text-scam">{pcm ? "E no work. Try again." : "Something went wrong. Please try again."}</p>}
      </div>
    </section>
  );
}
