import { useState } from "react";
import { motion } from "framer-motion";
import { FaMicrophone } from "react-icons/fa";
import useSpeech from "../hooks/useSpeech";
import { speechToSign, imgUrl, errMsg } from "../services/api";

export default function VoiceTranslator() {
  const [signs, setSigns] = useState([]), [loading, setLoading] = useState(false), [apiErr, setApiErr] = useState("");
  const { listening, text, error, start, stop } = useSpeech(async (t) => {
    setLoading(true); setApiErr("");
    try { setSigns((await speechToSign(t)).signs); } catch (e) { setApiErr(errMsg(e)); } finally { setLoading(false); }
  });
  return (
    <section id="voice" className="section">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-8">Speech to sign</h2>
      <div className="glass p-6 text-center">
        <motion.button onClick={listening ? stop : start} aria-label="Toggle microphone"
          animate={listening ? { scale: [1, 1.12, 1] } : { scale: 1 }} transition={{ repeat: listening ? Infinity : 0, duration: 1 }}
          className="btn !p-6 text-2xl"><FaMicrophone /></motion.button>
        <p className="mt-4 min-h-8 text-xl">{text || <span className="text-slate-500">{listening ? "Listening…" : "Tap the mic and say “good morning”"}</span>}</p>
        {(error || apiErr) && <p role="alert" className="text-red-300">{error || apiErr}</p>}
        {loading && <p className="animate-pulse">Finding signs…</p>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
        {signs.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .1 }} className="glass p-3 text-center">
            {s.images[0] ? <img src={imgUrl(s.images[0])} alt={`${s.word} sign`} className="rounded-xl w-full aspect-square object-cover" />
              : <div className="aspect-square grid place-items-center text-slate-500 text-sm">No image</div>}
            <p className="mt-2 font-semibold capitalize">{s.word}</p>
          </motion.div>))}
      </div>
    </section>
  );
}
