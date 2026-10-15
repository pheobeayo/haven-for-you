import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Link2, Loader2, MessageSquareText, SearchCheck, ShieldCheck, X } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { ResultCard } from "@/components/ResultCard";
import { scanContent, type ScanResult } from "@/lib/scan.functions";
import { useAuth } from "@/hooks/use-auth";
import { NETWORKS, WALLET_RE, type Network } from "@/lib/link-checks";
import { useLang } from "@/lib/lang";
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
  { Icon: MessageSquareText, title: "1. Paste or snap", pcmTitle: "1. Paste or snap am", body: "Add the message, screenshot or link.", pcmBody: "Put di message, screenshot or link." },
  { Icon: SearchCheck, title: "2. We check it", pcmTitle: "2. We go check am", body: "AI looks for scam tricks.", pcmBody: "AI go look for scam tricks." },
  { Icon: ShieldCheck, title: "3. You decide", pcmTitle: "3. Na you go decide", body: "See the verdict before you pay.", pcmBody: "See di answer before you pay." },
];

const COMMON_SCAMS = [
  {
    title: "Fake credit alert",
    pcmTitle: "Fake credit alert",
    works: "They send a fake bank alert so you release goods or money.",
    pcmWorks: "Dem go send fake bank alert so you go release goods or money.",
    spot: "Real alerts come from your bank's name, not a phone number. Confirm in your bank app.",
    pcmSpot: "Real alert dey come from your bank name, no be phone number. Confirm am for your bank app.",
  },
  {
    title: "Job offer fee",
    pcmTitle: "Job wey need fee",
    works: "They promise you a job, then ask for a registration or processing fee.",
    pcmWorks: "Dem go promise you work, then ask you to pay registration or processing fee.",
    spot: "A real job never asks you to pay before you start.",
    pcmSpot: "Real work no dey ask you to pay money before you start.",
  },
  {
    title: "BVN/NIN update",
    pcmTitle: "BVN/NIN update",
    works: "They say your BVN or NIN is blocked and send a link to 'fix' it.",
    pcmWorks: "Dem go say your BVN or NIN don block and send link make you 'fix' am.",
    spot: "Banks and government never ask for BVN or NIN through a link.",
    pcmSpot: "Bank or government no go ever ask for BVN or NIN through link.",
  },
  {
    title: "Double your money",
    pcmTitle: "Double your money",
    works: "They promise to double your money fast if you invest with them.",
    pcmWorks: "Dem go promise to double your money sharp sharp if you invest with dem.",
    spot: "Anybody promising sure, quick profit is lying. Real investment has risk.",
    pcmSpot: "Anybody wey promise sure quick profit dey lie. Real investment get risk.",
  },
  {
    title: "Crypto airdrop",
    pcmTitle: "Crypto airdrop",
    works: "They offer free crypto, then ask you to connect your wallet or pay a small fee.",
    pcmWorks: "Dem go offer free crypto, then ask you to connect your wallet or pay small fee.",
    spot: "Free money that needs payment first is a scam. Never connect your wallet to strange sites.",
    pcmSpot: "Free money wey need payment first na scam. No connect your wallet to strange site.",
  },
];

const MAX_TEXT = 5000;
const MAX_FILE = 15 * 1024 * 1024;

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
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [network, setNetwork] = useState<Network | null>(null);
  const isWallet = WALLET_RE.test(link.trim());
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const ready = mode === "text" ? text.trim() : mode === "link" ? link.trim() && (!isWallet || network) : image;
  const busyRef = useRef(false);
  const [canRetry, setCanRetry] = useState(false);

  async function onCheck() {
    if (busyRef.current) return;
    setCanRetry(false);
    if (mode === "text" && text.trim().length < 15) {
      setError(pcm ? "Dis message too short to check. Abeg paste the full message." : "This message is too short to check. Please paste the full message.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const sendText = text.slice(0, MAX_TEXT);
      const payload = mode === "text" ? { text: sendText } : mode === "link" ? { link: link.trim(), network: isWallet ? network! : undefined } : { imageDataUrl: image! };
      const r = await scan({ data: payload as { text?: string; link?: string; imageDataUrl?: string; network?: string } });
      if (!r.ok) {
        setCanRetry(r.code !== "bad_input");
        return setError(r.message);
      }
      setResult(r.result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      if (user) {
        const preview = mode === "text" ? text.slice(0, 120) : mode === "link" ? link.slice(0, 120) : "Screenshot";
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
      setCanRetry(true);
      setError(pcm ? "Network wahala. Check your data and try again." : "Network problem. Check your data and try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function onCheckAnother() {
    setResult(null);
    setError(null);
    setText("");
    setLink("");
    setNetwork(null);
    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const tabs: { id: Mode; label: string; Icon: typeof Camera }[] = [
    { id: "text", label: pcm ? "Paste message" : "Paste message", Icon: MessageSquareText },
    { id: "photo", label: pcm ? "Upload screenshot" : "Upload screenshot", Icon: Camera },
    { id: "link", label: pcm ? "Link or wallet" : "Link or wallet", Icon: Link2 },
  ];

  return (
    <div className="min-h-screen pb-12">
      <AppHeader />
      <main className="container-app space-y-5 md:space-y-8 2xl:space-y-12">
        <div className="grid gap-5 lg:min-h-[80vh] lg:grid-cols-2 lg:items-center lg:gap-12 2xl:gap-16">
        <div className="min-w-0 text-center lg:text-left">
          <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center lg:gap-5">
            <img src="/icon-512.png" alt="" aria-hidden className="h-24 w-24 shrink-0 lg:h-32 lg:w-32 2xl:h-40 2xl:w-40" />
            <h1 className="text-fluid-hero font-extrabold leading-tight text-primary">
              Shine Your Eye
            </h1>
          </div>
          <p className="mt-2 text-lg text-muted-foreground lg:text-xl 2xl:text-2xl">{pcm ? "Check am before you pay or send goods." : "Check before you pay or send goods."}</p>
          <p className="text-fluid-body mt-6 hidden max-w-[65ch] text-muted-foreground lg:block">{pcm ? "No share your PIN, password, OTP or full account number. We no go ever ask you." : "Never share your PIN, password, OTP or full account number. We will never ask for them."}</p>
          <div className="mt-6 hidden flex-nowrap gap-2 lg:flex">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => { setMode("text"); setText(ex.text); setError(null); }}
              className="tap whitespace-nowrap rounded-full border-2 border-foreground bg-secondary px-4 text-base font-bold text-secondary-foreground"
            >
              {ex.label}
            </button>
          ))}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border-2 border-foreground bg-card p-3 md:p-4 2xl:p-6 shadow-[4px_4px_0_0_var(--foreground)]">
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
                placeholder={pcm ? "Paste di SMS, WhatsApp message or email for here" : "Paste the SMS, WhatsApp message or email here"}
                className="block w-full max-w-[720px] mx-auto rounded-xl border-2 border-input bg-background p-4 text-lg focus:border-ring focus:outline-none"
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
            {mode === "link" && isWallet && (
              <fieldset className="mt-3">
                <legend className="text-base font-bold">{pcm ? "Dis one look like wallet address. Which network?" : "This looks like a wallet address. Which network?"}</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {NETWORKS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={network === n}
                      onClick={() => setNetwork(n)}
                      className={`tap rounded-xl border-2 text-base font-bold ${network === n ? "border-foreground bg-primary text-primary-foreground" : "border-input bg-secondary text-secondary-foreground"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </fieldset>
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
                    {pcm ? "Choose screenshot" : "Choose screenshot"}
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="mt-3 text-sm text-muted-foreground lg:hidden">{pcm ? "No share your PIN, password, OTP or full account number. We no go ever ask you." : "Never share your PIN, password, OTP or full account number. We will never ask for them."}</p>

          <button
            onClick={onCheck}
            disabled={!ready || busy}
            className="tap mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-primary text-xl font-extrabold text-primary-foreground disabled:opacity-50"
          >
            {busy ? (<><Loader2 className="h-6 w-6 animate-spin" /> {pcm ? "We dey check…" : "Checking…"}</>) : pcm ? "Check am" : "Check it"}
          </button>
        </div>

        </div>

        <div className="flex flex-wrap justify-center gap-2 md:grid md:grid-cols-3 lg:hidden">
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
          {result && <ResultCard result={result} onCheckAnother={onCheckAnother} />}
          {result && (
            <details className="mt-3 rounded-2xl border-2 border-foreground bg-card p-4">
              <summary className="tap flex items-center text-base font-bold">Raw result (for testing)</summary>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(result, null, 2)}</pre>
            </details>
          )}
          {result && !user && <p className="mt-3 text-center text-base text-muted-foreground">{pcm ? "Sign in to save your checks." : "Sign in to save your checks."}</p>}
        </div>

        <section aria-label="How it works" className="rounded-2xl border-2 border-foreground bg-card p-4 md:p-6 2xl:p-8">
          <h2 className="text-xl font-extrabold">{pcm ? "How e work" : "How it works"}</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 md:gap-6">
            {STEPS.map(({ Icon, title, pcmTitle, body, pcmBody }) => (
              <div key={title} className="text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <p className="mt-2 text-sm font-bold leading-tight md:text-lg">{pcm ? pcmTitle : title}</p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground md:text-base">{pcm ? pcmBody : body}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Common scams in Nigeria">
          <h2 className="text-xl font-extrabold">{pcm ? "Common scams for Nigeria" : "Common scams in Nigeria"}</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {COMMON_SCAMS.map((s) => (
              <article key={s.title} className="rounded-2xl border-2 border-foreground bg-card p-4">
                <h3 className="text-lg font-extrabold">{pcm ? s.pcmTitle : s.title}</h3>
                <p className="mt-2 text-base leading-snug">{pcm ? s.pcmWorks : s.works}</p>
                <p className="mt-2 border-l-4 border-primary pl-2 text-base font-semibold leading-snug text-muted-foreground">{pcm ? s.pcmSpot : s.spot}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
