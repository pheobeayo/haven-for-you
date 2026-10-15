import { useState } from "react";
import { AlertTriangle, CheckCircle2, OctagonX } from "lucide-react";
import type { ScanResult } from "@/lib/scan.functions";

const V = {
  scam: { word: "Likely scam", pcm: "E be like scam", Icon: OctagonX, bg: "bg-scam", soft: "bg-scam-soft", text: "text-scam" },
  suspicious: { word: "Be careful", pcm: "Shine your eye well", Icon: AlertTriangle, bg: "bg-careful", soft: "bg-careful-soft", text: "text-careful" },
  safe: { word: "Looks safe", pcm: "E look okay", Icon: CheckCircle2, bg: "bg-safe", soft: "bg-safe-soft", text: "text-safe" },
} as const;

export function ResultCard({ result }: { result: ScanResult }) {
  const [pcm, setPcm] = useState(false);
  const v = V[result.verdict];
  return (
    <section aria-live="polite" className="overflow-hidden rounded-2xl border-2 border-foreground bg-card">
      <div className={`${v.bg} flex items-center gap-3 p-5 text-verdict-foreground`}>
        <v.Icon className="h-12 w-12 shrink-0" aria-hidden />
        <div>
          <p className="font-display text-3xl font-extrabold leading-tight">{pcm ? v.pcm : v.word}</p>
          <p className="text-base font-bold opacity-95">Risk {result.risk_score}/100 · {result.scam_type}</p>
        </div>
      </div>

      <div className="flex gap-2 p-4 pb-0" role="group" aria-label="Language">
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

      <div className="space-y-5 p-4">
        <p className="text-lg leading-relaxed">{pcm ? result.explanation_pcm : result.explanation_en}</p>

        {result.red_flags.length > 0 && (
          <div>
            <h3 className="mb-2 text-xl font-bold">{pcm ? "Wetin no correct" : "Warning signs"}</h3>
            <ul className="space-y-2">
              {result.red_flags.map((f, i) => (
                <li key={i} className={`${v.soft} rounded-xl p-3`}>
                  <p className={`font-bold ${v.text}`}>{f.flag}</p>
                  <p className="text-base text-muted-foreground">"{f.evidence}"</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-xl font-bold">{pcm ? "Wetin you go do" : "What to do"}</h3>
          <ol className="space-y-2">
            {result.what_to_do.map((s, i) => (
              <li key={i} className="flex gap-3 text-lg">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="rounded-xl bg-muted p-3 text-base">
          This is an AI opinion, not a guarantee. When in doubt, confirm with your bank app directly.
        </p>
      </div>
    </section>
  );
}
