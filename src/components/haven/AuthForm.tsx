import type { InputHTMLAttributes, ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SideArt, type ArtVariant } from "@/components/haven/SideArt";

export const inputClass =
  "tap w-full rounded-md border-2 border-input bg-card px-3 text-lg focus:border-ring focus:outline-none";

export function AuthShell({
  title,
  intro,
  art = "doorway",
  children,
}: {
  title: string;
  intro?: string;
  art?: ArtVariant;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen pb-12">
      <AppHeader />
      <main className="container-app grid gap-16 py-8 md:py-12 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold leading-tight text-primary md:text-4xl">
            {title}
          </h1>
          {intro && <p className="mt-3 text-lg leading-relaxed">{intro}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <SideArt variant={art} />
      </main>
    </div>
  );
}

export function Field({
  label,
  hint,
  ...input
}: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block font-bold">
      <span>{label}</span>
      <input className={`${inputClass} mt-1 font-normal`} {...input} />
      {hint && <span className="mt-1 block text-sm font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder: string;
}) {
  return (
    <label className="block font-bold">
      <span>{label}</span>
      <select
        className={`${inputClass} mt-1 font-normal`}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FormMessage({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-md bg-soon-soft p-3 font-bold text-soon">
      {children}
    </p>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="tap w-full rounded-md bg-primary px-5 text-lg font-bold text-primary-foreground disabled:cursor-progress"
    >
      {children}
    </button>
  );
}

export function authErrorMessage(message: string, t: (en: string, pcm: string) => string) {
  if (/invalid login/i.test(message))
    return t("The email or password is incorrect.", "Di email or password no correct.");
  if (/confirm/i.test(message))
    return t(
      "Confirm your email first, using the link we sent you.",
      "Confirm your email first with di link wey we send.",
    );
  if (/already/i.test(message))
    return t(
      "An account already uses this email. Sign in instead.",
      "Account don already dey for dis email. Sign in.",
    );
  if (/rate|too many/i.test(message))
    return t(
      "Too many attempts. Wait a few minutes and try again.",
      "You don try plenty times. Wait small and try again.",
    );
  if (/password/i.test(message))
    return t(
      "Choose a stronger password of at least 8 characters.",
      "Choose stronger password wey reach 8 characters.",
    );
  return t("That did not work. Try again.", "E no work. Try again.");
}
