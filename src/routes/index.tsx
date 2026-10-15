import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Link2, Loader2, MessageSquareText, X } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { ResultCard } from "@/components/ResultCard";
import { scanContent, type ScanResult } from "@/lib/scan.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shine Your Eye — Check for scams before you pay" },
      { name: "description", content: "Paste a message, screenshot or link. Find out if it is a scam before you send money or goods." },
      { property: "og:title", content: "Shine Your Eye — Free scam checker for Nigerians" },
      { property: "og:description", content: "Check bank alerts, WhatsApp messages and links before you send money." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Mode = "text" | "photo" | "link";

async function compress(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const max = 1280;
  const s = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * s);
  c.height = Math.round(img.height * s);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.75);
}

function Index() {
  const scan = useServerFn(scanContent);
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const ready = mode === "text" ? text.trim() : mode === "link" ? link.trim() : image;

  async function onCheck() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const payload = mode === "text" ? { text } : mode === "link" ? { link } : { imageDataUrl: image! };
      const r = await scan({ data: payload });
      if (!r.ok) return setError(r.message);
      setResult(r.result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      if (user) {
        const preview = mode === "text" ? text.slice(0, 140) : mode === "link" ? link.slice(0, 140) : "Screenshot";
        await supabase.from("scans").insert({
          user_id: user.id,
          input_kind: mode,
          input_preview: preview,
          verdict: r.result.verdict,
          risk_score: r.result.risk_score,
          scam_type: r.result.scam_type,
          result: r.result as any,
        });
      }
    } catch {
      setError("Network problem. Check your data and try again.");
    } finally {
      setBusy(false);
    }
  }

  const tabs: { id: Mode; label: string; Icon: typeof Camera }[] = [
    { id: "text", label: "Message", Icon: MessageSquareText },
    { id: "photo", label: "Screenshot", Icon: Camera },
    { id: "link", label: "Link", Icon: Link2 },
  ];

  return (
    <div className="min-h-screen pb-12">
      <AppHeader />
      <main className="mx-auto max-w-xl space-y-5 px-4">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">Before you pay,<br />shine your eye.</h1>
          <p className="mt-2 text-lg text-muted-foreground">Check any alert, message or link. Free. No sign-up.</p>
        </div>

        <div className="grid grid-cols-3 gap-2" role="tablist">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={mode === id}
              onClick={() => { setMode(id); setError(null); }}
              className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-foreground text-base font-bold ${mode === id ? "bg-primary text-primary-foreground" : "bg-card"}`}
            >
              <Icon className="h-7 w-7" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        {mode === "text" && (
          <label className="block">
            <span className="mb-2 block text-lg font-bold">Paste the message or alert</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="e.g. Acct: 01**89 Credit: NGN50,000 ..."
              className="w-full rounded-2xl border-2 border-input bg-card p-4 text-lg focus:border-ring focus:outline-none"
            />
          </label>
        )}

        {mode === "link" && (
          <label className="block">
            <span className="mb-2 block text-lg font-bold">Website link or crypto address</span>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              inputMode="url"
              placeholder="https://..."
              className="tap w-full rounded-2xl border-2 border-input bg-card px-4 text-lg focus:border-ring focus:outline-none"
            />
          </label>
        )}

        {mode === "photo" && (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setImage(await compress(f).catch(() => null));
                e.target.value = "";
              }}
            />
            {image ? (
              <div className="relative">
                <img src={image} alt="Your screenshot" className="max-h-80 w-full rounded-2xl border-2 border-foreground object-contain bg-card" />
                <button onClick={() => setImage(null)} aria-label="Remove screenshot" className="absolute right-2 top-2 grid h-12 w-12 place-items-center rounded-full bg-foreground text-background">
                  <X className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} className="flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-foreground bg-card text-lg font-bold">
                <Camera className="h-10 w-10" aria-hidden />
                Choose screenshot
              </button>
            )}
          </div>
        )}

        <p className="text-base text-muted-foreground">Never share your PIN, password, OTP or full account number. We will never ask for them.</p>

        <button
          onClick={onCheck}
          disabled={!ready || busy}
          className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-accent text-xl font-extrabold text-accent-foreground border-2 border-foreground disabled:opacity-50"
        >
          {busy ? (<><Loader2 className="h-6 w-6 animate-spin" /> Checking…</>) : "Check it"}
        </button>

        {error && (
          <div role="alert" className="rounded-2xl border-2 border-careful bg-careful-soft p-4 text-lg">
            {error}
          </div>
        )}

        <div ref={resultRef}>
          {result && <ResultCard result={result} />}
          {result && !user && <p className="mt-3 text-center text-base text-muted-foreground">Sign in to save your checks.</p>}
        </div>
      </main>
    </div>
  );
}
