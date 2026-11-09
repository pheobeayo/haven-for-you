import { useEffect, useRef, type ReactNode } from "react";
import { useLang } from "@/lib/lang";

/**
 * The mother-and-child photo in Haven's arch, with a slow drift.
 * Same styling as the Who can help hero. Keep it mounted across steps
 * so it stays constant while people move through the questions.
 */
export function ArchPhoto({
  caption,
  className = "",
}: {
  caption?: ReactNode;
  className?: string;
}) {
  const pcm = useLang().lang === "pcm";
  const photo = useRef<HTMLImageElement>(null);

  // A slow drift so the photo breathes a little. Skipped for reduced motion.
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
    <figure className={`relative w-full ${className}`}>
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
      {caption && (
        <figcaption className="absolute -bottom-5 right-3 max-w-[240px] rounded-[18px] bg-white px-5 py-3.5 text-sm leading-snug shadow-[0_18px_40px_-18px_rgba(31,59,52,0.35)] sm:-right-6">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
