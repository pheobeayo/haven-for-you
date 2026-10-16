import { ArrowDown, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/lang";
import marketPhoto from "@/assets/welcome-market.jpg";

export function WelcomeHero({ account = false, onStart }: { account?: boolean; onStart: () => void }) {
  const pcm = useLang().lang === "pcm";
  return <>
    <section className="welcome-hero relative isolate overflow-hidden bg-primary text-primary-foreground">
      <img src={marketPhoto} width={1536} height={1024} alt={pcm ? "Trader and customer dey check phone together for market" : "A Nigerian trader and customer checking a phone together at the market"} className="welcome-photo absolute inset-0 h-full w-full object-cover" />
      <div className="welcome-shade absolute inset-0" />
      <div className="container-app relative flex h-full items-center">
        <div className="welcome-copy max-w-lg py-12">
          <p className="mb-5 flex items-center gap-2 text-sm font-bold text-footer-accent"><Sparkles size={17} aria-hidden />{pcm ? "FOR YOUR MONEY. FOR YOUR PEACE OF MIND." : "YOUR MONEY. YOUR PEACE OF MIND."}</p>
          <h1 className="welcome-title font-extrabold leading-[1.13]">Shine Your Eye<span className="text-footer-accent">.</span></h1>
          <p className="mt-5 max-w-sm text-2xl font-bold leading-snug">{pcm ? "Check am before you pay or send goods." : "Check before you pay or send goods."}</p>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-primary-foreground/90">{pcm ? "Fake alert? Strange link? Job wey look too sweet? Pause small. Make we check am together." : "A strange alert. A tempting offer. A link you’re not sure about. Take a breath. Let’s check it together."}</p>
          <Button onClick={onStart} size="lg" className="tap mt-7 bg-accent px-6 text-base font-bold text-accent-foreground hover:bg-accent/90">{account ? pcm ? "Make we start" : "Get started" : pcm ? "Check a message" : "Check a message"}<ArrowUpRight aria-hidden /></Button>
          <p className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/90"><ShieldCheck size={16} aria-hidden />{pcm ? "No PIN. No OTP. No wahala." : "No PINs. No OTPs. No pressure."}</p>
        </div>
      </div>
      <span className="welcome-caption absolute bottom-6 right-8 hidden items-center gap-2 text-sm font-bold lg:flex"><span className="h-2 w-2 rounded-full bg-accent" />{pcm ? "For every hustle. For every home." : "For every hustle. For every home."}</span>
    </section>
    <div className="border-b border-border bg-card">
      <div className="container-app flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5 text-sm font-bold text-primary">
        <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-primary" aria-hidden />{pcm ? "Made for Naija 🇳🇬" : "Made for Nigeria 🇳🇬"}</span>
        <span>{pcm ? "Bank alerts · WhatsApp · Links" : "Bank alerts · WhatsApp · Links"}</span>
        <span className="hidden items-center gap-2 sm:flex">English & Pidgin<ArrowDown size={16} aria-hidden /></span>
      </div>
    </div>
  </>;
}