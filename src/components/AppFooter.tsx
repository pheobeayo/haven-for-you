import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import logoAsset from "@/assets/logo-horizontal-white.png.asset.json";
import { useLang } from "@/lib/lang";

const TIPS = [
  ["A credit alert is not money until your bank app shows it.", "Credit alert no be money until your bank app show am."],
  ["Never share your PIN, password or OTP.", "No share your PIN, password or OTP."],
  ["A real job should not ask you to pay to get hired.", "Real work no suppose ask you to pay before dem hire you."],
  ["Pause before paying. Urgency can be a scam trick.", "Wait small before you pay. Rushing you fit be scam trick."],
  ["Call your bank using the number in its app or on your card.", "Call your bank with di number for its app or your card."],
  ["Do not connect your crypto wallet to unfamiliar sites.", "No connect your crypto wallet to site wey you no know."],
  ["Check a website address carefully before trusting it.", "Check website address well before you trust am."],
  ["Confirm a money request by calling someone you know.", "Call di person wey you know to confirm before you send money."],
] as const;

export function AppFooter() {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const pathname = useLocation({ select: (location) => location.pathname });
  const [tip, setTip] = useState(0);
  useEffect(() => {
    setTip(Math.floor(Math.random() * TIPS.length));
  }, [pathname]);
  const linkClass = "flex min-h-12 items-center underline-offset-4 hover:text-footer-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-footer-accent";

  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="container-app grid gap-8 py-10 lg:grid-cols-[1.5fr_1fr_1.2fr_1.3fr] lg:gap-6">
        <div className="min-w-0">
          <Link to="/" aria-label="Shine Your Eye — home" className="inline-flex min-h-12 items-center">
            <img src={logoAsset.url} alt="Shine Your Eye" className="h-9 w-auto max-w-full object-contain md:h-11" />
          </Link>
          <p className="mt-4 text-base leading-relaxed">{pcm ? "Check am before you pay or send goods." : "Check before you pay or send goods."}</p>
          <p className="mt-4 text-sm leading-relaxed text-footer-accent">Made in Nigeria 🇳🇬 for SheBuilds on Lovable 2026</p>
        </div>
        <nav aria-label={pcm ? "App links" : "App"} className="min-w-0">
          <h2 className="mb-2 text-lg font-bold text-footer-accent">App</h2>
          <Link to="/" className={linkClass}>{pcm ? "Check message" : "Check a message"}</Link>
          <Link to="/" hash="how-it-works" hashScrollIntoView className={linkClass}>{pcm ? "How e work" : "How it works"}</Link>
          <Link to="/history" className={linkClass}>{pcm ? "My checks" : "My checks"}</Link>
          <Link to="/" hash="common-scams" hashScrollIntoView className={linkClass}>{pcm ? "Common scams" : "Common scams"}</Link>
          <Link to="/trends" className={linkClass}>{pcm ? "Scam trends" : "Scam trends"}</Link>
        </nav>
        <nav aria-label="Help" className="min-w-0">
          <h2 className="mb-2 text-lg font-bold text-footer-accent">{pcm ? "Help" : "Help"}</h2>
          <Link to="/been-scammed" className={linkClass}>{pcm ? "Dem scam you? Wetin to do now" : "Been scammed? What to do now"}</Link>
          <Link to="/about" className={linkClass}>{pcm ? "About us" : "About"}</Link>
          <Link to="/privacy" className={linkClass}>{pcm ? "Your privacy" : "Privacy"}</Link>
        </nav>
        <div className="min-w-0">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-footer-accent"><ShieldCheck className="h-5 w-5 shrink-0" aria-hidden />{pcm ? "Stay safe" : "Stay safe"}</h2>
          <p className="border-l-2 border-footer-accent pl-4 text-base leading-relaxed">{TIPS[tip]?.[pcm ? 1 : 0]}</p>
        </div>
      </div>
      <div className="border-t border-footer-divider">
        <p className="container-app py-5 text-sm leading-relaxed">{pcm ? "© 2026 Shine Your Eye · Na AI opinion, no be guarantee. Always confirm with your bank." : "© 2026 Shine Your Eye · AI opinion, not a guarantee. Always confirm with your bank."}</p>
      </div>
    </footer>
  );
}