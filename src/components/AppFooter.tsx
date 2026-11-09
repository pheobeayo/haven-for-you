import { Link } from "@tanstack/react-router";
import { HavenLogo } from "@/components/haven/HavenLogo";
import { useT } from "@/lib/lang";
import { COMPANY_NAME } from "@/lib/site";

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

        <div className="flex flex-wrap justify-between gap-8 pt-8 text-[15px] leading-relaxed">
          <div className="max-w-md">
            <HavenLogo tone="light" />
            <p className="mt-3">
              {t(
                "Help for adults who are worried about a child. Haven is not the police, a doctor or a child protection service.",
                "Help for adults wey dey worry about pikin. Haven no be police, doctor or child protection service.",
              )}
            </p>
          </div>
          <nav aria-label={t("Footer", "Footer")} className="flex flex-wrap  content-start gap-x-6">
            <div className="">
              <Link to="/" hash="start" activeOptions={{ includeHash: true }} className={linkClass}>
                {t("Start here", "Start here")}
              </Link>
              <Link to="/contacts" className={linkClass}>
                {t("Who can help", "Who fit help")}
              </Link>
            </div>
            <div className="">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Message for Haven")}`}
                className={linkClass}
              >
                {t("Contact us", "Contact us")}
              </a>
              <Link to="/privacy" className={linkClass}>
                {t("Privacy", "Privacy")}
              </Link>
            </div>
            <div className="">
              <Link to="/terms" className={linkClass}>
                {t("Terms of use", "Terms of use")}
              </Link>
            </div>
          </nav>
        </div>

        <p className="mt-8 text-[13px] text-[var(--hv-on-dark-muted)]">© 2026 {COMPANY_NAME}</p>
      </div>
    </footer>
  );
}
