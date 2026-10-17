import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useLang } from "@/lib/lang";

/** Inline sign-up / sign-in sheet shown when a signed-out user tries to check. */
export function AuthSheet({ open, onOpenChange, onBeforeRedirect }: { open: boolean; onOpenChange: (o: boolean) => void; onBeforeRedirect?: () => void }) {
  const pcm = useLang().lang === "pcm";
  const t = (en: string, p: string) => (pcm ? p : en);
  const [signup, setSignup] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  function friendly(m: string) {
    if (/invalid login/i.test(m)) return t("Email or password is incorrect. Please try again.", "Email or password no correct. Abeg try again.");
    if (/confirm/i.test(m)) return t("Confirm your email first. Check your inbox for the link.", "Confirm your email first. Check your inbox for di link.");
    if (/rate|too many/i.test(m)) return t("Too many attempts. Please wait a little and try again.", "You don try plenty times. Wait small, then try again.");
    if (/password/i.test(m)) return t("Choose a stronger password with at least 6 characters.", "Choose stronger password wey get at least 6 characters.");
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
        else if (!data.session) { onBeforeRedirect?.(); setConfirmed(true); }
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
      onBeforeRedirect?.();
      try { sessionStorage.setItem("sye-auth-destination", "/"); } catch { /* storage unavailable */ }
      const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
      if (r.error) setMsg(t("Google sign-in did not work. Please try again.", "Google no fit enter your account. Abeg try again."));
    } catch { setMsg(t("Google sign-in did not work. Please try again.", "Google no fit enter your account. Abeg try again.")); }
    finally { lock.current = false; setBusy(false); }
  }
  const input = "tap w-full rounded-lg border-2 border-input bg-card px-4 text-lg focus:border-ring focus:outline-none";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-primary">
            {confirmed ? t("Check your email", "Check your email") : signup ? t("Create a free account to see your result", "Open free account make you see your result") : t("Sign in to see your result", "Enter your account make you see your result")}
          </DialogTitle>
          <DialogDescription className="text-base">
            {confirmed ? t("Open the confirmation link in your email, then sign in to see your result.", "Open di confirmation link for your email, then enter your account to see your result.") : t("What you entered is kept safe here.", "Wetin you put still dey here.")}
          </DialogDescription>
        </DialogHeader>
        {confirmed ? (
          <Button className="tap w-full text-lg" onClick={() => { setConfirmed(false); setSignup(false); setPw(""); }}>{t("Back to sign in", "Go back to enter account")}</Button>
        ) : (
          <div className="space-y-4">
            <Button variant="outline" disabled={busy} onClick={google} className="tap w-full text-lg">{t("Continue with Google", "Continue with Google")}</Button>
            <form onSubmit={submit} className="space-y-4">
              {signup && <label className="block space-y-1 font-bold"><span>{t("Your name", "Your name")}</span><input className={input} required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="nickname" /></label>}
              <label className="block space-y-1 font-bold"><span>{t("Email", "Your email")}</span><input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
              <label className="block space-y-1 font-bold"><span>{t("Password for this app", "Password for dis app")}</span><input className={input} type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={signup ? "new-password" : "current-password"} /></label>
              <Button type="submit" disabled={busy} className="tap w-full text-lg font-bold">{busy && <Loader2 className="animate-spin" aria-hidden />}{busy ? t("Please wait…", "Wait small…") : signup ? t("Create account", "Open account") : t("Sign in", "Enter account")}</Button>
            </form>
            <p className="text-center text-base">
              {signup
                ? <>{t("Already have an account? ", "You don get account before? ")}<button type="button" className="font-bold text-primary underline" onClick={() => { setSignup(false); setMsg(null); }}>{t("Sign in", "Enter your account")}</button></>
                : <>{t("New here? ", "You never get account? ")}<button type="button" className="font-bold text-primary underline" onClick={() => { setSignup(true); setMsg(null); }}>{t("Create an account", "Open account")}</button></>}
            </p>
          </div>
        )}
        {msg && <p role="alert" className="rounded-lg bg-muted p-3 text-base">{msg}</p>}
      </DialogContent>
    </Dialog>
  );
}
