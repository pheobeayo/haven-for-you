/** The Haven mark: an arched doorway with a warm light inside. */
export function HavenLogo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M6 29V15a10 10 0 0 1 20 0v14"
          fill="none"
          stroke={dark ? "var(--hv-eucalyptus)" : "var(--hv-apricot)"}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="16" cy="21" r="3.4" fill="var(--hv-apricot-deep)" />
      </svg>
      <span
        className={`hv-display text-[26px] font-medium tracking-[-0.01em] ${dark ? "text-[var(--hv-forest)]" : "text-[var(--hv-mist)]"}`}
      >
        Haven
      </span>
    </span>
  );
}
