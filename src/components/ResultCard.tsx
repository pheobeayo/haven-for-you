import { useState } from "react";
import { AlertTriangle, CheckCircle2, OctagonX } from "lucide-react";
import type { ScanResult } from "@/lib/scan.functions";

const V = {
  scam: { word: "Likely scam", pcm: "E be like scam", Icon: OctagonX, bg: "bg-scam", soft: "bg-scam-soft", text: "text-scam" },
  suspicious: { word: "Be careful", pcm: "Shine your eye well", Icon: AlertTriangle, bg: "bg-careful", soft: "bg-careful-soft", text: "text-careful" },
  safe: { word: "Looks safe", pcm: "E look okay", Icon: CheckCircle2, bg: "bg-safe", soft: "bg-safe-soft", text: "text-safe" },
} as const;

export function ResultCard({ result, onCheckAnother }: { result: ScanResult; onCheckAnother: () => void }) {
  const [pcm, setPcm] = useState(false);
  const v = V[result.verdict];
  return (
    <section aria-live="polite" className="rounded-2xl border-2 border-foreground bg-card lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
      <div className="min-w-0 lg:sticky lg:top-4 lg:border-r-2 lg:border-foreground">
      <div className={`${v.bg} rounded-t-[14px] lg:rounded-tr-none p-5 2xl:p-8 text-verdict-foreground`}>
        <div className="flex items-center gap-3">
          <v.Icon className="h-12 w-12 shrink-0" aria-hidden />
          <p className="font-display text-4xl font-extrabold leading-tight">{pcm ? v.pcm : v.word}</p>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-base font-bold">
            <span>{pcm ? "How risky" : "Risk score"}</span>
            <span>{result.risk_score}/100</span>
          </div>
          <div
            role="meter"
            aria-valuenow={result.risk_score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Risk ${result.risk_score} out of 100`}
            className="h-4 w-full overflow-hidden rounded-full border-2 border-verdict-foreground/60 bg-verdict-foreground/20"
          >
            <div className="h-full rounded-full bg-verdict-foreground" style={{ width: `${Math.max(4, result.risk_score)}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4 lg:p-6">
        <h2 className="font-display text-2xl font-extrabold leading-tight">{result.scam_type}</h2>

        <div className="flex gap-2" role="group" aria-label="Language">
          {[["English", false], ["Pidgin", true]].map(([label, val]) => (
            <button
              key={String(label)}
              onClick={() => setPcm(val as boolean)}
              aria-pressed={pcm === val}
              className={`tap flex-1 rounded-xl border-2 border-foreground text-base font-bold ${pcm === val ? "bg-foreground text-background" : "bg-card"}`}
            >
              {label as string}
            </button>
          ))}
        </div>

        <div className="hidden grid-cols-2 gap-2 lg:grid">
          <button
            onClick={onCheckAnother}
            className="tap rounded-xl border-2 border-foreground bg-secondary text-base font-bold text-secondary-foreground"
          >
            Check another
          </button>
          <button
            disabled
            aria-disabled="true"
            title="Coming soon"
            className="tap rounded-xl border-2 border-input bg-muted text-base font-bold text-muted-foreground opacity-60"
          >
            Share warning
          </button>
        </div>
      </div>
      </div>

      <div className="min-w-0 space-y-5 p-4 lg:p-6 [&_p]:max-w-[65ch]">
        {result.onchain && result.onchain.length > 0 && (
          <div>
            <h3 className="mb-2 text-xl font-bold">{pcm ? "Wetin blockchain show" : "On-chain checks"}</h3>
            <ul className="divide-y-2 divide-border rounded-xl border-2 border-foreground">
              {result.onchain.map((c) => (
                <li key={c.label} className="flex items-center justify-between gap-3 p-3">
                  <span className="min-w-0 text-base">{c.label}</span>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-base font-bold ${c.bad ? "bg-scam text-verdict-foreground" : "bg-muted"}`}>{c.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-sm text-muted-foreground">Data from GoPlus Security.</p>
          </div>
        )}

        {result.red_flags.length > 0 && (
          <div>
            <h3 className="mb-2 text-xl font-bold">{pcm ? "Wahala we see" : "Red flags we found"}</h3>
            <ul className="space-y-2">
              {result.red_flags.map((f, i) => (
                <li key={i} className={`${v.soft} rounded-xl p-3`}>
                  <p className={`font-bold ${v.text}`}>{f.flag}</p>
                  <p className="mt-1 text-base leading-relaxed">
                    <mark className={`${v.soft} rounded px-1 font-semibold text-foreground`}>“{f.evidence}”</mark>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-xl font-bold">{pcm ? "Wetin you go do now" : "What to do now"}</h3>
          <ol className="space-y-2">
            {result.what_to_do.map((s, i) => (
              <li key={i} className="flex gap-3 text-lg leading-relaxed">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="mb-2 text-xl font-bold">{pcm ? "Why we talk so" : "Why"}</h3>
          <p className="text-lg leading-relaxed">{pcm ? result.explanation_pcm : result.explanation_en}</p>
        </div>

        <p className="rounded-xl bg-muted p-3 text-base">
          This is an AI opinion, not a guarantee. When in doubt, confirm with your bank app directly.
        </p>

        <div className="grid grid-cols-2 gap-2 lg:hidden">
          <button
            onClick={onCheckAnother}
            className="tap rounded-xl border-2 border-foreground bg-secondary text-base font-bold text-secondary-foreground"
          >
            Check another
          </button>
          <button
            disabled
            aria-disabled="true"
            title="Coming soon"
            className="tap rounded-xl border-2 border-input bg-muted text-base font-bold text-muted-foreground opacity-60"
          >
            Share warning
          </button>
        </div>
      </div>
    </section>
  );
}
