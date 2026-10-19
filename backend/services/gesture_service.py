
import os

# Limit CPU threads before importing ML libraries
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["TF_NUM_INTEROP_THREADS"] = "1"
os.environ["TF_NUM_INTRAOP_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

import json
import threading
import numpy as np
import mediapipe as mp

from utils.helpers import landmarks_to_features

BASE = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE, "models", "gesture_model.h5")
LABELS_PATH = os.path.join(BASE, "models", "labels.json")

THRESHOLD = 0.70

_hands = None
_model = None
_labels = []

_init_lock = threading.Lock()
_predict_lock = threading.Lock()


def _load():
    """Initialize MediaPipe and load the trained model when needed."""
    global _hands, _model, _labels

    if _hands is not None and _model is not None:
        return

    with _init_lock:
        if _hands is None:
            _hands = mp.solutions.hands.Hands(
                static_image_mode=False,
                max_num_hands=1,
                min_detection_confidence=0.6,
                min_tracking_confidence=0.6
            )

        if _model is None:
            if not os.path.exists(MODEL_PATH):
                raise RuntimeError(
                    "Model not found. Run: python train_model.py"
                )

            if not os.path.exists(LABELS_PATH):
                raise RuntimeError("labels.json not found")

            from tensorflow import keras

            _model = keras.models.load_model(
                MODEL_PATH,
                compile=False
            )

            with open(LABELS_PATH, "r", encoding="utf-8") as file:
                _labels = json.load(file)


def predict(frame_bgr):
    """Predict an ASL letter from a camera frame."""
    _load()

    with _predict_lock:
        rgb_frame = frame_bgr[:, :, ::-1].copy()

        results = _hands.process(rgb_frame)

        if not results.multi_hand_landmarks:
            return None, 0.0

        features = landmarks_to_features(
            results.multi_hand_landmarks[0].landmark
        )[None]

        probs = _model.predict(features, verbose=0)[0]

        index = int(np.argmax(probs))
        confidence = float(probs[index])

        if confidence >= THRESHOLD:
            return _labels[index], confidence

        return None, confidence
