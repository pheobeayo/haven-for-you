import type { ScanResult } from "@/lib/scan.functions";
import type { Lang } from "@/lib/lang";

export const APP_URL = "https://shine-your-eye.lovable.app";

const TITLES = {
  en: { scam: "⚠️ SCAM ALERT", suspicious: "Be careful", safe: "Looks safe" },
  pcm: { scam: "⚠️ SCAM ALERT", suspicious: "Shine your eye well", safe: "E look okay" },
} as const;

function cssColor(cls: string, prop: "backgroundColor" | "color" = "backgroundColor") {
  const el = document.createElement("div");
  el.className = cls;
  el.style.display = "none";
  document.body.appendChild(el);
  const c = getComputedStyle(el)[prop];
  el.remove();
  return c;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    let last = lines[maxLines - 1];
    while (ctx.measureText(last + "…").width > maxW && last.length) last = last.slice(0, -1);
    lines[maxLines - 1] = last.trimEnd() + "…";
  }
  return lines;
}

export function shareText(r: ScanResult, lang: Lang) {
  const title = TITLES[lang][r.verdict];
  const step = r.what_to_do[0] ?? "";
  return lang === "pcm"
    ? `${title}: ${r.scam_type}. ${step} Check am yourself for ${APP_URL}`
    : `${title}: ${r.scam_type}. ${step} Check messages yourself at ${APP_URL}`;
}

export async function makeShareImage(r: ScanResult, lang: Lang): Promise<Blob> {
  const S = 1080;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  const vcls = r.verdict === "scam" ? "bg-scam" : r.verdict === "suspicious" ? "bg-careful" : "bg-safe";
  const band = cssColor(vcls);
  const bg = cssColor("bg-background");
  const ink = cssColor("text-foreground", "color");
  const onBand = cssColor("text-verdict-foreground", "color");
  const display = getComputedStyle(document.body).fontFamily;
  try { await document.fonts.ready; } catch { /* ignore */ }

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, S, 260);

  const pad = 72;
  ctx.fillStyle = onBand;
  ctx.textBaseline = "middle";
  ctx.font = `800 92px ${display}`;
  ctx.fillText(TITLES[lang][r.verdict], pad, 130, S - pad * 2);

  ctx.fillStyle = ink;
  ctx.textBaseline = "alphabetic";
  ctx.font = `800 58px ${display}`;
  let y = 350;
  for (const l of wrap(ctx, r.scam_type, S - pad * 2, 2)) { ctx.fillText(l, pad, y); y += 68; }

  y += 20;
  const flags = r.red_flags.slice(0, 3);
  if (flags.length) {
    ctx.font = `700 34px ${display}`;
    ctx.fillText(lang === "pcm" ? "Wahala we see:" : "Red flags:", pad, y);
    y += 56;
    ctx.font = `500 36px ${display}`;
    for (const f of flags) {
      ctx.fillStyle = band;
      ctx.beginPath(); ctx.arc(pad + 12, y - 12, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = ink;
      ctx.fillText(wrap(ctx, f.flag, S - pad * 2 - 44, 1)[0] ?? "", pad + 44, y);
      y += 58;
    }
  }

  const step = r.what_to_do[0];
  if (step) {
    y += 24;
    ctx.font = `700 34px ${display}`;
    ctx.fillText(lang === "pcm" ? "Wetin to do:" : "What to do:", pad, y);
    y += 52;
    ctx.font = `500 36px ${display}`;
    for (const l of wrap(ctx, step, S - pad * 2, 2)) { ctx.fillText(l, pad, y); y += 48; }
  }

  ctx.fillStyle = ink;
  ctx.fillRect(0, S - 150, S, 150);
  ctx.fillStyle = bg;
  ctx.font = `800 40px ${display}`;
  ctx.fillText("Checked with Shine Your Eye", pad, S - 85);
  ctx.font = `500 30px ${display}`;
  ctx.fillText(APP_URL.replace("https://", ""), pad, S - 40);

  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("no image"))), "image/png"));
}
