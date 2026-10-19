export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
      <p>© {new Date().getFullYear()} SignBridge. All Rights Reserved.</p>

      <p className="mt-2">
        Developed by <span className="text-white font-semibold">Kavya S</span>
      </p>

      <p className="mt-2">
        Built with React, Flask, MediaPipe & Machine Learning
      </p>
    </footer>
  );
}