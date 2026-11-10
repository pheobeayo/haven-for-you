import { Link } from "@tanstack/react-router";
import { HavenLogo } from "@/components/haven/HavenLogo";
import { useT } from "@/lib/lang";
import { COMPANY_NAME, PRIVACY_NOTICE_URL } from "@/lib/site";

/** Same inbox as "Work with us" on the landing page. */
const CONTACT_EMAIL = "pheobeayo@gmail.com";

export function AppFooter() {
  const t = useT();
  // TanStack sets data-status="active" on the current link.
  const linkClass =
    "flex min-h-11 items-center gap-2 text-[#e8efea] hover:text-(--hv-apricot) data-[status=active]:font-semibold data-[status=active]:text-(--hv-apricot) data-[status=active]:before:h-1.5 data-[status=active]:before:w-1.5 data-[status=active]:before:rounded-full data-[status=active]:before:bg-(--hv-apricot) data-[status=active]:before:content-['']";

  return (
    <footer className="hv-body bg-(--hv-forest) text-(--hv-on-dark)">
      <div className="mx-auto w-[90%] py-8">
        <div className="flex flex-wrap items-center justify-between gap-5 border-b border-white/15 pb-9">
          <p className="hv-display text-2xl leading-tight text-(--hv-mist) lg:text-[32px] md:text-[32px]">
            {t("If a child is in danger now,", "If pikin dey for danger now,")}{" "}
            <a href="tel:112" className="text-(--hv-apricot) underline underline-offset-4">
              {t("call 112", "call 112")}
            </a>
            .
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
            {t("Privacy notice", "Privacy notice")}
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

        <p className="mt-8 text-[13px] text-[var(--hv-on-dark-muted)]">© 2026 {COMPANY_NAME}</p>
      </div>
    </footer>
  );
}
