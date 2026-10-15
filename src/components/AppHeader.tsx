import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function AppHeader() {
  const { user } = useAuth();
  return (
    <header className="container-app flex items-center justify-between gap-3 py-4 2xl:py-6">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
          <Eye className="h-6 w-6" />
        </span>
        <span className="font-display">Shine Your Eye</span>
      </Link>
      <Link
        to={user ? "/history" : "/auth"}
        className="flex min-h-12 shrink-0 items-center rounded-full border-2 border-foreground px-4 text-base font-bold"
      >
        {user ? "My checks" : "Sign in"}
      </Link>
    </header>
  );
}
