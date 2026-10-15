import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/lib/lang";

export function AppHeader() {
  const { user } = useAuth();
  const { lang, setLang } = useLang();
  return (
    <header className="container-app flex flex-wrap items-center justify-between gap-3 py-4 2xl:py-6">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
          <Eye className="h-6 w-6" />
        </span>
        <span className="font-display">Shine Your Eye</span>
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
          {user ? (lang === "pcm" ? "My checks" : "My checks") : lang === "pcm" ? "Sign in" : "Sign in"}
        </Link>
      </div>
    </header>
  );
}
