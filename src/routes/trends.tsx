import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { HelpPage } from "@/components/HelpPage";
import { useLang } from "@/lib/lang";
import { trendsQuery, watchFor } from "@/lib/trends.functions";

export const Route = createFileRoute("/trends")({
  head: () => ({ meta: [
    { title: "Scam trends this week — Shine Your Eye" },
    { name: "description", content: "The most common scams people checked in Nigeria over the last 7 days, and what to watch for." },
    { property: "og:title", content: "Scam trends this week — Shine Your Eye" },
    { property: "og:description", content: "See which scams are going around this week and how to spot them." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trendsQuery),
  component: TrendsPage,
});

function TrendsPage() {
  const pcm = useLang().lang === "pcm";
  const { data } = useSuspenseQuery(trendsQuery);
  const max = Math.max(1, ...data.types.map((t) => t.count));
  return (
    <HelpPage title={pcm ? "Scam trends this week" : "Scam trends this week"}>
      <p>
        {pcm
          ? `For the last 7 days: ${data.total} checks, ${data.scams} scams, ${data.suspicious} wey need care. We only count verdict and scam type — no message.`
          : `Last 7 days: ${data.total} checks, ${data.scams} likely scams, ${data.suspicious} to be careful with. We only count the verdict and scam type — never the message.`}
      </p>
      {!data.ok && <p>{pcm ? "We no fit load trends now. Try again later." : "Trends could not load right now. Please try again later."}</p>}
      {data.ok && data.types.length === 0 && <p>{pcm ? "No scam don show this week yet." : "No scams have been found this week yet."}</p>}
      <ol className="space-y-4">
        {data.types.map((t) => (
          <li key={t.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-bold">{t.label}</span>
              <span className="font-extrabold text-primary">{t.count}</span>
            </div>
            <div className="mt-1 h-4 w-full rounded-full bg-muted" role="img" aria-label={`${t.count}`}>
              <div className="h-4 rounded-full bg-primary" style={{ width: `${(t.count / max) * 100}%` }} />
            </div>
            <p className="mt-1 text-base text-muted-foreground">
              <span className="font-semibold text-foreground">{pcm ? "Wetin to watch: " : "What to watch for: "}</span>
              {watchFor(t.label, pcm)}
            </p>
          </li>
        ))}
      </ol>
    </HelpPage>
  );
}
