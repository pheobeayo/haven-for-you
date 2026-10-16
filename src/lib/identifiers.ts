// Pure, offline extraction of things people can report: phone numbers,
// 10-digit bank account numbers, domains and wallet addresses.
export type ReportType = "phone_number" | "bank_account" | "link" | "wallet" | "message_pattern";
export type Identifier = { type: ReportType; value: string };

const SHORTENER_PATH_OK = new Set(["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rb.gy"]);

export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/[^\d+]/g, "");
  if (d.startsWith("+234")) d = "0" + d.slice(4);
  else if (d.startsWith("234") && d.length === 13) d = "0" + d.slice(3);
  return /^0[789][01]\d{8}$/.test(d) ? d : null;
}

export function normalizeDomain(raw: string): string | null {
  let s = raw.trim().toLowerCase();
  s = s.replace(/^[a-z]+:\/\//, "").replace(/^www\./, "");
  s = s.split(/[/?#:\s]/)[0] ?? "";
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(s) && /[a-z]/.test(s.split(".").pop() ?? "") ? s : null;
}

export function extractIdentifiers(text: string): Identifier[] {
  const out = new Map<string, Identifier>();
  const add = (type: ReportType, value: string | null) => {
    if (value) out.set(type + ":" + value, { type, value });
  };
  for (const m of text.matchAll(/0x[a-fA-F0-9]{40}\b/g)) add("wallet", m[0].toLowerCase());
  const noWallet = text.replace(/0x[a-fA-F0-9]{40}/g, " ");
  for (const m of noWallet.matchAll(/(?:\+?234[\s-]?|0)[789][01](?:[\s-]?\d){8}/g)) add("phone_number", normalizePhone(m[0]));
  for (const m of noWallet.matchAll(/(?<![\d+])\d{10}(?!\d)/g)) add("bank_account", m[0]);
  for (const m of noWallet.matchAll(/\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|ng|net|org|io|xyz|app|info|link|site|online|top|ly|co|me|gd|gl|cc|vip|live|shop|example)\b(?:\/\S*)?/gi))
    add("link", normalizeDomain(m[0]));
  return [...out.values()].slice(0, 20);
}

/** Interpret a single value typed into the "Check a number" box. */
export function parseSingle(raw: string): Identifier | null {
  const s = raw.trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(s)) return { type: "wallet", value: s.toLowerCase() };
  const phone = normalizePhone(s);
  if (phone) return { type: "phone_number", value: phone };
  const digits = s.replace(/[\s-]/g, "");
  if (/^\d{10}$/.test(digits)) return { type: "bank_account", value: digits };
  const dom = normalizeDomain(s);
  if (dom) return { type: "link", value: dom };
  return null;
}

export { SHORTENER_PATH_OK };
