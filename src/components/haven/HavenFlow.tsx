import { useEffect, useRef, useState, type DragEvent } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Eye,
  Loader2,
  Lock,
  ShieldAlert,
  Siren,
} from "lucide-react";
import { GuidanceView } from "@/components/haven/GuidanceView";
import { LandingSections } from "@/components/haven/LandingSections";
import { ArchPhoto } from "@/components/haven/ArchPhoto";
import {
  CATEGORIES,
  EMERGENCIES,
  categoryById,
  type Answer,
  type CategoryId,
  type EmergencyKind,
  type Urgency,
} from "@/content/guidance";
import { useLang } from "@/lib/lang";
import { routeConcern } from "@/lib/route-concern.functions";
import {
  MAX_CONCERN_LENGTH,
  applyAnswers,
  classifyConcern,
  detectEmergency,
  redactConcern,
} from "@/lib/triage";

type View =
  | { name: "start"; notice?: "choose" }
  | { name: "questions"; category: CategoryId; index: number; answers: Record<string, Answer> }
  | { name: "guidance"; category: CategoryId; urgency: Urgency }
  | { name: "emergency"; kind: EmergencyKind; category: CategoryId | null };

const ROUTE_TIMEOUT_MS = 18_000;

const CONTAINER = "mx-auto w-[90%]";

const CONCERN_GROUPS = [
  {
    key: "harm",
    tone: "harm",
    route: "Physical harm",
    title: { en: "A child is being hurt", pcm: "Person dey hurt pikin" },
    body: { en: "You saw it, or a child told you.", pcm: "You see am, or pikin tell you." },
    covers: {
      en: ["Sexual harm", "Physical harm", "Something online"],
      pcm: ["Sexual harm", "Physical harm", "Something for online"],
    },
  },
  {
    key: "wrong",
    tone: "calm",
    route: "I am not sure",
    title: { en: "Something feels wrong", pcm: "Something no feel right" },
    body: {
      en: "A child has changed, someone worries you, or you can't name it yet.",
      pcm: "Pikin don change, one person dey worry you, or you never fit name am.",
    },
    covers: {
      en: ["Someone too close", "A child has changed", "Not sure yet"],
      pcm: ["Person wey too close", "Pikin don change", "I never sure"],
    },
  },
] as const;

function HeroArch({ pcm }: { pcm: boolean }) {
  return (
    <div className="relative mx-auto w-full min-w-0 max-w-160 flex-[1.2_1_420px]">
      <div
        role="img"
        aria-label={
          pcm
            ? "Adult hand dey hold pikin hand well well"
            : "An adult's hands gently holding a child's hands"
        }
        className="relative aspect-5/6 w-full overflow-hidden rounded-[999px_999px_40px_40px] bg-(--hv-sage) lg:aspect-9/10"
      >
        <video
          className="absolute inset-0 h-full w-full scale-105 object-cover object-[50%_65%] motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero/haven-hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/haven-hero-loop.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute bottom-14 left-3 flex max-w-62.5 items-center gap-3 rounded-[18px] bg-white px-4.5 py-3.5 shadow-[0_18px_40px_-18px_rgba(31,59,52,0.35)] sm:-left-7">
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-(--hv-sage) text-(--hv-eucalyptus)"
        >
          <Lock className="h-[18px] w-[18px]" />
        </span>
        <span className="text-sm leading-snug">
          <strong className="font-semibold">
            {pcm ? "We build am private." : "Private by design."}
          </strong>
          <br />
          {pcm ? "We no dey save wetin you write." : "Nothing you write is saved."}
        </span>
      </div>
    </div>
  );
}

function blockFiles(e: DragEvent) {
  if (e.dataTransfer?.types.includes("Files")) e.preventDefault();
}

export function HavenFlow() {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const route = useServerFn(routeConcern);
  const [view, setView] = useState<View>({ name: "start" });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);
  const hash = useLocation({ select: (location) => location.hash });

  useEffect(() => {
    if (hash) setView({ name: "start" });
  }, [hash]);

  useEffect(() => {
    if (view.name === "start") return;
    window.scrollTo({ top: 0 });
    stepRef.current?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  }, [view]);

  function restart() {
    setText("");
    setView({ name: "start" });
    window.scrollTo({ top: 0 });
  }

  function openCategory(category: CategoryId) {
    setView({ name: "questions", category, index: 0, answers: {} });
  }

  async function onSubmit() {
    const concern = text.trim();
    if (busy) return;
    if (!concern) {
      document.getElementById("concern")?.focus();
      return;
    }
    const emergency = detectEmergency(concern);
    if (emergency) {
      setView({ name: "emergency", kind: emergency, category: classifyConcern(concern) });
      return;
    }
    setBusy(true);
    try {
      const routed = await Promise.race([
        route({ data: { text: redactConcern(concern) } }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), ROUTE_TIMEOUT_MS)),
      ]);
      const category = routed ? routed.category : classifyConcern(concern);
      if (routed?.emergency) {
        setView({ name: "emergency", kind: routed.emergency, category });
      } else if (category) {
        openCategory(category);
      } else {
        setView({ name: "start", notice: "choose" });
      }
    } catch {
      const category = classifyConcern(concern);
      if (category) openCategory(category);
      else setView({ name: "start", notice: "choose" });
    } finally {
      setBusy(false);
    }
  }

  function onAnswer(answer: Answer) {
    if (view.name !== "questions") return;
    const category = categoryById(view.category);
    const question = category.questions[view.index];
    if (!question) return;
    const answers = { ...view.answers, [question.id]: answer };
    const outcome = applyAnswers(category, answers);
    if (outcome.kind === "emergency") {
      setView({ name: "emergency", kind: outcome.emergency, category: category.id });
    } else if (view.index + 1 < category.questions.length) {
      setView({ ...view, index: view.index + 1, answers });
    } else {
      setView({ name: "guidance", category: category.id, urgency: outcome.urgency });
    }
  }

  if (view.name === "start") {
    const reassurances = pcm
      ? ["You no need account", "We no dey save anything", "Pikin no need phone"]
      : ["No account needed", "Nothing is saved", "The child needs no phone"];
    const steps = pcm ? ["Talk", "Answer", "Do am"] : ["Tell", "Answer", "Act"];

    return (
      <div className="hv-body bg-(--hv-mist) text-(--hv-forest)">
        <section
          className={`${CONTAINER} flex flex-wrap items-center gap-12 pb-16 pt-8 sm:pt-12 lg:gap-16 lg:pb-28 lg:pt-16`}
        >
          <div className="min-w-0 flex-[1_1_440px]">
            <p className="mb-5 text-[15px] font-semibold tracking-[0.02em] text-(--hv-eucalyptus)">
              {pcm
                ? "For parents, carers, teachers and health workers for Nigeria"
                : "For parents, carers, teachers and health workers in Nigeria"}
            </p>
            <h1 className="hv-display text-[44px] font-medium leading-[1.02] tracking-tight sm:text-6xl lg:text-[76px]">
              {pcm ? "Something dey worry you about pikin?" : "Worried about a child?"}
              <br />
              <em className="font-normal text-(--hv-eucalyptus)">
                {pcm ? "Take di next safe step." : "Take the next safe step."}
              </em>
            </h1>
            <p className="mt-7 max-w-[520px] text-lg leading-relaxed text-(--hv-ink-soft) lg:text-[21px]">
              {pcm
                ? "Tell Haven wetin you notice. Answer small questions. Get clear guidance and people wey fit help."
                : "Tell Haven what you noticed. Answer a few calm questions. Get clear guidance and people who can help."}
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              <Link
                to="/"
                hash="start"
                className="inline-flex min-h-14 items-center gap-2.5 rounded-full bg-(--hv-eucalyptus) px-7 text-[17px] font-semibold text-white transition-transform hover:-translate-y-px"
              >
                {pcm ? "Start now" : "Start now"}
                <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => setView({ name: "emergency", kind: "danger", category: null })}
                className="inline-flex min-h-14 items-center gap-2.5 rounded-full border-[1.5px] border-(--hv-ember-line) bg-(--hv-ember-tint) px-6 text-[17px] font-semibold text-(--hv-ember) transition-transform hover:-translate-y-px"
              >
                <Siren className="h-[18px] w-[18px]" aria-hidden />
                {pcm ? "Pikin dey for danger now" : "A child is in danger now"}
              </button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-[15px] text-[var(--hv-ink-soft)]">
              {reassurances.map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-[7px] w-[7px] rounded-full bg-[var(--hv-apricot-deep)]"
                  />
                  {line}
                </li>
              ))}
            </ul>

            <ol
              aria-label={pcm ? "How e dey work" : "How it works"}
              className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--hv-line)] pt-6 font-semibold"
            >
              {steps.map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="mr-2 h-[1.5px] w-[18px] bg-[var(--hv-on-dark-muted)]"
                    />
                  )}
                  <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-[var(--hv-sage)] text-[13px]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
              <li className="font-normal text-[var(--hv-ink-soft)]">
                {pcm ? "E no go take long." : "A few minutes."}
              </li>
            </ol>
          </div>

          <HeroArch pcm={pcm} />
        </section>

        <section
          id="start"
          aria-labelledby="noticed-heading"
          className="scroll-mt-24 bg-[var(--hv-sage-soft)]"
        >
          <div className={`${CONTAINER} py-16 lg:py-[104px]`}>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
              <h2
                id="noticed-heading"
                className="hv-display text-[34px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[54px]"
              >
                {pcm ? "Wetin you notice?" : "What did you notice?"}
              </h2>
              <p className="max-w-[380px] text-lg text-[var(--hv-ink-soft)]">
                {pcm
                  ? "Choose di one wey near am pass, or write am your own way. Any one dey fine."
                  : "Choose the closest, or say it in your own words. Either is fine."}
              </p>
            </div>

            {view.notice === "choose" && (
              <p
                role="status"
                className="mb-5 rounded-2xl border-[1.5px] border-[var(--hv-apricot)] bg-white p-4 font-semibold"
              >
                {pcm
                  ? "We no fit match wetin you write. Choose di one wey near am pass."
                  : "Haven could not match what you wrote. Choose the closest one."}
              </p>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="flex flex-col gap-4">
                {CONCERN_GROUPS.map((g) => {
                  const target = CATEGORIES.find((c) => c.label.en === g.route);
                  const harm = g.tone === "harm";
                  return (
                    <button
                      key={g.key}
                      type="button"
                      disabled={!target}
                      onClick={() => target && openCategory(target.id)}
                      className="group flex w-full flex-1 items-start gap-4 rounded-[22px] border-[1.5px] border-(--hv-line) bg-white p-6 text-left transition-colors hover:border-(--hv-eucalyptus) sm:p-7"
                    >
                      <span
                        aria-hidden
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${harm ? "bg-(--hv-ember-tint) text-(--hv-ember)" : "bg-(--hv-sage) text-(--hv-eucalyptus)"}`}
                      >
                        {harm ? <ShieldAlert className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[21px] font-semibold leading-snug">
                          {g.title[lang]}
                        </span>
                        <span className="mt-1 block leading-snug text-(--hv-ink-soft)">
                          {g.body[lang]}
                        </span>
                        <span className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[15px]">
                          {g.covers[lang].map((item) => (
                            <span key={item} className="inline-flex items-center gap-2">
                              <span
                                aria-hidden
                                className="h-1.5 w-1.5 rounded-full bg-(--hv-apricot-deep)"
                              />
                              {item}
                            </span>
                          ))}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--hv-sage)] text-[var(--hv-eucalyptus)] transition-colors group-hover:bg-[var(--hv-eucalyptus)] group-hover:text-white"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col rounded-[26px] border-[1.5px] border-[var(--hv-line)] bg-white p-5 sm:p-8">
                <label htmlFor="concern" className="block text-[21px] font-semibold">
                  {pcm ? "Or talk am your own way" : "Or say it in your own words"}
                </label>
                <p className="mt-1 text-[var(--hv-ink-soft)]">
                  {pcm
                    ? "Write wetin you see or hear. Haven go find di closest help."
                    : "Write what you saw or heard. Haven will find the closest help."}
                </p>
                <textarea
                  id="concern"
                  value={text}
                  maxLength={MAX_CONCERN_LENGTH}
                  onChange={(e) => setText(e.target.value)}
                  onDrop={blockFiles}
                  onDragOver={blockFiles}
                  rows={5}
                  placeholder={pcm ? "Wetin you see or hear?" : "What did you see or hear?"}
                  className="mt-4 block min-h-40 w-full flex-1 resize-y rounded-2xl border-[1.5px] border-(--hv-line) bg-(--hv-mist) px-4 py-3.5 text-[17px] text-(--hv-forest) placeholder:text-(--hv-ink-muted) focus:outline-none"
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <p className="min-w-0 flex-[1_1_240px] text-sm text-[var(--hv-ink-muted)]">
                    {pcm
                      ? "No write anybody name, address or phone number. No need for picture."
                      : "Leave out names, addresses and phone numbers. Pictures can't be added."}
                  </p>
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={busy}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--hv-eucalyptus)] px-8 text-[17px] font-semibold text-white transition-colors hover:bg-[var(--hv-eucalyptus-deep)] disabled:cursor-progress sm:w-auto"
                  >
                    {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
                    {busy
                      ? pcm
                        ? "We dey look am"
                        : "Finding the next step"
                      : pcm
                        ? "Find di next step"
                        : "Find the next step"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingSections />
      </div>
    );
  }

  const backButton = (label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-2 font-semibold text-(--hv-eucalyptus-deep) underline-offset-4 hover:underline"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden />
      {label}
    </button>
  );

  // One layout for every step. The photo sits in the same place in the tree,
  // so it stays mounted (and keeps drifting) from question to guidance.
  return (
    <div className="hv-body bg-(--hv-mist) text-(--hv-forest)">
      <main
        className={`${CONTAINER} grid items-start gap-12 py-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,35%)] lg:gap-16`}
      >
        <div ref={stepRef} className="min-w-0 max-w-3xl">
          {view.name === "questions" && (
            <QuestionStep
              key={`${view.category}-${view.index}`}
              categoryId={view.category}
              index={view.index}
              onAnswer={onAnswer}
            />
          )}
          {view.name === "questions" && (
            <div className="mt-8">
              {backButton(pcm ? "Go back" : "Go back", () =>
                view.index === 0
                  ? setView({ name: "start" })
                  : setView({ ...view, index: view.index - 1 }),
              )}
            </div>
          )}
          {view.name === "guidance" && (
            <GuidanceView guidance={categoryById(view.category)} level={view.urgency} />
          )}
          {view.name === "emergency" && (
            <>
              <GuidanceView guidance={EMERGENCIES[view.kind]} level="emergency" />
              <div className="mt-8">
                {backButton(pcm ? "Dis no be emergency" : "This is not an emergency", () =>
                  view.category ? openCategory(view.category) : setView({ name: "start" }),
                )}
              </div>
            </>
          )}
          {view.name !== "questions" && (
            <button
              type="button"
              onClick={restart}
              className="mt-6 inline-flex min-h-12 items-center rounded-full border-[1.5px] border-(--hv-line) bg-white px-6 font-semibold transition-colors hover:border-(--hv-eucalyptus)"
            >
              {pcm ? "Start again and clear dis" : "Start again and clear this"}
            </button>
          )}
        </div>
        <ArchPhoto
          className="hidden lg:sticky lg:top-28 lg:block"
          caption={
            <>
              <strong className="font-semibold">
                {pcm ? "Take your time." : "Take your time."}
              </strong>{" "}
              {pcm ? "We no dey save wetin you choose." : "Nothing you choose is saved."}
            </>
          }
        />
      </main>
    </div>
  );
}

function QuestionStep({
  categoryId,
  index,
  onAnswer,
}: {
  categoryId: CategoryId;
  index: number;
  onAnswer: (answer: Answer) => void;
}) {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const category = categoryById(categoryId);
  const question = category.questions[index];
  if (!question) return null;
  const total = category.questions.length;
  const options: { value: Answer; label: string }[] = [
    { value: "yes", label: pcm ? "Yes" : "Yes" },
    { value: "no", label: pcm ? "No" : "No" },
    { value: "unsure", label: pcm ? "I no sure" : "Not sure" },
  ];
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] font-semibold text-(--hv-ink-soft)">
          {`Question ${index + 1} of ${total}`}
        </p>
        <span className="rounded-full bg-(--hv-sage) px-3.5 py-1.5 text-[13px] font-semibold">
          {category.label[lang]}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={pcm ? "Progress" : "Progress"}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        className="mt-3 flex gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-(--hv-eucalyptus)" : "bg-(--hv-line)"}`}
          />
        ))}
      </div>

      <h2
        tabIndex={-1}
        className="hv-display mt-10 text-[34px] font-medium leading-[1.1] tracking-[-0.02em] focus:outline-none md:text-[48px]"
      >
        {question.text[lang]}
      </h2>
      <p className="mt-4 text-lg text-(--hv-ink-soft)">
        {pcm
          ? "If you no know, e dey okay. Choose \u201cI no sure\u201d."
          : "If you don't know, that's okay. Choose \u201cNot sure\u201d."}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onAnswer(o.value)}
            className="group flex min-h-16 items-center justify-between gap-3 rounded-[18px] border-[1.5px] border-(--hv-line) bg-white px-5 text-left text-lg font-semibold transition-colors hover:border-(--hv-eucalyptus) focus-visible:border-(--hv-eucalyptus)"
          >
            {o.label}
            <span
              aria-hidden
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-[#a9bdb5] transition-colors group-hover:border-(--hv-eucalyptus)"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-(--hv-eucalyptus) opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
