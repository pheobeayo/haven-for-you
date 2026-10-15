import { useEffect, useState } from "react";
import type { ScanResult } from "@/lib/scan.functions";
import { useLang } from "@/lib/lang";
import { makeShareImage, shareText } from "@/lib/share-image";

export function ShareWarning({ result }: { result: ScanResult }) {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const [blob, setBlob] = useState<Blob | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setBlob(null);
    makeShareImage(result, lang).then((b) => alive && setBlob(b)).catch(() => {});
    return () => { alive = false; };
  }, [result, lang]);

  const text = shareText(result, lang);
  const filename = "shine-your-eye-warning.png";

  const download = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  const onShare = async () => {
    const touch = matchMedia("(pointer: coarse)").matches;
    if (touch && blob) {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], text }); return; }
        catch (e) { if ((e as DOMException).name === "AbortError") return; }
      }
    }
    setOpen((o) => !o);
  };

  const btn = "tap w-full rounded-xl border-2 border-foreground text-base font-bold";
  return (
    <div className="relative">
      <button onClick={onShare} disabled={!blob} className={`${btn} bg-primary text-primary-foreground disabled:opacity-60`}>
        {blob ? (pcm ? "Share warning" : "Share warning") : (pcm ? "Dey prepare…" : "Preparing…")}
      </button>
      {open && (
        <div className="mt-2 grid gap-2">
          <button onClick={download} className={`${btn} bg-card`}>{pcm ? "Download picture" : "Download image"}</button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn} grid place-items-center bg-safe text-verdict-foreground`}
          >
            {pcm ? "Share for WhatsApp" : "Share on WhatsApp"}
          </a>
        </div>
      )}
    </div>
  );
}
