import { Check, Phone, X } from "lucide-react";
import { ListenButton } from "@/components/ListenButton";
import { ContactList } from "@/components/haven/ContactList";
import { SOURCES, type Guidance, type Urgency } from "@/content/guidance";
import { useLang } from "@/lib/lang";

type Level = Urgency | "emergency";

const LEVELS: Record<Level, { en: string; pcm: string; pill: string; dot: string }> = {
  emergency: {
    en: "Act now",
    pcm: "Do am now now",
    pill: "bg-white/15 text-white",
    dot: "bg-white",
  },
  today: {
    en: "Act today",
    pcm: "Do am today",
    pill: "bg-(--soon-soft) text-(--soon)",
    dot: "bg-(--soon)",
  },
  this_week: {
    en: "Act this week",
    pcm: "Do am dis week",
    pill: "bg-(--hv-sage) text-(--hv-eucalyptus-deep)",
    dot: "bg-(--hv-eucalyptus)",
  },
};

export function GuidanceView({ guidance, level }: { guidance: Guidance; level: Level }) {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const band = LEVELS[level];
  const emergency = level === "emergency";
  const headings = {
    doNow: pcm ? "Wetin to do" : "What to do",
    say: pcm ? "Wetin you fit talk" : "What you can say",
    avoid: pcm ? "Wetin you no go do" : "What to avoid",
    help: pcm ? "Who fit help" : "Who can help",
  };
  const lines = [
    guidance.title[lang],
    band[lang],
    headings.doNow,
    ...guidance.doNow.map((s) => s[lang]),
    headings.say,
    ...guidance.say.map((s) => s[lang]),
    headings.avoid,
    ...guidance.avoid.map((s) => s[lang]),
  ];

  return (
    <article className="hv-body text-(--hv-forest)">
      <div
        className={`rounded-[28px] p-6 sm:p-8 ${emergency ? "bg-(--hv-ember) text-white" : "border-[1.5px] border-(--hv-line) bg-white"}`}
      >
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-[0.06em] ${band.pill}`}
        >
          <span aria-hidden className={`h-2 w-2 rounded-full ${band.dot}`} />
          {band[lang]}
        </span>
        <h2
          tabIndex={-1}
          className="hv-display mt-4 text-[32px] font-medium leading-[1.08] tracking-[-0.02em] focus:outline-none md:text-[44px]"
        >
          {guidance.title[lang]}
        </h2>
        {emergency && (
          <a
            href="tel:112"
            className="mt-6 flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-white px-6 text-xl font-bold text-(--hv-ember) transition-transform hover:-translate-y-px"
          >
            <Phone className="h-6 w-6" aria-hidden />
            {pcm ? "Call 112" : "Call 112"}
          </a>
        )}
      </div>

      <div className="mt-5">
        <ListenButton lines={lines} />
      </div>

      <section className="mt-10">
        <h3 className="hv-display text-2xl font-medium">{headings.doNow}</h3>
        <ol className="mt-5 space-y-4">
          {guidance.doNow.map((step, i) => (
            <li key={step.en} className="flex gap-4 text-lg leading-snug">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-(--hv-apricot) text-[15px] font-bold">
                {i + 1}
              </span>
              <span className="pt-0.5">{step[lang]}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <section className="rounded-[24px] bg-(--hv-sage) p-6">
          <h3 className="hv-display text-2xl font-medium">{headings.say}</h3>
          <ul className="mt-4 space-y-2.5">
            {guidance.say.map((line) => (
              <li
                key={line.en}
                className="flex gap-3 rounded-[16px_16px_16px_4px] bg-white px-4 py-3 text-lg leading-snug"
              >
                <Check className="mt-1 h-5 w-5 shrink-0 text-(--hv-eucalyptus)" aria-hidden />
                <span className="hv-display italic">{line[lang]}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[24px] border-[1.5px] border-(--hv-line) bg-white p-6">
          <h3 className="hv-display text-2xl font-medium">{headings.avoid}</h3>
          <ul className="mt-4 space-y-3.5">
            {guidance.avoid.map((line) => (
              <li key={line.en} className="flex gap-3 leading-snug">
                <X className="mt-0.5 h-5 w-5 shrink-0 text-(--hv-ember)" aria-hidden />
                {line[lang]}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-12">
        <h3 className="hv-display mb-5 text-2xl font-medium">{headings.help}</h3>
        <ContactList topics={guidance.contactTopics} />
      </section>

      <section className="mt-10 border-t border-(--hv-line) pt-5 text-sm leading-relaxed text-(--hv-ink-muted)">
        <p className="font-semibold">
          {pcm ? "Part of dis guidance come from" : "Based in part on"}
        </p>
        <ul className="mt-1.5 space-y-1">
          {guidance.sources.map((id) => (
            <li key={id}>
              <a
                href={SOURCES[id].url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-(--hv-forest)"
              >
                {SOURCES[id].name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
