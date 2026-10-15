import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/lib/lang";
import logoAsset from "@/assets/logo-horizontal.png.asset.json";

export function AppHeader() {
  const { user } = useAuth();
  const { lang, setLang } = useLang();
  return (
    <header className="container-app flex flex-wrap items-center justify-between gap-3 py-4 2xl:py-6">
      <Link to="/" aria-label="Shine Your Eye — home" className="flex items-center">
        <img src={logoAsset.url} alt="Shine Your Eye" className="h-9 w-auto md:h-11" />
      </Link>
      <div className="flex items-center gap-2">
        <div role="group" aria-label="Language" className="flex overflow-hidden rounded-full border-2 border-foreground">
          {(["en", "pcm"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`flex min-h-12 items-center px-3 text-sm font-bold ${lang === l ? "bg-foreground text-background" : "bg-card"}`}
            >
              {l === "en" ? "English" : "Pidgin"}
            </button>
          ))}
        </div>
        <Link
          to={user ? "/history" : "/auth"}
          className="flex min-h-12 shrink-0 items-center rounded-full border-2 border-foreground px-4 text-base font-bold"
        >
          {user ? "My checks" : "Sign in"}
        </Link>
      </div>
    </header>
  );
}
