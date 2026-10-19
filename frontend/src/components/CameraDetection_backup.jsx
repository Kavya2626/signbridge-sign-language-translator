import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaVideo, FaStop } from "react-icons/fa";
import useCamera from "../hooks/useCamera";
import { predictGesture, errMsg } from "../services/api";
import ResultCard from "./ResultCard";

export default function CameraDetection() {
  const { videoRef, active, error: camErr, start, stop, captureFrame } = useCamera();
  const [detecting, setDetecting] = useState(false), [result, setResult] = useState(null), [error, setError] = useState("");
  const busy = useRef(false);

  // While detecting, send a frame every 700ms (skip if the previous request is still pending)
  useEffect(() => {
    if (!detecting) return;
    const id = setInterval(async () => {
      const frame = captureFrame(); if (!frame || busy.current) return;
      busy.current = true;
      try { const d = await predictGesture(frame); setError(""); if (d.text) setResult(d); }
      catch (e) { setError(errMsg(e)); setDetecting(false); }
      finally { busy.current = false; }
    }, 700);
    return () => clearInterval(id);
  }, [detecting, captureFrame]);

  const toggle = async () => {
    if (detecting) { setDetecting(false); stop(); return; }
    await start(); setDetecting(true);
  };

  return (
    <section id="live" className="section">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-8">Sign to text</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`glass p-3 relative ${detecting ? "shadow-glow border-neon/60" : ""}`}>
          <div className="relative">
            <video ref={videoRef} muted playsInline className="w-full rounded-2xl bg-black aspect-video object-cover -scale-x-100" />
            {detecting && <motion.div className="absolute inset-4 rounded-2xl border-2 border-neon pointer-events-none"
              animate={{ opacity: [.3, 1, .3] }} transition={{ repeat: Infinity, duration: 1.6 }} />}
            {!active && <p className="absolute inset-0 grid place-items-center text-slate-500">Camera is off</p>}
          </div>
          <button onClick={toggle} className="btn mt-3 w-full flex items-center justify-center gap-2">
            {detecting ? <><FaStop /> Stop detection</> : <><FaVideo /> Start detection</>}
          </button>
        </div>
        <div className="space-y-4">
          {detecting && !result && <p className="glass p-6 animate-pulse">Looking for a hand sign…</p>}
          {(camErr || error) && <p role="alert" className="glass p-4 border-red-400/40 text-red-300">{camErr || error}</p>}
          {result ? <ResultCard {...result} /> : !detecting && <p className="glass p-6 text-slate-400">Start detection and show a sign to the camera. The result appears here.</p>}
        </div>
      </div>
    </section>
  );
}
