// GoPlus token security lookup (free public API, no key). Server-side only.
import type { Network } from "./link-checks";

export type OnchainCheck = { label: string; value: string; bad: boolean };

const CHAIN_ID: Record<Network, string> = { Ethereum: "1", "BNB Chain": "56", Celo: "42220", Base: "8453" };

const pct = (v?: string) => (v === undefined || v === "" ? null : Math.round(parseFloat(v) * 1000) / 10);

export async function goplusToken(address: string, network: Network): Promise<OnchainCheck[] | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(
      `https://api.gopluslabs.io/api/v1/token_security/${CHAIN_ID[network]}?contract_addresses=${address.toLowerCase()}`,
      { signal: ctrl.signal },
    ).finally(() => clearTimeout(t));
    if (!res.ok) return null;
    const j: any = await res.json();
    const r = j?.result?.[address.toLowerCase()];
    if (!r || typeof r !== "object" || Object.keys(r).length === 0) return null;
    const yes = (v: any) => v === "1";
    const known = (v: any) => v === "0" || v === "1";
    const out: OnchainCheck[] = [];
    if (r.token_name || r.token_symbol) out.push({ label: "Token", value: `${r.token_name ?? ""} ${r.token_symbol ? `(${r.token_symbol})` : ""}`.trim(), bad: false });
    if (known(r.is_honeypot)) out.push({ label: "Honeypot (you can buy but cannot sell)", value: yes(r.is_honeypot) ? "Yes" : "No", bad: yes(r.is_honeypot) });
    if (known(r.is_mintable)) out.push({ label: "Owner can create more tokens", value: yes(r.is_mintable) ? "Yes" : "No", bad: yes(r.is_mintable) });
    if (known(r.owner_change_balance)) out.push({ label: "Owner can change balances", value: yes(r.owner_change_balance) ? "Yes" : "No", bad: yes(r.owner_change_balance) });
    const buy = pct(r.buy_tax), sell = pct(r.sell_tax);
    if (buy !== null || sell !== null)
      out.push({ label: "Trading tax", value: `Buy ${buy ?? "?"}% · Sell ${sell ?? "?"}%`, bad: (buy ?? 0) > 10 || (sell ?? 0) > 10 });
    return out.length ? out : null;
  } catch {
    return null;
  }
}
