import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useLang } from "@/lib/lang";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const KEY = "sye-install-dismissed";

/** Small mobile-only banner shown when the browser says the app can be installed. */
export function InstallPrompt() {
  const pcm = useLang().lang === "pcm";
  const [evt, setEvt] = useState<BIP | null>(null);

  useEffect(() => {
    if (localStorage.getItem(KEY)) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const on = (e: Event) => { e.preventDefault(); setEvt(e as BIP); };
    const done = () => setEvt(null);
    window.addEventListener("beforeinstallprompt", on);
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("beforeinstallprompt", on); window.removeEventListener("appinstalled", done); };
  }, []);

  if (!evt) return null;
  const dismiss = () => { localStorage.setItem(KEY, "1"); setEvt(null); };
  return (
    <div className="container-app mb-3">
      <div className="flex items-center gap-3 rounded-2xl border-2 border-primary bg-card p-3">
        <img src="/icon-192.png" alt="" aria-hidden className="h-10 w-10 rounded-lg" />
        <p className="min-w-0 flex-1 text-sm font-semibold">
          {pcm ? "Put Shine Your Eye for your phone. Share WhatsApp message enter am straight." : "Add Shine Your Eye to your phone. Share WhatsApp messages straight to it."}
        </p>
        <button
          onClick={async () => { await evt.prompt(); await evt.userChoice; setEvt(null); }}
          className="tap inline-flex items-center gap-1 rounded-xl bg-primary px-3 font-bold text-primary-foreground"
        >
          <Download className="h-4 w-4" aria-hidden /> {pcm ? "Install" : "Install"}
        </button>
        <button onClick={dismiss} aria-label={pcm ? "Close" : "Close"} className="tap inline-flex w-11 items-center justify-center">
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
