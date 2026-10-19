"""Train the gesture classifier. Dataset: datasets/<label>/*.jpg. Run: python train_model.py"""
import os, json, glob, cv2, numpy as np, mediapipe as mp
from sklearn.model_selection import train_test_split
from tensorflow import keras
from utils.helpers import landmarks_to_features

DS, OUT = "datasets", "models"
hands = mp.solutions.hands.Hands(static_image_mode=True, max_num_hands=1)
labels = sorted(d for d in os.listdir(DS) if os.path.isdir(f"{DS}/{d}"))
X, y = [], []
for i, lab in enumerate(labels):
    for f in glob.glob(f"{DS}/{lab}/*"):
        img = cv2.imread(f)
        res = hands.process(img[:, :, ::-1]) if img is not None else None
        if res and res.multi_hand_landmarks:
            X.append(landmarks_to_features(res.multi_hand_landmarks[0].landmark)); y.append(i)
X, y = np.array(X), np.array(y)
print(f"{len(X)} samples, {len(labels)} classes")
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

model = keras.Sequential([
    keras.layers.Input((63,)),
    keras.layers.Dense(128, activation="relu"), keras.layers.Dropout(0.3),
    keras.layers.Dense(64, activation="relu"),
    keras.layers.Dense(len(labels), activation="softmax")])
model.compile("adam", "sparse_categorical_crossentropy", metrics=["accuracy"])
model.fit(Xtr, ytr, validation_data=(Xte, yte), epochs=60, batch_size=32,
          callbacks=[keras.callbacks.EarlyStopping(patience=8, restore_best_weights=True)])
os.makedirs(OUT, exist_ok=True)
model.save(f"{OUT}/gesture_model.h5")
json.dump(labels, open(f"{OUT}/labels.json", "w"))
print("Saved model + labels")
