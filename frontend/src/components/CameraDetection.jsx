
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaVideo, FaStop } from "react-icons/fa";
import useCamera from "../hooks/useCamera";
import { predictGesture, errMsg } from "../services/api";
import ResultCard from "./ResultCard";

export default function CameraDetection() {
  const { videoRef, active, error: camErr, start, stop, captureFrame } = useCamera();

  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [translationHistory, setTranslationHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("translationHistory");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem(
      "translationHistory",
      JSON.stringify(translationHistory)
    );
  }, [translationHistory]);

  const busy = useRef(false);
  const lastLetter = useRef(null);
  const stableCount = useRef(0);
  const letterConfirmed = useRef(false);

  // A gesture must be detected consistently before adding it.
  const REQUIRED_FRAMES = 3;

  useEffect(() => {
    if (!detecting) return;

    const id = setInterval(async () => {
      const frame = captureFrame();
      if (!frame || busy.current) return;

      busy.current = true;

      try {
        const d = await predictGesture(frame);
        setError("");

        const letter = d.text?.trim().toUpperCase();

        if (letter && /^[A-Z]$/.test(letter)) {
          setResult(d);

          if (lastLetter.current === letter) {
            stableCount.current += 1;
          } else {
            lastLetter.current = letter;
            stableCount.current = 1;
            letterConfirmed.current = false;
          }

          if (
            stableCount.current >= REQUIRED_FRAMES &&
            !letterConfirmed.current
          ) {
            setTranslatedText((previous) => previous + letter);
            letterConfirmed.current = true;
          }
        } else {
          lastLetter.current = null;
          stableCount.current = 0;
          letterConfirmed.current = false;
        }
      } catch (e) {
        setError(errMsg(e));
        setDetecting(false);
      } finally {
        busy.current = false;
      }
    }, 700);

    return () => clearInterval(id);
  }, [detecting, captureFrame]);
  const addSpace = () => {
    setTranslatedText((previous) => previous + " ");
  };

  const deleteLetter = () => {
    setTranslatedText((previous) => previous.slice(0, -1));
  };

  const clearText = () => {
    setTranslatedText("");
  };
  const saveTranslation = () => {
    const text = translatedText.trim();

    if (!text) {
      alert("Please translate something first!");
      return;
    }

    const newTranslation = {
      id: Date.now(),
      text: text,
      date: new Date().toLocaleString()
    };

    setTranslationHistory((previous) => [
      newTranslation,
      ...previous
    ]);

    alert("Translation saved successfully!");
  };
  const downloadText = () => {
    if (!translatedText.trim()) {
      alert("No text available to download!");
      return;
    }

    const blob = new Blob([translatedText], {
      type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "sign-language-translation.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };
  const copyText = async () => {
    if (!translatedText.trim()) {
      alert("No text available to copy!");
      return;
    }

    try {
      await navigator.clipboard.writeText(translatedText);
      alert("Text copied successfully!");
    } catch {
      alert("Unable to copy text.");
    }
  };
  const speakText = () => {
    if (!translatedText.trim()) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(translatedText);
    speech.lang = "en-US";
    speech.rate = 0.9;

    window.speechSynthesis.speak(speech);
  };
  const toggle = async () => {
    if (detecting) {
      setDetecting(false);
      stop();
      lastLetter.current = null;
      stableCount.current = 0;
      letterConfirmed.current = false;
      return;
    }

    await start();
    setDetecting(true);
  };

  return (
    <section id="live" className="section">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-8">
        Sign to text
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div
          className={`glass p-3 relative ${detecting ? "shadow-glow border-neon/60" : ""
            }`}
        >
          <div className="relative">
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full rounded-2xl bg-black aspect-video object-cover -scale-x-100"
            />

            {detecting && (
              <motion.div
                className="absolute inset-4 rounded-2xl border-2 border-neon pointer-events-none"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              />
            )}

            {!active && (
              <p className="absolute inset-0 grid place-items-center text-slate-500">
                Camera is off
              </p>
            )}
          </div>

          <button
            onClick={toggle}
            className="btn mt-3 w-full flex items-center justify-center gap-2"
          >
            {detecting ? (
              <>
                <FaStop /> Stop detection
              </>
            ) : (
              <>
                <FaVideo /> Start detection
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {detecting && !result && (
            <p className="glass p-6 animate-pulse">
              Looking for a hand sign…
            </p>
          )}

          {(camErr || error) && (
            <p
              role="alert"
              className="glass p-4 border-red-400/40 text-red-300"
            >
              {camErr || error}
            </p>
          )}

          {result ? (
            <ResultCard {...result} />
          ) : (
            !detecting && (
              <p className="glass p-6 text-slate-400">
                Start detection and show a sign to the camera.
                The result appears here.
              </p>
            )
          )}

          <div className="glass p-5">
            <h3 className="text-xl font-semibold mb-3">
              Translated Text
            </h3>

            <textarea
              value={translatedText}
              onChange={(e) => setTranslatedText(e.target.value)}
              placeholder="Your translated words and sentences will appear here..."
              rows={4}
              className="w-full p-4 rounded-xl bg-black/30 border border-white/20 text-white outline-none focus:border-cyan-400"
            />
            <div className="flex flex-wrap gap-3 mt-3">
              <button
                type="button"
                onClick={addSpace}
                className="btn"
              >
                Space
              </button>

              <button
                type="button"
                onClick={deleteLetter}
                className="btn"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={clearText}
                className="btn"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={speakText}
                className="btn"
              >
                🔊 Speak
              </button>
              <button
                type="button"
                onClick={saveTranslation}
                className="btn"
              >
                💾 Save Translation
              </button>
              <button
                type="button"
                onClick={copyText}
                className="btn"
              >
                📋 Copy Text
              </button>
              <button
                type="button"
                onClick={downloadText}
                className="btn"
              >
                📥 Download Text
              </button>
            </div>

            <p className="text-sm text-slate-400 mt-2">
              Hold each gesture steady for about 2 seconds.
              Remove your hand before repeating the same letter.
            </p>
          </div>
          <div className="glass p-6 mt-6">
            <h3 className="text-2xl font-semibold mb-4">
              📜 Translation History
            </h3>

            {translationHistory.length === 0 ? (
              <p className="text-slate-400">
                No translations saved yet.
              </p>
            ) : (
              <div className="space-y-3">
                {translationHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <p className="text-white font-medium">
                      {item.text}
                    </p>

                    <p className="text-sm text-slate-400 mt-2">
                      {item.date}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
