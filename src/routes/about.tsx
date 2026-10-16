import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/components/HelpPage";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Shine Your Eye" },
    { name: "description", content: "Shine Your Eye helps Nigerian traders, POS agents and families check messages, screenshots and links for scams." },
    { property: "og:title", content: "About — Shine Your Eye" },
    { property: "og:description", content: "Check before you pay or send goods. A scam checker built for Nigerians." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: About,
});

function About() {
  const pcm = useLang().lang === "pcm";
  return <HelpPage title={pcm ? "About Shine Your Eye" : "About Shine Your Eye"}>
    <section><h2 className="text-xl font-bold text-primary">{pcm ? "Why we dey here" : "Why we’re here"}</h2><p className="mt-2">{pcm ? "Fake credit alerts, job wey ask for fees and crypto scams fit look real. Shine Your Eye help you spot warning signs before you pay or send goods." : "Fake credit alerts, job offers asking for fees and crypto scams can look real. Shine Your Eye helps you spot warning signs before you pay or send goods."}</p></section>
    <section><h2 className="text-xl font-bold text-primary">{pcm ? "Who e dey for" : "Who it’s for"}</h2><p className="mt-2">{pcm ? "For market traders, shop owners, POS agents and families — including our parents and grandparents wey dey use WhatsApp." : "For market traders, shop owners, POS agents and families — including parents and grandparents using WhatsApp."}</p></section>
    <section><h2 className="text-xl font-bold text-primary">{pcm ? "How e work" : "How it works"}</h2><p className="mt-2">{pcm ? "Paste message, upload screenshot or enter link or crypto address. AI go check for scam signs and give you answer with practical next steps. You no need account to check; sign in only if you wan save your checks." : "Paste a message, upload a screenshot or enter a link or crypto address. AI checks for scam signs and gives a verdict with practical next steps. You do not need an account to check; sign in only to save your checks."}</p></section>
    <p className="border-l-4 border-accent pl-4">{pcm ? "Na AI opinion, no be guarantee. If you no sure, confirm directly for your bank app." : "This is an AI opinion, not a guarantee. When in doubt, confirm with your bank app directly."}</p>
  </HelpPage>;
}