import axios from "axios";
// Base URL comes from .env (VITE_API_URL)
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const api = axios.create({ baseURL: API_URL, timeout: 15000 });

/** Send one webcam frame (base64 JPEG) -> {text, confidence, images} */
export const predictGesture = (image) => api.post("/predict-gesture", { image }).then((r) => r.data);
/** Send recognised speech text -> {text, signs:[{word, images}]} */
export const speechToSign = (text) => api.post("/speech-to-sign", { text }).then((r) => r.data);
/** Reference images for one word -> {word, images} */
export const getGestureImages = (word) => api.get(`/gesture-images/${word}`).then((r) => r.data);
/** Turn "/images/x.jpg" into a full URL */
export const imgUrl = (p) => `${API_URL}${p}`;
/** Human-readable error from an Axios failure */
export const errMsg = (e) => e.response?.data?.error || (e.code === "ERR_NETWORK" ? "Backend unreachable. Is Flask running on port 5000?" : e.message);
