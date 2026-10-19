import { useRef, useState } from "react";
/** Web Speech API wrapper (Chrome/Edge). Live transcript in `text`; onFinal(text) fires when speech ends. */
export default function useSpeech(onFinal) {
  const rec = useRef(null), last = useRef("");
  const [listening, setListening] = useState(false), [text, setText] = useState(""), [error, setError] = useState("");
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const start = () => {
    if (!SR) return setError("Speech recognition isn't supported here. Use Chrome or Edge.");
    const r = new SR(); r.lang = "en-US"; r.interimResults = true;
    r.onstart = () => { setError(""); setText(""); last.current = ""; setListening(true); };
    r.onresult = (e) => { const t = Array.from(e.results).map((x) => x[0].transcript).join(" "); last.current = t; setText(t); };
    r.onerror = (e) => { setError(`Microphone error: ${e.error}`); setListening(false); };
    r.onend = () => { setListening(false); if (last.current) onFinal(last.current); };
    rec.current = r; r.start();
  };
  const stop = () => rec.current?.stop();
  return { listening, text, error, start, stop };
}
