import type { Identifier } from "./identifiers";

export type ReportMatch = Identifier & { reports: number };

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

/** Returns matches from the last 30 days; never throws (empty on failure). */
export async function lookupReports(items: Identifier[]): Promise<ReportMatch[]> {
  if (!items.length) return [];
  try {
    const rows = (await rpc("lookup_reports", { _items: items })) as { type: string; value: string; reports: number }[];
    return rows.map((r) => ({ type: r.type as Identifier["type"], value: r.value, reports: Number(r.reports) }));
  } catch (e) {
    console.error("lookupReports failed", e);
    return [];
  }
}

export async function saveReport(deviceHash: string, scamType: string, items: Identifier[]) {
  return (await rpc("report_scam", { _device: deviceHash, _scam_type: scamType, _items: items })) as { ok: boolean; code?: string; saved?: number };
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
