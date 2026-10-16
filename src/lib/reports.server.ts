import type { Identifier } from "./identifiers";
import { maskValue, normalizeValue, toKind, type ReportKind } from "./report-normalize";

export type ReportMatch = Identifier & { reports: number; value_masked: string; top_scam_type: string; latest: string };

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function rpc(fn: string, body: unknown): Promise<any> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) throw new Error("backend not configured");
  const headers: Record<string, string> = { apikey: key, "Content-Type": "application/json" };
  if (!key.startsWith("sb_")) headers["Authorization"] = `Bearer ${key}`;
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`rpc ${fn} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

/** Matches from the last 90 days; never throws (empty on failure). Values are normalised first. */
export async function lookupReports(items: Identifier[]): Promise<ReportMatch[]> {
  const norm = items
    .map((i) => {
      const kind = toKind(i.type);
      const v = kind ? normalizeValue(kind, i.value) : null;
      return kind && v ? { item: i, kind, v } : null;
    })
    .filter((x): x is { item: Identifier; kind: ReportKind; v: string } => !!x)
    .slice(0, 20);
  if (!norm.length) return [];
  try {
    const db = await admin();
    const since = new Date(Date.now() - 90 * 864e5).toISOString();
    const { data, error } = await db
      .from("scam_reports")
      .select("kind, value_normalized, scam_type, created_at")
      .in("value_normalized", [...new Set(norm.map((n) => n.v))])
      .gt("created_at", since)
      .limit(5000);
    if (error) throw error;
    const out: ReportMatch[] = [];
    for (const n of norm) {
      const rows = (data ?? []).filter((r) => r.kind === n.kind && r.value_normalized === n.v);
      if (!rows.length) continue;
      const counts = new Map<string, number>();
      for (const r of rows) if (r.scam_type) counts.set(r.scam_type, (counts.get(r.scam_type) ?? 0) + 1);
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
      const latest = rows.reduce((m, r) => (r.created_at > m ? r.created_at : m), rows[0]?.created_at ?? "");
      out.push({ ...n.item, reports: rows.length, value_masked: maskValue(n.kind, n.v), top_scam_type: top, latest });
    }
    return out;
  } catch (e) {
    console.error("lookupReports failed", e);
    return [];
  }
}

/** Insert one row per valid item. 5 submissions/device/hour; skip same value from same device within 24h. */
export async function saveReport(deviceId: string, scamType: string, items: { kind: string; value: string }[]) {
  const rows = new Map<string, { kind: ReportKind; value_normalized: string; value_masked: string }>();
  for (const it of items.slice(0, 10)) {
    const kind = toKind(it.kind);
    const v = kind ? normalizeValue(kind, it.value) : null;
    if (kind && v) rows.set(kind + ":" + v, { kind, value_normalized: v, value_masked: maskValue(kind, v) });
  }
  if (!rows.size) return { ok: false, code: "invalid", saved: 0 };
  const db = await admin();

  const hourAgo = new Date(Date.now() - 36e5).toISOString();
  const dayAgo = new Date(Date.now() - 864e5).toISOString();
  const { data: recent, error: e1 } = await db
    .from("scam_reports").select("kind, value_normalized, created_at")
    .eq("device_id", deviceId).gt("created_at", dayAgo).limit(1000);
  if (e1) throw e1;
  const submissions = new Set((recent ?? []).filter((r) => r.created_at > hourAgo).map((r) => r.created_at.slice(0, 19)));
  if (submissions.size >= 5) return { ok: false, code: "rate_limit", saved: 0 };

  const seen = new Set((recent ?? []).map((r) => r.kind + ":" + r.value_normalized));
  const fresh = [...rows.entries()].filter(([k]) => !seen.has(k)).map(([, r]) => r);
  if (!fresh.length) return { ok: true, saved: 0, duplicate: true };

  const now = new Date().toISOString();
  const { error } = await db.from("scam_reports").insert(
    fresh.map((r) => ({
      ...r,
      type: r.kind === "phone" ? "phone_number" : r.kind, // legacy column, NOT NULL
      value: r.value_normalized,
      scam_type: scamType.slice(0, 200),
      source: "user",
      device_id: deviceId,
      created_at: now,
    })),
  );
  if (error) throw error;
  return { ok: true, saved: fresh.length };
}

export type SingleLookup = { kind: ReportKind; value_masked: string; count: number; top_scam_type: string; latest_date: string };

/** "lookup-report": one normalised value, last 90 days. 30 lookups/device/hour. Never throws on DB failure. */
export async function lookupSingle(deviceId: string, item: Identifier): Promise<SingleLookup | "rate_limit" | "invalid"> {
  const kind = toKind(item.type);
  const v = kind ? normalizeValue(kind, item.value) : null;
  if (!kind || !v) return "invalid";
  const db = await admin();
  const hourAgo = new Date(Date.now() - 36e5).toISOString();
  const { count, error: e0 } = await db
    .from("lookup_events").select("id", { count: "exact", head: true })
    .eq("device_id", deviceId).gt("created_at", hourAgo);
  if (e0) throw e0;
  if ((count ?? 0) >= 30) return "rate_limit";
  const { error: e1 } = await db.from("lookup_events").insert({ device_id: deviceId });
  if (e1) throw e1;

  const since = new Date(Date.now() - 90 * 864e5).toISOString();
  const { data, error } = await db
    .from("scam_reports").select("scam_type, created_at")
    .eq("kind", kind).eq("value_normalized", v).gt("created_at", since).limit(5000);
  if (error) throw error;
  const rows = data ?? [];
  const counts = new Map<string, number>();
  for (const r of rows) if (r.scam_type) counts.set(r.scam_type, (counts.get(r.scam_type) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const latest = rows.reduce((m, r) => (r.created_at > m ? r.created_at : m), "");
  return { kind, value_masked: maskValue(kind, v), count: rows.length, top_scam_type: top, latest_date: latest };
}

export async function hashDevice(id: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("sye:" + id));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Anonymous count only: verdict + scam type + date. Never throws. */
export async function recordScanEvent(verdict: string, scamType: string) {
  try { await rpc("record_scan_event", { _verdict: verdict, _scam_type: scamType }); }
  catch (e) { console.error("recordScanEvent failed", e); }
}

export type TrendRow = { scam_type: string; verdict: string; n: number };
export async function fetchTrends(): Promise<TrendRow[]> {
  const rows = (await rpc("scan_trends", {})) as TrendRow[];
  return rows.map((r) => ({ ...r, n: Number(r.n) }));
}
