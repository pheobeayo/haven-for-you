import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AuthShell,
  Field,
  FormMessage,
  SubmitButton,
  authErrorMessage,
} from "@/components/haven/AuthForm";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/lang";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign in: Haven" }] }),
  component: SignIn,
});

function SignIn() {
  const t = useT();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setMessage(authErrorMessage(error.message, t));
      else void nav({ to: "/account" });
    } catch {
      setMessage(
        t(
          "Connection problem. Check your data and try again.",
          "Network wahala. Check your data and try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={t("Sign in", "Sign in")}
      intro={t(
        "For frontline accounts. You can get help without signing in.",
        "For frontline accounts. You fit get help without sign in.",
      )}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label={t("Email", "Email")}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label={t("Password", "Password")}
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormMessage>{message}</FormMessage>
        <SubmitButton busy={busy}>
          {busy ? t("Signing in", "We dey sign you in") : t("Sign in", "Sign in")}
        </SubmitButton>
      </form>
      <div className="mt-5 space-y-2">
        <p>
          <Link
            to="/forgot-password"
            className="font-bold text-primary underline underline-offset-4"
          >
            {t("Forgot your password?", "You forget your password?")}
          </Link>
        </p>
        <p>
          {t("New here? ", "You new here? ")}
          <Link to="/signup" className="font-bold text-primary underline underline-offset-4">
            {t("Create a frontline account", "Open frontline account")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
