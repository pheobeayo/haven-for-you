import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AuthShell,
  Field,
  FormMessage,
  SelectField,
  SubmitButton,
  authErrorMessage,
  connectionErrorMessage,
} from "@/components/haven/AuthForm";
import { AccountTypeSwitch } from "@/components/haven/AccountTypeSwitch";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/lang";
import {
  NIGERIAN_STATES,
  ORGANISATION_TYPES,
  PRIVACY_NOTICE_URL,
  WORK_ROLES,
  accountTypeOf,
  type AccountType,
} from "@/lib/site";

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): { type?: AccountType } =>
    search["type"] === "organisation" ? { type: "organisation" } : {},
  head: () => ({
    meta: [
      { title: "Create an account: Haven" },
      {
        name: "description",
        content: "An optional free account for people and organisations who support children.",
      },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const t = useT();
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const accountType = accountTypeOf(Route.useSearch().type);
  const isOrg = accountType === "organisation";
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Someone already signed in goes to their account instead.
  useEffect(() => {
    if (!loading && user) void nav({ to: "/account", replace: true });
  }, [user, loading, nav]);

  function chooseType(type: AccountType) {
    setRole("");
    void nav({ to: "/signup", search: type === "organisation" ? { type } : {}, replace: true });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            account_type: accountType,
            display_name: name.trim(),
            role,
            organisation: organisation.trim(),
            state,
          },
          emailRedirectTo: `${window.location.origin}/account`,
        },
      });
      if (error) setMessage(authErrorMessage(error.message, t));
      else if (data.session) void nav({ to: "/account" });
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
        art="circle"
        title={t("Check your email", "Check your email")}
        intro={t(
          "Open the link we sent you to confirm your account.",
          "Open di link wey we send to confirm your account.",
        )}
      >
        <Link to="/signin" className="font-bold text-primary underline underline-offset-4">
          {t("Go to sign in", "Go sign in")}
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      art="circle"
      title={t("Create an account", "Open account")}
      intro={t(
        "For people and organisations who support children. You do not need an account to get help from Haven.",
        "For people and organisations wey dey support pikin. You no need account to get help from Haven.",
      )}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AccountTypeSwitch value={accountType} onChange={chooseType} />
        {isOrg && (
          <Field
            label={t("Organisation name", "Organisation name")}
            required
            maxLength={120}
            autoComplete="organization"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          />
        )}
        {isOrg && (
          <SelectField
            label={t("Type of organisation", "Type of organisation")}
            required
            placeholder={t("Choose a type", "Choose type")}
            options={ORGANISATION_TYPES}
            value={role}
            onChange={setRole}
          />
        )}
        <Field
          label={isOrg ? t("Contact person", "Contact person") : t("Your name", "Your name")}
          required
          maxLength={80}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {!isOrg && (
          <SelectField
            label={t("Your role", "Your role")}
            required
            placeholder={t("Choose your role", "Choose your role")}
            options={WORK_ROLES}
            value={role}
            onChange={setRole}
          />
        )}
        {!isOrg && (
          <Field
            label={t("Organisation (optional)", "Organisation (optional)")}
            maxLength={120}
            autoComplete="organization"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          />
        )}
        <SelectField
          label={t("State", "State")}
          required
          placeholder={t("Choose your state", "Choose your state")}
          options={NIGERIAN_STATES}
          value={state}
          onChange={setState}
        />
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
          minLength={8}
          autoComplete="new-password"
          hint={t("Use at least 8 characters.", "Use at least 8 characters.")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label className="flex gap-3 leading-snug">
          <input
            type="checkbox"
            required
            checked={adult}
            onChange={(e) => setAdult(e.target.checked)}
            className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--primary)]"
          />
          <span>
            {isOrg
              ? t(
                  "I am 18 or older, I can register this organisation, and I accept the ",
                  "I don reach 18, I fit register dis organisation, and I accept di ",
                )
              : t("I am 18 or older, and I accept the ", "I don reach 18, and I accept di ")}
            <Link to="/terms" className="font-bold underline underline-offset-2">
              {t("terms", "terms")}
            </Link>
            {t(" and ", " and ")}
            <a
              href={PRIVACY_NOTICE_URL}
              target="_blank"
              rel="noreferrer"
              className="font-bold underline underline-offset-2"
            >
              {t("privacy notice", "privacy notice")}
            </a>
            .
          </span>
        </label>
        <FormMessage>{message}</FormMessage>
        <SubmitButton busy={busy}>
          {busy
            ? t("Creating your account", "We dey open your account")
            : t("Create account", "Open account")}
        </SubmitButton>
      </form>
      <p className="mt-5">
        {t("Already have an account? ", "You get account already? ")}
        <Link to="/signin" className="font-bold text-primary underline underline-offset-4">
          {t("Sign in", "Sign in")}
        </Link>
      </p>
    </AuthShell>
  );
}
