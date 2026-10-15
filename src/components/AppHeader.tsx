import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function AppHeader() {
  const { user } = useAuth();
  return (
    <header className="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
          <Eye className="h-6 w-6" />
        </span>
        <span className="font-display">Shine Your Eye</span>
      </Link>
      <Link
        to={user ? "/history" : "/auth"}
        className="rounded-full border-2 border-foreground px-4 py-2 text-base font-bold"
      >
        {user ? "My checks" : "Sign in"}
      </Link>
    </header>
  );
}
