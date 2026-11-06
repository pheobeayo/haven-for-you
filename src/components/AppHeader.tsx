import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { HavenMark } from "@/components/HavenMark";
import { useAuth } from "@/hooks/use-auth";
import { useLang, useT } from "@/lib/lang";

export function AppHeader() {
  const { lang, setLang } = useLang();
  const { user } = useAuth();
  const t = useT();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const linkClass = "flex min-h-11 items-center font-bold text-primary hover:underline";
  const links = (
    <>
      <Link to="/" hash="how-it-works" onClick={close} className={linkClass}>
        {t("How it works", "How e dey work")}
      </Link>
      <Link to="/organisations" onClick={close} className={linkClass}>
        {t("For organisations", "For organisations")}
      </Link>
      <Link to="/safety" onClick={close} className={linkClass}>
        {t("Safety", "Safety")}
      </Link>
      <Link to="/about" onClick={close} className={linkClass}>
        {t("About", "About")}
      </Link>
      <Link to={user ? "/account" : "/signin"} onClick={close} className={linkClass}>
        {user ? t("My account", "My account") : t("Sign in", "Sign in")}
      </Link>
    </>
  );
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="container-app flex items-center justify-between gap-1 py-2">
          <Link to="/" aria-label={t("Haven home", "Haven home")} className="shrink-0 text-primary">
            <HavenMark compact />
          </Link>
          <nav aria-label={t("Main", "Main")} className="hidden items-center gap-5 text-sm lg:flex">
            {links}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "pcm" : "en")}
              className="min-h-11 px-1.5 text-sm font-bold text-primary underline underline-offset-4 sm:px-2"
            >
              {lang === "en" ? "Pidgin" : "English"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={t("Menu", "Menu")}
              className="grid h-11 w-9 shrink-0 place-items-center text-primary lg:hidden"
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
            className="container-app border-t border-border py-2 lg:hidden"
          >
            {links}
          </nav>
        )}
      </header>
      <p className="bg-secondary py-1.5 text-foreground">
        <span className="container-app block text-sm font-bold leading-snug">
          {t(
            "Test version. This guidance is pending professional review. Not for real-world use.",
            "Test version. Professionals never review dis guidance. No use am for real case.",
          )}
        </span>
      </p>
    </>
  );
}
