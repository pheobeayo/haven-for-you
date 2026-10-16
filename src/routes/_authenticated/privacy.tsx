import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/components/HelpPage";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/_authenticated/privacy")({
  head: () => ({ meta: [
    { title: "Privacy — Shine Your Eye" },
    { name: "description", content: "Screenshots are not stored. Scan history is saved only when you sign in. Never share PINs, passwords or OTPs." },
    { property: "og:title", content: "Privacy — Shine Your Eye" },
    { property: "og:description", content: "What Shine Your Eye saves, and how to keep your sensitive details private." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Privacy,
});

function Privacy() {
  const pcm = useLang().lang === "pcm";
  return <HelpPage title={pcm ? "Your privacy" : "Privacy"}>
    <section><h2 className="text-xl font-bold text-primary">{pcm ? "We no store screenshots" : "We don’t store screenshots"}</h2><p className="mt-2">{pcm ? "Your screenshot go to AI for checking, but we no save di picture." : "Your screenshot is sent to AI for checking, but we do not save the image."}</p></section>
    <section><h2 className="text-xl font-bold text-primary">{pcm ? "Your saved checks" : "Your saved checks"}</h2><p className="mt-2">{pcm ? "You need account and sign-in to check. We save your name and your checks for your private account. Your history get short preview and di result, no be your screenshot. Only you fit see your saved checks." : "An account and sign-in are required to check. We save your display name and checks in your private account. Your history includes a short preview and the result, not your screenshot. Only you can see your saved checks."}</p></section>
    <section><h2 className="text-xl font-bold text-primary">{pcm ? "Keep your secret details safe" : "Keep sensitive details private"}</h2><p className="mt-2">{pcm ? "No share PINs, passwords, OTPs or full account numbers. We no go ever ask for dem. Hide sensitive details before you upload screenshot or paste message." : "Never share PINs, passwords, OTPs or full account numbers. We will never ask for them. Hide sensitive details before uploading a screenshot or pasting a message."}</p></section>
  </HelpPage>;
}