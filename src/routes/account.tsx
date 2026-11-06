import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AuthShell, Field, SelectField, SubmitButton } from "@/components/haven/AuthForm";
import { ContactList } from "@/components/haven/ContactList";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { deleteAccount } from "@/lib/account.functions";
import { useT } from "@/lib/lang";
import { NIGERIAN_STATES, WORK_ROLES, coverageForState } from "@/lib/site";

export const Route = createFileRoute("/account")({
  ssr: false,
  head: () => ({ meta: [{ title: "My account: Haven" }] }),
  component: Account,
});

function Account() {
  const t = useT();
  const nav = useNavigate();
  const remove = useServerFn(deleteAccount);
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [state, setState] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!loading && !user) void nav({ to: "/signin", replace: true });
    const meta = user?.user_metadata ?? {};
    setName(String(meta["display_name"] ?? ""));
    setRole(String(meta["role"] ?? ""));
    setOrganisation(String(meta["organisation"] ?? ""));
    setState(String(meta["state"] ?? ""));
  }, [user, loading, nav]);

  if (!user) return null;

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: name.trim(), role, organisation: organisation.trim(), state },
    });
    setNotice(
      error
        ? t("Your changes were not saved. Try again.", "We no fit save am. Try again.")
        : t("Your details are saved.", "We don save your details."),
    );
    setBusy(false);
  }

  async function onSignOut() {
    await supabase.auth.signOut();
    void nav({ to: "/", replace: true });
  }

  async function onDelete() {
    setBusy(true);
    setNotice(null);
    try {
      const { ok } = await remove();
      if (!ok) throw new Error("delete failed");
      await supabase.auth.signOut();
      void nav({ to: "/", replace: true });
    } catch {
      setNotice(
        t("Your account was not deleted. Try again.", "We no fit delete your account. Try again."),
      );
      setBusy(false);
    }
  }

  return (
    <AuthShell
      art="circle"
      title={name ? t(`Welcome, ${name}`, `Welcome, ${name}`) : t("My account", "My account")}
      intro={t(
        "Your account holds only these details. Concerns you enter in Haven are never saved here or linked to you.",
        "Your account hold only dis details. Wetin you enter for Haven no dey save here and e no dey join you.",
      )}
    >
      <form onSubmit={onSave} className="space-y-4">
        <Field
          label={t("Your name", "Your name")}
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <SelectField
          label={t("Your role", "Your role")}
          required
          placeholder={t("Choose your role", "Choose your role")}
          options={WORK_ROLES}
          value={role}
          onChange={setRole}
        />
        <Field
          label={t("Organisation (optional)", "Organisation (optional)")}
          maxLength={120}
          value={organisation}
          onChange={(e) => setOrganisation(e.target.value)}
        />
        <SelectField
          label={t("State", "State")}
          required
          placeholder={t("Choose your state", "Choose your state")}
          options={NIGERIAN_STATES}
          value={state}
          onChange={setState}
        />
        {notice && (
          <p role="status" className="rounded-md bg-steady-soft p-3 font-bold text-steady">
            {notice}
          </p>
        )}
        <SubmitButton busy={busy}>{t("Save details", "Save details")}</SubmitButton>
      </form>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-extrabold text-primary">
          {t("Your contacts", "Your contacts")}
        </h2>
        <ContactList
          key={state}
          initialPlace={coverageForState(state)}
          topics={["emergency", "child", "sexual_violence", "self_harm", "online"]}
        />
      </section>

      <section className="mt-10 space-y-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={onSignOut}
          className="tap w-full rounded-md border-2 border-primary px-5 font-bold text-primary"
        >
          {t("Sign out", "Sign out")}
        </button>
        {confirmDelete ? (
          <div className="rounded-md bg-urgent-soft p-4">
            <p className="font-bold text-urgent">
              {t("Delete your account for good?", "You wan delete your account forever?")}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className="tap rounded-md bg-urgent px-5 font-bold text-white"
              >
                {t("Delete my account", "Delete my account")}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="tap rounded-md border-2 border-primary px-5 font-bold text-primary"
              >
                {t("Keep my account", "Keep my account")}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="tap font-bold text-urgent underline underline-offset-4"
          >
            {t("Delete my account", "Delete my account")}
          </button>
        )}
      </section>
    </AuthShell>
  );
}
