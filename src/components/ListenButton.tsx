import { useEffect, useRef, useState } from "react";
import type { ScanResult } from "@/lib/scan.functions";
import { useLang } from "@/lib/lang";

const WORDS: Record<ScanResult["verdict"], string> = {
  scam: "Likely scam",
  suspicious: "Be careful",
  safe: "Looks safe",
};

function supported() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

/** Prefer a real English voice; Nigerian or British first, then any English one. */
function pickVoice(): SpeechSynthesisVoice | null {
  try {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const rank = (v: SpeechSynthesisVoice) => {
      const l = v.lang.toLowerCase();
      if (l === "en-ng" || l === "en_ng") return 0;
      if (l.startsWith("en-gb") || l.startsWith("en_gb")) return 1;
      if (l.startsWith("en-us") || l.startsWith("en_us")) return 2;
      if (l.startsWith("en")) return 3;
      return 9;
    };
    return voices.slice().sort((a, b) => rank(a) - rank(b))[0] ?? null;
  } catch {
    return null;
  }
}

/** What gets read out: verdict, scam type, top red flags, then the steps. */
function linesFor(result: ScanResult): string[] {
  const out: string[] = [
    `My verdict: ${WORDS[result.verdict]}. Risk score ${result.risk_score} out of 100.`,
    `Type of scam: ${result.scam_type}.`,
  ];

  const flags = result.red_flags.slice(0, 3);
  if (flags.length) {
    out.push("Red flags we found.");
    flags.forEach((f, i) => out.push(`Number ${i + 1}. ${f.flag}. The message says: ${f.evidence}.`));
  }

  if (result.what_to_do.length) {
    out.push("What to do now.");
    result.what_to_do.forEach((s, i) => out.push(`Step ${i + 1}. ${s}.`));
  }

  return out;
}

export function ListenButton({ result }: { result: ScanResult }) {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const [ok, setOk] = useState(false);
  const [playing, setPlaying] = useState(false);
  const beat = useRef<number | null>(null);

  const clearBeat = () => {
    if (beat.current !== null) {
      window.clearInterval(beat.current);
      beat.current = null;
    }
  };

  // Only show the button when the browser really can speak.
  useEffect(() => {
    setOk(supported());
  }, []);

  // Stop talking when this result changes or the screen goes away.
  useEffect(() => {
    if (!ok) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* nothing playing */
    }
    clearBeat();
    setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, ok]);

  useEffect(
    () => () => {
      clearBeat();
      if (supported()) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* nothing playing */
        }
      }
    },
    [],
  );

  if (!ok) return null;

  const toggle = () => {
    const synth = window.speechSynthesis;
    clearBeat();

    if (playing) {
      synth.cancel();
      setPlaying(false);
      return;
    }

    const lines = linesFor(result);
    if (!lines.length) return;

    // Warm the voice list; some browsers fill it in a beat later.
    try {
      synth.getVoices();
    } catch {
      /* voices arrive on the voiceschanged event */
    }
    const voice = pickVoice();

    synth.cancel();
    setPlaying(true);

    lines.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.pitch = 1;
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = "en-GB";
      }
      if (i === lines.length - 1) {
        const done = () => {
          clearBeat();
          setPlaying(false);
        };
        u.onend = done;
        u.onerror = done;
      }
      synth.speak(u);
    });

    // Some phones quietly stall the queue; nudge it and watch for an early finish.
    beat.current = window.setInterval(() => {
      if (!synth.speaking && !synth.pending) {
        clearBeat();
        setPlaying(false);
        return;
      }
      try {
        synth.resume();
      } catch {
        /* not paused */
      }
    }, 8000);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      className="tap mt-4 w-full rounded-xl border-2 border-verdict-foreground px-4 py-3 text-lg font-bold text-verdict-foreground"
    >
      {playing ? (pcm ? "⏹ Stop am" : "⏹ Stop") : pcm ? "🔊 Make you hear" : "🔊 Listen"}
    </button>
  );
}
