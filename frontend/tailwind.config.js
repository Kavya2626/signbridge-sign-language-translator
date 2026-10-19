export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {
    fontFamily: { sans: ["Outfit", "system-ui", "sans-serif"] },
    colors: { ink: "#070812", neon: "#4f8cff", violet: "#9b5cff" },
    boxShadow: { glow: "0 0 30px rgba(79,140,255,.45)" } } },
  plugins: [],
};
