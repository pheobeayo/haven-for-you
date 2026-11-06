import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AuthShell,
  Field,
  FormMessage,
  SubmitButton,
  authErrorMessage,
} from "@/components/haven/AuthForm";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/lang";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Choose a new password: Haven" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const t = useT();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
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
    <AuthShell title={t("Choose a new password", "Choose new password")}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label={t("New password", "New password")}
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          hint={t("Use at least 8 characters.", "Use at least 8 characters.")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormMessage>{message}</FormMessage>
        <SubmitButton busy={busy}>
          {busy ? t("Saving", "We dey save am") : t("Save new password", "Save new password")}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
