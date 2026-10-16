import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Loader2, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { WelcomeHero } from "@/components/WelcomeHero";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useLang } from "@/lib/lang";
import { useAuth } from "@/hooks/use-auth";

function safeDestination(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  const pathname = value.split(/[?#]/)[0] ?? "/";
  return ["/", "/history", "/trends", "/about", "/privacy", "/been-scammed"].includes(pathname) ? value : "/";
}
export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string; mode?: "signup" | "signin" } => ({
    redirect: search['redirect'] === undefined ? undefined : safeDestination(search['redirect']),
    mode: search['mode'] === "signup" ? "signup" : search['mode'] === "signin" ? "signin" : undefined,
  }),
  head: () => ({ meta: [
    { title: "Sign in or create an account — Shine Your Eye" },
    { name: "description", content: "Create an account or sign in to check for scams and keep your private history. English and Nigerian Pidgin." },
    { property: "og:title", content: "Your account — Shine Your Eye" },
    { property: "og:description", content: "Sign in to check before you pay or send goods." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});
function AuthPage() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const redirect = search.redirect ?? "/";
  const { user, loading } = useAuth();
  const pcm = useLang().lang === "pcm";
  const [signup, setSignup] = useState(search.mode === "signup");
  useEffect(() => { if (search.mode) { setSignup(search.mode === "signup"); setMsg(null); } }, [search.mode]);
  useEffect(() => { if (search.mode) document.getElementById("your-account")?.scrollIntoView({ block: "start" }); }, [search.mode]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const t = (en: string, pidgin: string) => pcm ? pidgin : en;
  useEffect(() => {
    if (loading || !user) return;
    let destination = redirect;
    try {
      const stored = sessionStorage.getItem("sye-auth-destination");
      if (stored) { destination = safeDestination(stored); sessionStorage.removeItem("sye-auth-destination"); }
    } catch { /* storage unavailable */ }
    void nav({ to: destination, replace: true });
  }, [loading, user, redirect, nav]);
  function friendly(message: string) {
    if (/invalid login/i.test(message)) return t("Email or password is incorrect. Please try again.", "Email or password no correct. Abeg try again.");
    if (/confirm/i.test(message)) return t("Confirm your email first. Check your inbox for the link.", "Confirm your email first. Check your inbox for di link.");
    if (/rate|too many/i.test(message)) return t("Too many attempts. Please wait a little and try again.", "You don try plenty times. Wait small, then try again.");
    if (/password/i.test(message)) return t("Choose a stronger password with at least 6 characters.", "Choose stronger password wey get at least 6 characters.");
    return t("We could not complete that. Please try again.", "We no fit finish am. Abeg try again.");
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true; setBusy(true); setMsg(null);
    try {
      if (signup) {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: pw, options: { data: { display_name: name.trim() }, emailRedirectTo: window.location.origin + "/auth" } });
        if (error) setMsg(friendly(error.message));
        else if (!data.session) setConfirmed(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
        if (error) setMsg(friendly(error.message));
      }
    } catch { setMsg(t("Connection problem. Check your data and try again.", "Network wahala. Check your data and try again.")); }
    finally { lock.current = false; setBusy(false); }
  }
  async function google() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMsg(null);
    try {
      try { sessionStorage.setItem("sye-auth-destination", redirect); } catch { /* storage unavailable */ }
      const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
      if (r.error) setMsg(t("Google sign-in did not work. Please try again.", "Google no fit enter your account. Abeg try again."));
    } catch { setMsg(t("Google sign-in did not work. Please try again.", "Google no fit enter your account. Abeg try again.")); }
    finally { lock.current = false; setBusy(false); }
  }
  const input = "tap w-full rounded-lg border-2 border-input bg-card px-4 text-lg focus:border-ring focus:outline-none";
  return <div className="min-h-screen pb-12">
    <AppHeader />
    <WelcomeHero account onStart={() => document.getElementById("your-account")?.scrollIntoView({ behavior: "smooth", block: "start" })} />
    <main id="your-account" className="container-app grid scroll-mt-6 gap-8 py-12 lg:grid-cols-2 lg:gap-20 lg:py-16">
      <div className="pt-2">
        <p className="mb-3 text-sm font-bold text-primary">{t("A LITTLE PAUSE. A SMARTER CHOICE.", "PAUSE SMALL. CHOOSE WISE.")}</p>
        <h2 className="max-w-md text-3xl font-bold leading-tight text-primary">{t("Your hustle deserves protecting.", "Your hustle deserve protection.")}</h2>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">{t("For your shop, your family, and the money you worked hard for.", "For your shop, your family and di money wey you work hard for.")}</p>
        <div className="mt-7 divide-y divide-border">
          {[
            [t("Check the message", "Check di message"), t("Bank alerts, job offers and suspicious links.", "Bank alerts, job offers and strange links.")],
            [t("Understand the warning signs", "Understand di warning signs"), t("Clear answers in English or Pidgin.", "Clear answer for English or Pidgin.")],
            [t("Take your next step with care", "Take your next step with care"), t("Simple advice. The final decision is yours.", "Simple advice. Na you get final say.")],
          ].map(([title, body], i) => <div key={title} className="flex gap-4 py-5"><span className="pt-1 text-sm font-bold text-careful">0{i + 1}</span><div><h3 className="text-lg font-bold text-primary">{title}</h3><p className="mt-1 text-muted-foreground">{body}</p></div><ArrowUpRight className="ml-auto shrink-0 text-primary" size={20} aria-hidden /></div>)}
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck size={18} aria-hidden />{t("Always confirm payments in your bank app.", "Always confirm payment for your bank app.")}</p>
      </div>
      <div className="account-panel space-y-5 rounded-lg border border-border bg-card p-5 sm:p-8">
      <p className="text-sm font-bold text-careful">{t("WELCOME TO SHINE YOUR EYE", "WELCOME TO SHINE YOUR EYE")}</p>
      <h1 className="text-3xl font-extrabold text-primary">{confirmed ? t("Check your email", "Check your email") : signup ? t("Create account", "Open account") : t("Sign in", "Enter your account")}</h1>
      {confirmed ? <>
        <p className="text-lg">{t("Open the confirmation link in your email, then sign in to start checking.", "Open di confirmation link for your email, then enter your account to start checking.")}</p>
        <Button className="tap w-full text-lg" onClick={() => { setConfirmed(false); setSignup(false); setPw(""); }}>{t("Back to sign in", "Go back to enter account")}</Button>
      </> : <>
        <p className="text-lg text-muted-foreground">{t("Sign in or create an account before you check.", "Enter your account or open new one before you check.")}</p>
        <div role="group" aria-label={t("Account access", "Your account")} className="grid grid-cols-2 gap-2">
          <Button variant={signup ? "outline" : "default"} className="tap text-base" disabled={busy} onClick={() => { setSignup(false); setMsg(null); }}><LogIn aria-hidden />{t("Sign in", "Enter account")}</Button>
          <Button variant={signup ? "default" : "outline"} className="tap text-base" disabled={busy} onClick={() => { setSignup(true); setMsg(null); }}><UserPlus aria-hidden />{t("Create account", "Open account")}</Button>
        </div>
        <Button variant="outline" disabled={busy} onClick={google} className="tap w-full text-lg">{t("Continue with Google", "Continue with Google")}</Button>
        <form onSubmit={submit} className="space-y-4">
          {signup && <label className="block space-y-1 font-bold"><span>{t("Your name", "Your name")}</span><input className={input} required maxLength={80} value={name} onChange={e => setName(e.target.value)} autoComplete="nickname" /></label>}
          <label className="block space-y-1 font-bold"><span>{t("Email", "Your email")}</span><input className={input} type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
          <label className="block space-y-1 font-bold"><span>{t("Password for this app", "Password for dis app")}</span><input className={input} type="password" required minLength={6} value={pw} onChange={e => setPw(e.target.value)} autoComplete={signup ? "new-password" : "current-password"} /></label>
          {signup && <p className="text-sm text-muted-foreground">{t("Use at least 6 characters. We’ll email you a confirmation link.", "Use at least 6 characters. We go send confirmation link to your email.")}</p>}
          <Button type="submit" disabled={busy} className="tap w-full text-lg font-bold">{busy && <Loader2 className="animate-spin" aria-hidden />}{busy ? t("Please wait…", "Wait small…") : signup ? t("Create account", "Open account") : t("Sign in", "Enter account")}</Button>
        </form>
      </>}
      {msg && <p role="alert" className="rounded-lg bg-muted p-3 text-base">{msg}</p>}
      </div>
    </main>
  </div>;
}
