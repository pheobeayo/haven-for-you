import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { HavenMark } from "@/components/HavenMark";
import { useLang } from "@/lib/lang";

/** Leaves at once and replaces this page in the tab's back history. */
function leaveNow() {
  window.location.replace("https://www.google.com/search?q=weather+today");
}

export function AppHeader() {
  const { lang, setLang } = useLang();
  const pcm = lang === "pcm";
  return (
    <div className="sticky top-0 z-30">
      <header className="border-b border-border bg-card">
        <div className="container-app flex items-center justify-between gap-1 py-2">
          <Link
            to="/"
            aria-label={pcm ? "Haven home" : "Haven home"}
            className="shrink-0 text-primary"
          >
            <HavenMark compact />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <div role="group" aria-label={pcm ? "Language" : "Language"} className="flex">
              {(["en", "pcm"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`min-h-11 px-1.5 text-sm font-bold underline-offset-4 sm:px-2 ${lang === l ? "text-primary underline decoration-2" : "text-muted-foreground"}`}
                >
                  {l === "en" ? "English" : "Pidgin"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={leaveNow}
              className="inline-flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-primary px-2.5 text-sm font-bold text-primary-foreground"
            >
              <X className="hidden h-4 w-4 sm:block" aria-hidden />
              {pcm ? "Comot now" : "Leave now"}
            </button>
          </div>
        </div>
      </header>
      <p className="bg-secondary py-1.5 text-foreground">
        <span className="container-app block text-sm font-bold leading-snug">
          {pcm
            ? "Test version. Professionals never review dis guidance. No use am for real case."
            : "Test version. This guidance is pending professional review. Not for real-world use."}
        </span>
      </p>
    </div>
  );
}
