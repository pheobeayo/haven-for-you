import { Link } from "@tanstack/react-router";
import { HavenMark } from "@/components/HavenMark";
import { useT } from "@/lib/lang";
import { COMPANY_NAME, PRIVACY_NOTICE_URL } from "@/lib/site";

/** Leaves at once and replaces this page in the tab's back history. */
function leaveNow() {
  window.location.replace("https://www.google.com/search?q=weather+today");
}

export function AppFooter() {
  const t = useT();
  const linkClass =
    "flex min-h-11 items-center underline underline-offset-4 hover:text-accent focus-visible:outline-accent";
  const heading = "mb-1 font-extrabold text-accent";
  return (
    <footer className="on-indigo bg-footer text-footer-foreground">
      <div className="container-app grid gap-8 py-8 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <HavenMark />
          <p className="mt-3 max-w-sm leading-relaxed">
            {t(
              "Help for adults who are worried about a child. Haven is not the police, a doctor or a child protection service.",
              "Help for adults wey dey worry about pikin. Haven no be police, doctor or child protection service.",
            )}
          </p>
        </div>
        <nav aria-label={t("Get help", "Find help")}>
          <p className={heading}>{t("Get help", "Find help")}</p>
          <Link to="/" hash="start" className={linkClass}>
            {t("Start here", "Start here")}
          </Link>
          <Link to="/contacts" className={linkClass}>
            {t("Who can help", "Who fit help")}
          </Link>
        </nav>
        <nav aria-label="Haven">
          <p className={heading}>Haven</p>
          <Link to="/about" className={linkClass}>
            {t("About", "About")}
          </Link>
          <Link to="/safety" className={linkClass}>
            {t("Safety", "Safety")}
          </Link>
          <Link to="/organisations" className={linkClass}>
            {t("For organisations", "For organisations")}
          </Link>
          <Link to="/contact" className={linkClass}>
            {t("Contact us", "Contact us")}
          </Link>
        </nav>
        <nav aria-label={t("Legal", "Legal")}>
          <p className={heading}>{t("Legal", "Legal")}</p>
          <a href={PRIVACY_NOTICE_URL} target="_blank" rel="noreferrer" className={linkClass}>
            {t("Privacy notice (PDF)", "Privacy notice (PDF)")}
          </a>
          <Link to="/terms" className={linkClass}>
            {t("Terms of use", "Terms of use")}
          </Link>
        </nav>
      </div>
      <div className="border-t border-footer-divider">
        <div className="container-app flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-sm">
            {t("If a child is in danger now, call 112.", "If pikin dey for danger now, call 112.")}{" "}
            © 2026 {COMPANY_NAME}
          </p>
          <button
            type="button"
            onClick={leaveNow}
            className="min-h-11 rounded-md border-2 border-white px-4 text-sm font-bold"
          >
            {t("Leave now", "Comot now")}
          </button>
        </div>
      </div>
    </footer>
  );
}
