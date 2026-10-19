import os, json, numpy as np, mediapipe as mp
from utils.helpers import landmarks_to_features
import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["TF_NUM_INTEROP_THREADS"] = "1"
os.environ["TF_NUM_INTRAOP_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

BASE = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE, "models", "gesture_model.h5")
LABELS_PATH = os.path.join(BASE, "models", "labels.json")
THRESHOLD = 0.70  # below this confidence we report "no gesture"

_hands = mp.solutions.hands.Hands(static_image_mode=False, max_num_hands=1,
                                  min_detection_confidence=0.6)
_model, _labels = None, []

def _load():
    """Lazy-load the trained Keras model once."""
    global _model, _labels
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError("Model not found. Run: python train_model.py")
        from tensorflow import keras
        _model = keras.models.load_model(MODEL_PATH)
        _labels = json.load(open(LABELS_PATH))

def predict(frame_bgr):
    _load()
    res = _hands.process(frame_bgr[:, :, ::-1])  # BGR -> RGB
    if not res.multi_hand_landmarks:
        return None, 0.0
    x = landmarks_to_features(res.multi_hand_landmarks[0].landmark)[None]
    probs = _model.predict(x, verbose=0)[0]
    i = int(np.argmax(probs))
    conf = float(probs[i])
    return (_labels[i], conf) if conf >= THRESHOLD else (None, conf)
