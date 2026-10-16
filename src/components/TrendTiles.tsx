import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trendsQuery } from "@/lib/trends.functions";
import { useLang } from "@/lib/lang";

export function TrendTiles() {
  const pcm = useLang().lang === "pcm";
  const { data } = useQuery(trendsQuery);
  const top = data?.types[0]?.label;
  const tiles = [
    [pcm ? "Checks this week" : "Checks this week", data ? String(data.total) : "…"],
    [pcm ? "Scams wey we catch" : "Scams caught", data ? String(data.scams) : "…"],
    [pcm ? "Wetin dey common" : "Most common", data ? (top ?? (pcm ? "Nothing yet" : "None yet")) : "…"],
  ];
  return (
    <section id="trends" aria-label="Scam trends this week" className="rounded-2xl border-2 border-foreground bg-card p-4 md:p-6">
      <h2 className="text-xl font-extrabold">{pcm ? "Scam trends this week" : "Scam trends this week"}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-xl border-2 border-primary/30 bg-background p-3">
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
            <p className="mt-1 break-words text-2xl font-extrabold text-primary">{value}</p>
          </div>
        ))}
      </div>
      {data && !data.ok && <p className="mt-2 text-sm text-muted-foreground">{pcm ? "We no fit load trends now." : "Trends could not load right now."}</p>}
      <Link to="/trends" className="tap mt-3 inline-flex items-center font-bold text-primary underline">{pcm ? "See all trends →" : "See all trends →"}</Link>
    </section>
  );
}
