import { useEffect, useRef, useState, type DragEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ChevronRight, Loader2, Siren } from "lucide-react";
import { GuidanceView } from "@/components/haven/GuidanceView";
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

const ROUTE_TIMEOUT_MS = 12_000;

function blockFiles(e: DragEvent) {
  if (e.dataTransfer?.types.includes("Files")) e.preventDefault();
}

/**
 * The whole journey stays on one address and in memory, so the browser history
 * shows only the home page, and nothing about a concern survives a refresh.
 */
export function HavenFlow() {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const route = useServerFn(routeConcern);
  const [view, setView] = useState<View>({ name: "start" });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

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
    return (
      <>
        <section className="on-indigo grid bg-primary text-primary-foreground lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="adire h-14 lg:order-2 lg:h-auto" aria-hidden />
          <div className="hero-copy w-full py-8 lg:py-14">
            <h1 className="text-4xl font-extrabold leading-[1.1] md:text-5xl">
              {pcm
                ? "Wetin dey worry you about dis pikin?"
                : "What is worrying you about this child?"}
            </h1>
            <p className="mt-4 max-w-prose text-lg leading-relaxed">
              {pcm
                ? "Talk wetin you notice. Haven go help you find di next step."
                : "Say what you noticed. Haven will help you find the next step."}
            </p>
            <label htmlFor="concern" className="mt-6 block font-bold">
              {pcm ? "Wetin you notice?" : "What did you notice?"}
            </label>
            <textarea
              id="concern"
              value={text}
              maxLength={MAX_CONCERN_LENGTH}
              onChange={(e) => setText(e.target.value)}
              onDrop={blockFiles}
              onDragOver={blockFiles}
              rows={4}
              className="mt-2 block w-full rounded-md border-2 border-transparent bg-card p-3 text-lg text-foreground focus:outline-none focus-visible:border-accent"
            />
            <p className="mt-2 leading-snug">
              {pcm
                ? "No write anybody name, address or phone number. No need for picture."
                : "Do not write anyone's name, address or phone number. Pictures are not accepted."}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onSubmit}
                disabled={busy}
                className="tap inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-accent px-5 text-lg font-extrabold text-accent-foreground disabled:cursor-progress"
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
              <button
                type="button"
                onClick={() => setView({ name: "emergency", kind: "danger", category: null })}
                className="tap inline-flex flex-1 items-center justify-center gap-2 rounded-md border-2 border-white bg-urgent px-5 text-lg font-extrabold text-white"
              >
                <Siren className="h-5 w-5" aria-hidden />
                {pcm ? "Pikin dey for danger now" : "A child is in danger now"}
              </button>
            </div>
          </div>
        </section>

        <main className="container-app py-8 md:py-10">
          <div className="max-w-3xl">
            {view.notice === "choose" && (
              <p role="status" className="mb-4 rounded-md bg-soon-soft p-3 font-bold text-soon">
                {pcm
                  ? "We no fit match wetin you write. Choose di one wey near am pass."
                  : "Haven could not match what you wrote. Choose the closest one below."}
              </p>
            )}
            <h2 className="text-2xl font-extrabold text-primary">
              {pcm ? "Or choose di one wey near am pass" : "Or choose what is closest"}
            </h2>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => openCategory(c.id)}
                    className="flex w-full items-center gap-3 py-3 text-left hover:bg-muted"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-bold leading-snug text-primary">
                        {c.label[lang]}
                      </span>
                      <span className="mt-0.5 block leading-snug text-muted-foreground">
                        {c.example[lang]}
                      </span>
                    </span>
                    <ChevronRight className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <h2 className="mt-10 text-2xl font-extrabold text-primary">
              {pcm ? "How Haven dey protect your privacy" : "How Haven protects your privacy"}
            </h2>
            <p className="mt-3 max-w-prose text-lg leading-relaxed">
              {pcm
                ? "You no need account. Haven no dey collect picture or pikin name, and e no dey save wetin you write. Press Comot now to leave anytime."
                : "You do not need an account. Haven never takes pictures or a child's name, and it does not save what you write. Press Leave now to go at any time."}
            </p>
          </div>
        </main>
      </>
    );
  }

  const backButton = (label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="tap inline-flex items-center gap-2 font-bold text-primary underline underline-offset-4"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden />
      {label}
    </button>
  );

  return (
    <main className="container-app py-5 md:py-8">
      <div ref={stepRef} className="max-w-3xl">
        {view.name === "questions" && (
          <QuestionStep
            key={`${view.category}-${view.index}`}
            categoryId={view.category}
            index={view.index}
            onAnswer={onAnswer}
          />
        )}
        {view.name === "questions" &&
          backButton(pcm ? "Go back" : "Go back", () =>
            view.index === 0
              ? setView({ name: "start" })
              : setView({ ...view, index: view.index - 1 }),
          )}
        {view.name === "guidance" && (
          <GuidanceView guidance={categoryById(view.category)} level={view.urgency} />
        )}
        {view.name === "emergency" && (
          <>
            <GuidanceView guidance={EMERGENCIES[view.kind]} level="emergency" />
            <div className="mt-6">
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
            className="tap mt-3 rounded-md border-2 border-primary px-5 font-bold text-primary"
          >
            {pcm ? "Start again and clear dis" : "Start again and clear this"}
          </button>
        )}
      </div>
    </main>
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
  const options: { value: Answer; label: string }[] = [
    { value: "yes", label: pcm ? "Yes" : "Yes" },
    { value: "no", label: pcm ? "No" : "No" },
    { value: "unsure", label: pcm ? "I no sure" : "Not sure" },
  ];
  return (
    <div>
      <p className="font-bold text-muted-foreground">
        {pcm
          ? `Question ${index + 1} of ${category.questions.length}`
          : `Question ${index + 1} of ${category.questions.length}`}
      </p>
      <h2
        tabIndex={-1}
        className="mt-2 text-3xl font-extrabold leading-tight text-primary md:text-4xl"
      >
        {question.text[lang]}
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onAnswer(o.value)}
            className="tap rounded-md border-2 border-primary bg-card px-4 text-lg font-bold text-primary hover:bg-secondary"
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}
