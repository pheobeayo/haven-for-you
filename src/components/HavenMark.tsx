/** Haven's mark: a doorway with someone safe inside it. */
export function HavenMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`inline-flex items-center ${compact ? "gap-1" : "gap-2"}`}>
      <svg viewBox="0 0 32 32" className={compact ? "h-7 w-7" : "h-8 w-8"} aria-hidden fill="none">
        <path
          d="M7 28V15a9 9 0 0 1 18 0v13"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <circle cx="16" cy="19" r="3.4" fill="var(--accent)" />
      </svg>
      <span className={`font-extrabold leading-none ${compact ? "text-xl" : "text-2xl"}`}>
        Haven
      </span>
    </span>
  );
}
