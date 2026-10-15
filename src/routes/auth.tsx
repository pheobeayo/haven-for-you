import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Shine Your Eye" },
      { name: "description", content: "Sign in to save your scam checks." },
      { property: "og:title", content: "Sign in — Shine Your Eye" },
      { property: "og:description", content: "Save your scam checks and see them later." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (signup) {
      const { error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin } });
      setMsg(error ? error.message : "Check your email to confirm, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg(error.message);
      else nav({ to: "/history" });
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setMsg("Google sign-in did not work. Please try again.");
    else if (!r.redirected) nav({ to: "/history" });
  }

  const input = "tap w-full rounded-2xl border-2 border-input bg-card px-4 text-lg focus:border-ring focus:outline-none";
  return (
    <div className="min-h-screen pb-12">
      <AppHeader />
      <main className="mx-auto max-w-md space-y-5 px-4">
        <h1 className="text-3xl font-extrabold">{signup ? "Create account" : "Sign in"}</h1>
        <p className="text-lg text-muted-foreground">Only needed to save your checks. Checking is always free without it.</p>
        <button onClick={google} className="tap w-full rounded-2xl border-2 border-foreground bg-card text-lg font-bold">Continue with Google</button>
        <form onSubmit={submit} className="space-y-3">
          <input className={input} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input className={input} type="password" required minLength={6} placeholder="Password for this app" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={signup ? "new-password" : "current-password"} />
          <button disabled={busy} className="tap w-full rounded-2xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-50">
            {signup ? "Create account" : "Sign in"}
          </button>
        </form>
        {msg && <p role="alert" className="rounded-xl bg-muted p-3 text-base">{msg}</p>}
        <button onClick={() => setSignup(!signup)} className="tap w-full text-lg font-bold underline">
          {signup ? "I already have an account" : "New here? Create account"}
        </button>
      </main>
    </div>
  );
}
