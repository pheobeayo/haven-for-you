// Pure, offline checks on a URL or wallet address. Never fetches anything.

export const NETWORKS = ["Ethereum", "BNB Chain", "Celo", "Base"] as const;
export type Network = (typeof NETWORKS)[number];

export const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;

export function detectKind(input: string): "wallet" | "url" | "other" {
  const s = input.trim();
  if (WALLET_RE.test(s)) return "wallet";
  if (/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/|$|\?|#|:)/i.test(s)) return "url";
  return "other";
}

const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "cutt.ly", "rb.gy", "shorturl.at", "tiny.cc", "rebrand.ly", "t.ly", "s.id", "v.gd", "bl.ink", "wa.link", "linktr.ee"];

// brand keyword -> real domains
const BRANDS: Record<string, string[]> = {
  gtbank: ["gtbank.com"], gtb: ["gtbank.com"], guaranty: ["gtbank.com"],
  firstbank: ["firstbanknigeria.com"], zenith: ["zenithbank.com"], access: ["accessbankplc.com"],
  uba: ["ubagroup.com"], fidelity: ["fidelitybank.ng"], union: ["unionbankng.com"],
  sterling: ["sterling.ng"], wema: ["wemabank.com", "alat.ng"], stanbic: ["stanbicibtcbank.com"],
  fcmb: ["fcmb.com"], ecobank: ["ecobank.com"], polaris: ["polarisbanklimited.com"],
  keystone: ["keystonebankng.com"], opay: ["opayweb.com"], palmpay: ["palmpay.com"],
  moniepoint: ["moniepoint.com"], kuda: ["kuda.com"],
  cbn: ["cbn.gov.ng"], nimc: ["nimc.gov.ng"], efcc: ["efcc.gov.ng"],
  binance: ["binance.com"], coinbase: ["coinbase.com"], metamask: ["metamask.io"],
  trustwallet: ["trustwallet.com"], uniswap: ["uniswap.org", "app.uniswap.org"],
  pancakeswap: ["pancakeswap.finance"], ethereum: ["ethereum.org"], celo: ["celo.org"],
  bybit: ["bybit.com"], okx: ["okx.com"], kucoin: ["kucoin.com"],
};

const WORDS = ["claim", "airdrop", "verify", "bonus", "reward", "giveaway", "free", "unlock", "update-bvn", "bvn", "nin", "wallet-connect", "connect-wallet", "login"];

export function checkUrl(raw: string): string[] {
  const s = raw.trim();
  const findings: string[] = [];
  let u: URL;
  try {
    u = new URL(/^[a-z]+:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return ["Could not read this link properly."];
  }
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  if (/^http:\/\//i.test(s)) findings.push("Uses http, not secure https.");
  if (SHORTENERS.some((d) => host === d || host.endsWith("." + d)))
    findings.push(`Uses a link shortener (${host}) that hides the real website.`);
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) findings.push("Uses a raw number address instead of a website name.");
  if (host.startsWith("xn--") || host.includes(".xn--")) findings.push("Uses special look-alike letters in the website name.");

  const flat = host.replace(/[^a-z0-9]/g, "");
  for (const [brand, reals] of Object.entries(BRANDS)) {
    if (brand.length <= 3 ? new RegExp(`(^|[^a-z])${brand}([^a-z]|$)`).test(host) : flat.includes(brand)) {
      const isReal = reals.some((r) => host === r || host.endsWith("." + r));
      if (!isReal) findings.push(`Mentions "${brand}" but is not the real website (${reals[0]}).`);
      break;
    }
  }
  const lower = (u.hostname + u.pathname + u.search).toLowerCase();
  const hits = WORDS.filter((w) => lower.includes(w));
  if (hits.length) findings.push(`Contains bait words: ${hits.map((h) => `"${h}"`).join(", ")}.`);
  return findings;
}

export function explorerFor(network: Network): string {
  return { Ethereum: "etherscan.io", "BNB Chain": "bscscan.com", Celo: "celoscan.io", Base: "basescan.org" }[network];
}
