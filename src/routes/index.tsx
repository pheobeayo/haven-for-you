import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Eye, Link2, Loader2, MessageSquareText, SearchCheck, ShieldCheck, X } from "lucide-react";
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

const EXAMPLES = [
  {
    label: "Fake credit alert",
    text: "Acct: 01**89 Credit: NGN50,000.00 Desc: TRF/OLUWASEUN Bal: NGN52,310.55. Your BVN has been suspended. Verify now at http://gtb-verify.cc to avoid account closure.",
  },
  {
    label: "Job offer fee",
    text: "CONGRATULATIONS! You have been selected for the Dangote Graduate Trainee role. Salary NGN350,000/month. To secure your slot, pay a refundable registration fee of NGN15,000 to 0123456789 Opay within 24 hours.",
  },
  {
    label: "Crypto airdrop",
    text: "Binance is giving away 0.5 BTC to the first 500 Nigerians! Connect your wallet at binance-airdrop.top and pay a small gas fee of $20 to claim your reward. Offer ends tonight!",
  },
];

const STEPS = [
  { Icon: MessageSquareText, title: "1. Paste or snap", body: "Add the message, screenshot or link." },
  { Icon: SearchCheck, title: "2. We check it", body: "AI looks for scam tricks." },
  { Icon: ShieldCheck, title: "3. You decide", body: "See the verdict before you pay." },
];

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
    { id: "text", label: "Paste message", Icon: MessageSquareText },
    { id: "photo", label: "Upload screenshot", Icon: Camera },
    { id: "link", label: "Link or wallet", Icon: Link2 },
  ];

  return (
    <div className="min-h-screen pb-12">
      <AppHeader />
      <main className="mx-auto max-w-xl space-y-5 px-4">
        <div className="text-center">
          <h1 className="flex items-center justify-center gap-2 text-4xl font-extrabold leading-tight">
            <Eye className="h-9 w-9 shrink-0 text-primary" aria-hidden />
            Shine Your Eye
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">Check before you pay or send goods.</p>
        </div>

        <div className="rounded-2xl border-2 border-foreground bg-card p-3 shadow-[4px_4px_0_0_var(--foreground)]">
          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="What do you want to check?">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={mode === id}
                onClick={() => { setMode(id); setError(null); }}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border-2 text-sm font-bold leading-tight ${mode === id ? "border-foreground bg-primary text-primary-foreground" : "border-input bg-secondary text-secondary-foreground"}`}
              >
                <Icon className="h-6 w-6 shrink-0" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3">
            {mode === "text" && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                aria-label="Paste the message or alert"
                placeholder="Paste the SMS, WhatsApp message or email here"
                className="w-full rounded-xl border-2 border-input bg-background p-4 text-lg focus:border-ring focus:outline-none"
              />
            )}

            {mode === "link" && (
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                inputMode="url"
                aria-label="Website link or crypto address"
                placeholder="https://... or wallet address"
                className="tap w-full rounded-xl border-2 border-input bg-background px-4 text-lg focus:border-ring focus:outline-none"
              />
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
                    <img src={image} alt="Your screenshot" className="max-h-80 w-full rounded-xl border-2 border-foreground bg-background object-contain" />
                    <button onClick={() => setImage(null)} aria-label="Remove screenshot" className="absolute right-2 top-2 grid h-12 w-12 place-items-center rounded-full bg-foreground text-background">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()} className="flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground bg-background text-lg font-bold">
                    <Camera className="h-10 w-10" aria-hidden />
                    Choose screenshot
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="mt-3 text-sm text-muted-foreground">Never share your PIN, password, OTP or full account number. We will never ask for them.</p>

          <button
            onClick={onCheck}
            disabled={!ready || busy}
            className="tap mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-accent text-xl font-extrabold text-accent-foreground disabled:opacity-50"
          >
            {busy ? (<><Loader2 className="h-6 w-6 animate-spin" /> Checking…</>) : "Check it"}
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => { setMode("text"); setText(ex.text); setError(null); }}
              className="tap rounded-full border-2 border-foreground bg-secondary px-4 text-base font-bold text-secondary-foreground"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {error && (
          <div role="alert" className="rounded-2xl border-2 border-careful bg-careful-soft p-4 text-lg">
            {error}
          </div>
        )}

        <div ref={resultRef}>
          {result && <ResultCard result={result} />}
          {result && (
            <details className="mt-3 rounded-2xl border-2 border-foreground bg-card p-4">
              <summary className="tap flex items-center text-base font-bold">Raw result (for testing)</summary>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(result, null, 2)}</pre>
            </details>
          )}
          {result && !user && <p className="mt-3 text-center text-base text-muted-foreground">Sign in to save your checks.</p>}
        </div>

        <section aria-label="How it works" className="rounded-2xl border-2 border-foreground bg-card p-4">
          <h2 className="text-xl font-extrabold">How it works</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {STEPS.map(({ Icon, title, body }) => (
              <div key={title} className="text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <p className="mt-2 text-sm font-bold leading-tight">{title}</p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
