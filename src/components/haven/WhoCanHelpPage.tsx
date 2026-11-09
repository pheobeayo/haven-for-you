import { useEffect, useRef } from "react";
import { Phone } from "lucide-react";
import { ContactList } from "@/components/haven/ContactList";
import type { ContactTopic } from "@/content/contacts";
import { useLang } from "@/lib/lang";

const CONTAINER = "mx-auto w-[90%]";

export function WhoCanHelpPage({ topics }: { topics: ContactTopic[] }) {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const photo = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = photo.current;
    if (!img || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const drift = img.animate(
      [
        { transform: "scale(1.02) translate(0, 0)" },
        { transform: "scale(1.1) translate(-1.5%, 1%)" },
      ],
      { duration: 24_000, easing: "ease-in-out", iterations: Infinity, direction: "alternate" },
    );
    return () => drift.cancel();
  }, []);

  return (
    <div className="hv-body bg-(--hv-mist) text-(--hv-forest)">
      <section
        className={`${CONTAINER} flex flex-wrap items-center justify-between gap-10 pb-14 pt-8 sm:pt-12 lg:gap-16 lg:pb-20 lg:pt-14`}
      >
        <div className="lg:w-[50%] md:w-[50%] w-full">
          <p className="mb-4 text-[15px] font-semibold tracking-[0.02em] text-(--hv-eucalyptus)">
            {pcm ? "Who fit help" : "Who can help"}
          </p>
          <h1 className="hv-display text-[42px] font-medium leading-[1.04] tracking-tight md:text-[56px] lg:text-[68px]">
            {pcm ? "You no need" : "You don't have to"}
            <br />
            <em className="font-normal text-(--hv-eucalyptus)">
              {pcm ? "carry am alone." : "do this alone."}
            </em>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-(--hv-ink-soft)">
            {pcm
              ? "Dis people dey help children and di adults wey dey worry about dem. We still dey confirm each contact, so check di label before you depend on am."
              : "These people help children and the adults worried about them. We are still confirming each contact, so check its label before you rely on it."}
          </p>
          <a
            href="tel:112"
            className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-full border-[1.5px] border-[var(--hv-ember-line)] bg-[var(--hv-ember-tint)] px-6 text-[17px] font-semibold text-[var(--hv-ember)] transition-transform hover:-translate-y-px"
          >
            <Phone className="h-5 w-5" aria-hidden />
            {pcm ? "Pikin dey for danger now? Call 112" : "A child in danger now? Call 112"}
          </a>
        </div>

        <figure className="relative ml-auto lg:w-[35%] md:w-[35%] w-full">
          <div className="relative aspect-5/6 w-full overflow-hidden rounded-[999px_999px_40px_40px] bg-(--hv-sage)">
            <img
              ref={photo}
              src="/mother-and-child.jpg"
              alt={
                pcm
                  ? "One woman carry baby for her shoulder, di baby dey look camera"
                  : "A woman holds a baby on her shoulder; the baby looks towards the camera"
              }
              className="absolute inset-0 h-full w-full origin-[50%_35%] object-cover object-[50%_30%]"
            />
          </div>
          <figcaption className="absolute -bottom-5 right-3 max-w-[240px] rounded-[18px] bg-white px-5 py-3.5 text-sm leading-snug shadow-[0_18px_40px_-18px_rgba(31,59,52,0.35)] sm:-right-6">
            <strong className="font-semibold">
              {pcm ? "You no sure?" : "Not sure it's serious?"}
            </strong>{" "}
            {pcm ? "You fit still call helpline." : "You can still call a helpline."}
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="contacts-heading" className="bg-[var(--hv-sage-soft)]">
        <div className={`${CONTAINER} py-14 lg:py-20`}>
          <h2
            id="contacts-heading"
            className="hv-display mb-6 text-[32px] font-medium leading-tight tracking-[-0.015em] sm:text-[40px]"
          >
            {pcm ? "Call person today" : "Call someone today"}
          </h2>
          <ContactList topics={topics} />
        </div>
      </section>
    </div>
  );
}
