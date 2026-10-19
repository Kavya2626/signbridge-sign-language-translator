import { motion } from "framer-motion";
import CameraDetection from "../components/CameraDetection";
import VoiceTranslator from "../components/VoiceTranslator";
import GestureGallery from "../components/GestureGallery";

const team = [["Kavya S", "Full Stack Developer | Machine Learning"]];
export default function HomePage() {
  return (
    <main id="top">
      <section className="min-h-screen grid place-items-center text-center px-5 pt-16">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}
            className="text-5xl md:text-8xl font-extrabold leading-tight">Hands speak.<br /><span className="grad-text">We translate.</span></motion.h1>
          <p className="mt-6 max-w-xl mx-auto text-slate-400 text-lg">Show a sign to your camera and read it as text, or speak and see it as signs.</p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <a href="#live" className="btn">Sign to text</a>
            <a href="#voice" className="btn !bg-none !shadow-none border border-white/20">Speech to sign</a>
          </div>
        </div>
      </section>
      <section id="about" className="section grid md:grid-cols-3 gap-6">
        {[["Detect", "MediaPipe finds 21 hand landmarks in every frame."], ["Classify", "A Keras model turns landmarks into words with a confidence score."], ["Show", "Reference sign images are matched to every word you speak."]]
          .map(([t, d]) => <div key={t} className="glass p-6"><h3 className="text-xl font-semibold grad-text">{t}</h3><p className="mt-2 text-slate-400">{d}</p></div>)}
      </section>
      <CameraDetection /><VoiceTranslator /><GestureGallery />
      <section id="team" className="section text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-8">
          Meet the Developer
        </h2>

        <div className="flex justify-center">
          {team.map(([n, r], i) => (
            <div
              key={i}
              className="glass p-6 text-center w-full max-w-sm"
            >
              <p className="mt-3 font-semibold">{n}</p>
              <p className="text-sm text-slate-400">{r}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
