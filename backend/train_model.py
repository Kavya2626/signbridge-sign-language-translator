import os
import json
import glob
import cv2
import numpy as np
import mediapipe as mp

from sklearn.model_selection import train_test_split
from tensorflow import keras
from utils.helpers import landmarks_to_features

DATASET_DIR = "datasets"
MODEL_DIR = "models"
MAX_IMAGES_PER_CLASS = 300

hands = mp.solutions.hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5
)

labels = []
X = []
y = []

for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
    folder = os.path.join(DATASET_DIR, letter)

    if not os.path.isdir(folder):
        continue

    files = sorted(glob.glob(os.path.join(folder, "*.jpg")))
    files += sorted(glob.glob(os.path.join(folder, "*.png")))
    files = files[:MAX_IMAGES_PER_CLASS]

    class_index = len(labels)
    labels.append(letter)

    print(f"Processing letter {letter}...")

    for file in files:
        image = cv2.imread(file)

        if image is None:
            continue

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        if result.multi_hand_landmarks:
            features = landmarks_to_features(
                result.multi_hand_landmarks[0].landmark
            )

            X.append(features)
            y.append(class_index)

hands.close()

X = np.array(X, dtype=np.float32)
y = np.array(y, dtype=np.int32)

if len(set(y)) != len(labels):
    raise RuntimeError(
        "Some letters have no detected hand landmarks."
    )

print(f"Total samples: {len(X)}")
print(f"Total classes: {len(labels)}")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

model = keras.Sequential([
    keras.layers.Input(shape=(63,)),
    keras.layers.Dense(128, activation="relu"),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(64, activation="relu"),
    keras.layers.Dense(len(labels), activation="softmax")
])

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.fit(
    X_train,
    y_train,
    validation_data=(X_test, y_test),
    epochs=60,
    batch_size=32,
    callbacks=[
        keras.callbacks.EarlyStopping(
            patience=8,
            restore_best_weights=True
        )
    ]
)

os.makedirs(MODEL_DIR, exist_ok=True)

model.save(os.path.join(MODEL_DIR, "gesture_model.h5"))

with open(os.path.join(MODEL_DIR, "labels.json"), "w") as file:
    json.dump(labels, file)

print("Model and labels saved successfully!")