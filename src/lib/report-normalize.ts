// Pure normalising + masking for community reports. Used before every save and lookup.
export type ReportKind = "phone" | "bank_account" | "link" | "wallet";
export const KINDS: ReportKind[] = ["phone", "bank_account", "link", "wallet"];

/** Accepts new kinds and the older UI names (phone_number). */
export function toKind(t: string): ReportKind | null {
  if (t === "phone_number") return "phone";
  return (KINDS as string[]).includes(t) ? (t as ReportKind) : null;
}

export function normalizeValue(kind: ReportKind, raw: string): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (kind === "phone") {
    let d = s.replace(/\D/g, "");
    if (d.startsWith("0") && d.length === 11) d = "234" + d.slice(1);
    else if (d.length === 10 && /^[789]/.test(d)) d = "234" + d;
    return /^234[789][01]\d{8}$/.test(d) ? d : null;
  }
  if (kind === "bank_account") {
    const d = s.replace(/[\s-]/g, "");
    return /^\d{10}$/.test(d) ? d : null;
  }
  if (kind === "wallet") {
    const w = s.toLowerCase();
    return /^0x[a-f0-9]{40}$/.test(w) ? w : null;
  }
  let d = s.toLowerCase().replace(/^[a-z]+:\/\//, "").split(/[/?#:\s]/)[0] ?? "";
  d = d.replace(/^www\./, "");
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d) && /[a-z]/.test(d.split(".").pop() ?? "") ? d : null;
}

export function maskValue(kind: ReportKind, v: string): string {
  if (kind === "phone") {
    const local = "0" + v.slice(3);
    return `${local.slice(0, 4)} *** ${local.slice(-4)}`;
  }
  if (kind === "bank_account") return `${v.slice(0, 4)}****${v.slice(-2)}`;
  if (kind === "wallet") return `${v.slice(0, 6)}…${v.slice(-4)}`;
  return v;
}
