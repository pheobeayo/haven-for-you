import { useEffect, useRef, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { useLang } from "@/lib/lang";

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

export function ListenButton({ lines }: { lines: string[] }) {
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

  // Only show the button when the browser really can speak: it needs both the
  // speech engine and at least one voice to read with.
  useEffect(() => {
    if (!supported()) return;
    const synth = window.speechSynthesis;
    const check = () => setOk(synth.getVoices().length > 0);
    check();
    try {
      synth.addEventListener("voiceschanged", check);
    } catch {
      /* engine does not announce voice changes */
    }
    // A few browsers fill the voice list late without announcing it.
    let tries = 0;
    const poll = window.setInterval(() => {
      check();
      if (++tries >= 6) window.clearInterval(poll);
    }, 500);
    return () => {
      try {
        synth.removeEventListener("voiceschanged", check);
      } catch {
        /* nothing to remove */
      }
      window.clearInterval(poll);
    };
  }, []);

  // Stop talking when this guidance changes or the screen goes away.
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
  }, [lines.join("|"), ok]);

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
      className="tap inline-flex items-center gap-2 rounded-md border-2 border-primary px-4 font-bold text-primary"
    >
      {playing ? <Square className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
      {playing ? (pcm ? "Stop am" : "Stop") : pcm ? "Hear am" : "Listen to this"}
    </button>
  );
}
