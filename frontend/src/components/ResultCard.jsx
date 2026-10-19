import { motion } from "framer-motion";
import { imgUrl } from "../services/api";
/** Detected text, confidence bar and reference images. */
export default function ResultCard({ text, confidence, images = [] }) {
  return (
    <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-6">
      <p className="text-sm text-slate-400">Gesture</p>
      <h3 className="text-4xl font-extrabold grad-text capitalize">{text}</h3>
      <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-neon to-violet" initial={{ width: 0 }} animate={{ width: `${confidence}%` }} />
      </div>
      <p className="text-sm mt-1">{confidence}% confidence</p>
      <div className="flex gap-3 mt-4 flex-wrap">
        {images.length ? images.map((p) => <img key={p} src={imgUrl(p)} alt={`${text} sign`} className="h-24 w-24 object-cover rounded-xl border border-white/10" />)
          : <p className="text-sm text-slate-500">No reference images for this gesture yet.</p>}
      </div>
    </motion.div>
  );
}
