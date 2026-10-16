import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/components/HelpPage";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/_authenticated/been-scammed")({
  head: () => ({ meta: [
    { title: "Been scammed? What to do now — Shine Your Eye" },
    { name: "description", content: "Five calm steps after a scam: contact your bank, keep evidence and report what happened." },
    { property: "og:title", content: "Been scammed? What to do now — Shine Your Eye" },
    { property: "og:description", content: "Practical steps to protect yourself and report a scam in Nigeria." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: BeenScammed,
});

const STEPS = [
  ["Stop all contact", "Do not reply or send more money. You do not need to explain yourself to the scammer.", "Stop all contact", "No reply or send more money. You no need explain yourself to di scammer."],
  ["Call your bank", "Use the official number in your bank app or on your card. Ask the bank to block or flag the transfer.", "Call your bank", "Use di official number for your bank app or your card. Ask di bank to block or flag di transfer."],
  ["Keep the evidence", "Keep screenshots, payment receipts and the scammer’s details. Do not delete the conversation.", "Keep di evidence", "Keep screenshots, payment receipts and di scammer details. No delete di conversation."],
  ["Report what happened", "Report the scam to your bank and the police. Share the evidence you kept.", "Report wetin happen", "Report di scam to your bank and police. Give dem di evidence wey you keep."],
  ["Warn family and friends", "Let people close to you know, especially if the scammer may contact them too.", "Warn family and friends", "Tell people wey close to you, especially if di scammer fit contact dem too."],
] as const;

function BeenScammed() {
  const pcm = useLang().lang === "pcm";
  return <HelpPage title={pcm ? "Dem scam you? Wetin to do now" : "Been scammed? What to do now"}>
    <p>{pcm ? "Sorry say dis happen. No blame yourself. Take am one step at a time." : "We’re sorry this happened. It is not your fault. Take one step at a time."}</p>
    <ol className="space-y-6">
      {STEPS.map((step, index) => <li key={step[0]} className="flex gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold" aria-hidden>{index + 1}</span>
        <div><h2 className="text-xl font-bold text-primary">{step[pcm ? 2 : 0]}</h2><p className="mt-2">{step[pcm ? 3 : 1]}</p></div>
      </li>)}
    </ol>
    <p className="border-l-4 border-accent pl-4 font-semibold">{pcm ? "Use only official contact details from your bank own app or website. No call number or follow link wey di scammer send." : "Use only official contact details from your bank’s own app or website. Do not use a number or link sent by the scammer."}</p>
  </HelpPage>;
}