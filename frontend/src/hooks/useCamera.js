import { useRef, useState, useCallback } from "react";
/** Opens the webcam and exposes captureFrame() returning a base64 JPEG. */
export default function useCamera() {
  const videoRef = useRef(null), canvasRef = useRef(document.createElement("canvas"));
  const [active, setActive] = useState(false), [error, setError] = useState("");
  const start = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } });
      videoRef.current.srcObject = s; await videoRef.current.play(); setActive(true); setError("");
    } catch { setError("Camera access denied or unavailable. Allow camera permission and retry."); }
  }, []);
  const stop = useCallback(() => {
    videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null; setActive(false);
  }, []);
  const captureFrame = useCallback(() => {
    const v = videoRef.current; if (!v || !v.videoWidth) return null;
    const c = canvasRef.current; c.width = 480; c.height = (480 * v.videoHeight) / v.videoWidth;
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.7);
  }, []);
  return { videoRef, active, error, start, stop, captureFrame };
}
