import { Link } from "@tanstack/react-router";
import { HavenMark } from "@/components/HavenMark";
import { useLang } from "@/lib/lang";

export function AppFooter() {
  const pcm = useLang().lang === "pcm";
  const linkClass =
    "flex min-h-11 items-center underline underline-offset-4 hover:text-accent focus-visible:outline-accent";
  return (
    <footer className="on-indigo bg-footer text-footer-foreground">
      <div className="container-app grid gap-6 py-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <HavenMark />
          <p className="mt-3 max-w-md leading-relaxed">
            {pcm
              ? "Help for adults wey dey worry about pikin. Haven no be police, doctor or child protection service."
              : "Help for adults who are worried about a child. Haven is not the police, a doctor or a child protection service."}
          </p>
        </div>
        <nav aria-label={pcm ? "Pages" : "Pages"}>
          <Link to="/contacts" className={linkClass}>
            {pcm ? "Who fit help" : "Who can help"}
          </Link>
          <Link to="/about" className={linkClass}>
            {pcm ? "About Haven" : "About Haven"}
          </Link>
          <Link to="/privacy" className={linkClass}>
            {pcm ? "Your privacy" : "Your privacy"}
          </Link>
        </nav>
      </div>
      <div className="border-t border-footer-divider">
        <p className="container-app py-4 text-sm">
          {pcm
            ? "If pikin dey for danger now, call 112."
            : "If a child is in danger now, call 112."}
        </p>
      </div>
    </footer>
  );
}
