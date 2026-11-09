import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { HavenLogo } from "@/components/haven/HavenLogo";
import { useLang, useT } from "@/lib/lang";

const CONTAINER = "mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12";

export function AppHeader() {
  const { lang, setLang } = useLang();
  const t = useT();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  // TanStack sets data-status="active" on the current link. The apricot bar marks it.
  const linkClass =
    "relative flex min-h-11 items-center font-medium text-(--hv-forest) hover:text-(--hv-eucalyptus) after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-(--hv-apricot-deep) after:transition-transform data-[status=active]:font-semibold data-[status=active]:text-(--hv-eucalyptus-deep) data-[status=active]:after:scale-x-100";
  // Both links live on "/", so match the hash too, or both would show as active.
  const hashActive = { includeHash: true } as const;

  const links = (
    <>
      <Link to="/" hash="start" activeOptions={hashActive} onClick={close} className={linkClass}>
        {t("Get help", "Find help")}
      </Link>
      <Link
        to="/"
        hash="organisations"
        activeOptions={hashActive}
        onClick={close}
        className={linkClass}
      >
        {t("For organisations", "For organisations")}
      </Link>
    </>
  );

  const langSwitch = (
    <div
      role="group"
      aria-label={t("Language", "Language")}
      className="inline-flex rounded-full bg-[#e3ebe6] p-1"
    >
      {(["en", "pcm"] as const).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={`min-h-9 rounded-full px-3.5 text-sm font-semibold text-[var(--hv-forest)] transition-colors ${lang === code ? "bg-white shadow-sm" : "hover:bg-white/60"}`}
        >
          {code === "en" ? "English" : "Pidgin"}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <p className="font-hv-body bg-(--hv-forest) px-5 py-2 text-center text-sm leading-snug text-[#e8efea]">
        <strong className="font-semibold text-(--hv-apricot)">
          {t("Test version.", "Test version.")}
        </strong>{" "}
        {t(
          "Guidance is still being reviewed by a child protection professional. Not for real cases yet.",
          "Child protection professional still dey review dis guidance. No use am for real case yet.",
        )}
      </p>

      <header className="hv-body sticky top-0 z-30 border-b border-(--hv-line) bg-[rgba(243,245,241,0.92)] backdrop-blur-md py-3">
        <div className="flex items-center justify-between gap-3 py-3 w-[90%] mx-auto">
          <Link to="/" aria-label={t("Haven home", "Haven home")} className="shrink-0">
            <HavenLogo />
          </Link>

          <nav
            aria-label={t("Main", "Main")}
            className="hidden items-center gap-7 text-[15px] md:flex"
          >
            {links}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block">{langSwitch}</div>

            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={t("Menu", "Menu")}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-(--hv-forest) hover:bg-(--hv-sage) md:hidden"
            >
              {open ? (
                <X className="h-6 w-6" aria-hidden />
              ) : (
                <Menu className="h-6 w-6" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {open && (
          <nav
            id="site-menu"
            aria-label={t("Menu", "Menu")}
            className={`${CONTAINER} border-t border-(--hv-line) pb-4 pt-2 md:hidden`}
          >
            {links}
            <div className="mt-3">{langSwitch}</div>
          </nav>
        )}
      </header>
    </>
  );
}
