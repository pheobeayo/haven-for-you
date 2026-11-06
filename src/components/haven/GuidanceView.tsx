import { Check, Phone, X } from "lucide-react";
import { ListenButton } from "@/components/ListenButton";
import { ContactList } from "@/components/haven/ContactList";
import { SOURCES, type Guidance, type Urgency } from "@/content/guidance";
import { useLang } from "@/lib/lang";

type Level = Urgency | "emergency";

const LEVELS: Record<Level, { en: string; pcm: string; band: string }> = {
  emergency: { en: "Act now", pcm: "Do am now now", band: "bg-urgent text-white" },
  today: { en: "Act today", pcm: "Do am today", band: "bg-soon-soft text-soon" },
  this_week: { en: "Act this week", pcm: "Do am dis week", band: "bg-steady-soft text-steady" },
};

export function GuidanceView({ guidance, level }: { guidance: Guidance; level: Level }) {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const band = LEVELS[level];
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
    <article>
      <div className={`rounded-md px-4 py-3 ${band.band}`}>
        <p className="text-lg font-extrabold">{band[lang]}</p>
        {level === "emergency" && (
          <a
            href="tel:112"
            className="tap mt-2 flex items-center justify-center gap-2 rounded-md bg-white px-4 text-xl font-extrabold text-urgent"
          >
            <Phone className="h-6 w-6" aria-hidden />
            {pcm ? "Call 112" : "Call 112"}
          </a>
        )}
      </div>
      <h2
        tabIndex={-1}
        className="mt-5 text-3xl font-extrabold leading-tight text-primary md:text-4xl"
      >
        {guidance.title[lang]}
      </h2>
      <div className="mt-4">
        <ListenButton lines={lines} />
      </div>

      <section className="mt-8">
        <h3 className="text-xl font-extrabold text-primary">{headings.doNow}</h3>
        <ol className="mt-3 space-y-3">
          {guidance.doNow.map((step, i) => (
            <li key={step.en} className="flex gap-3 text-lg leading-snug">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="pt-0.5">{step[lang]}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section>
          <h3 className="text-xl font-extrabold text-primary">{headings.say}</h3>
          <ul className="mt-3 space-y-3">
            {guidance.say.map((line) => (
              <li key={line.en} className="flex gap-3 text-lg leading-snug">
                <Check className="mt-1 h-5 w-5 shrink-0 text-steady" aria-hidden />
                {line[lang]}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-xl font-extrabold text-primary">{headings.avoid}</h3>
          <ul className="mt-3 space-y-3">
            {guidance.avoid.map((line) => (
              <li key={line.en} className="flex gap-3 leading-snug">
                <X className="mt-0.5 h-5 w-5 shrink-0 text-urgent" aria-hidden />
                {line[lang]}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8">
        <h3 className="mb-3 text-xl font-extrabold text-primary">{headings.help}</h3>
        <ContactList topics={guidance.contactTopics} />
      </section>

      <section className="mt-6 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
        <p className="font-bold">{pcm ? "Part of dis guidance come from" : "Based in part on"}</p>
        <ul className="mt-1">
          {guidance.sources.map((id) => (
            <li key={id}>
              <a
                href={SOURCES[id].url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
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
