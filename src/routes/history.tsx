import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { ResultCard } from "@/components/ResultCard";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { ScanResult } from "@/lib/scan.functions";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "My checks — Shine Your Eye" },
      { name: "description", content: "Your saved scam checks." },
      { property: "og:title", content: "My checks — Shine Your Eye" },
      { property: "og:description", content: "See the messages and links you checked before." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: History,
});

type Row = { id: string; input_preview: string; verdict: string; created_at: string; result: ScanResult };
const word: Record<string, string> = { scam: "Likely scam", suspicious: "Be careful", safe: "Looks safe" };
const chip: Record<string, string> = { scam: "bg-scam", suspicious: "bg-careful", safe: "bg-safe" };

function History() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { nav({ to: "/auth" }); return; }
    supabase.from("scans").select("id,input_preview,verdict,created_at,result").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setRows((data as any) ?? []));
  }, [user, loading, nav]);

  return (
    <div className="min-h-screen pb-12">
      <AppHeader />
      <main className="container-app space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">My checks</h1>
          <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }} className="min-h-12 text-base font-bold underline">Sign out</button>
        </div>
        {rows === null && <p className="text-lg">Loading…</p>}
        {rows?.length === 0 && (
          <p className="text-lg">No checks yet. <Link to="/" className="font-bold underline">Check something</Link></p>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows?.map((r) => (
          <div key={r.id} className={`min-w-0 space-y-2 ${open === r.id ? "md:col-span-full" : ""}`}>
            <button onClick={() => setOpen(open === r.id ? null : r.id)} className="flex w-full items-center gap-3 rounded-2xl border-2 border-foreground bg-card p-3 text-left">
              <span className={`${chip[r.verdict]} shrink-0 rounded-full px-3 py-1 text-base font-bold text-verdict-foreground`}>{word[r.verdict]}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base">{r.input_preview}</span>
                <span className="block text-sm text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
              </span>
            </button>
            {open === r.id && <ResultCard result={r.result} onCheckAnother={() => nav({ to: "/" })} />}
          </div>
        ))}
        </div>
      </main>
    </div>
  );
}
