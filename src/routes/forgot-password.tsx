import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AuthShell,
  Field,
  FormMessage,
  SubmitButton,
  connectionErrorMessage,
} from "@/components/haven/AuthForm";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/lang";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset your password: Haven" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error)
        setMessage(
          t(
            "That did not work. Wait a few minutes and try again.",
            "E no work. Wait small and try again.",
          ),
        );
      else setSent(true);
    } catch (error) {
      setMessage(connectionErrorMessage(error, t));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <AuthShell
        title={t("Check your email", "Check your email")}
        intro={t(
          "If that email has an account, we have sent a reset link.",
          "If dat email get account, we don send reset link.",
        )}
      >
        <Link to="/signin" className="font-bold text-primary underline underline-offset-4">
          {t("Back to sign in", "Go back to sign in")}
        </Link>
      </AuthShell>
    );
  }
  return (
    <AuthShell
      title={t("Reset your password", "Reset your password")}
      intro={t(
        "Enter your email and we will send you a link.",
        "Put your email and we go send you link.",
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
        <FormMessage>{message}</FormMessage>
        <SubmitButton busy={busy}>
          {busy
            ? t("Sending the link", "We dey send di link")
            : t("Send reset link", "Send reset link")}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
