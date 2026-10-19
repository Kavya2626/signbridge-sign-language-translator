import { useEffect, useState } from "react";
import { getGestureImages, imgUrl } from "../services/api";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function GestureGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled(LETTERS.map(getGestureImages)).then((results) => {
      const images = results
        .filter(
          (result) =>
            result.status === "fulfilled" &&
            result.value.images.length > 0
        )
        .map((result) => result.value);

      setItems(images);
      setLoading(false);
    });
  }, []);

  return (
    <section id="gallery" className="section">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-8">
        ASL Alphabet Gallery
      </h2>

      {loading ? (
        <p className="animate-pulse">Loading ASL alphabet...</p>
      ) : !items.length ? (
        <p className="glass p-6 text-slate-400">
          No alphabet images found.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <figure
              key={item.word}
              className="glass p-3 hover:shadow-glow transition"
            >
              <img
                src={imgUrl(item.images[0])}
                alt={`ASL letter ${item.word}`}
                className="rounded-xl aspect-square w-full object-cover"
              />

              <figcaption className="mt-2 text-center font-bold uppercase">
                {item.word}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}