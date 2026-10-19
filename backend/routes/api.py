import speech_recognition as sr
from flask import Blueprint, request, jsonify
from utils.helpers import decode_image
from services import gesture_service, sign_service

api = Blueprint("api", __name__)

@api.post("/predict-gesture")
def predict_gesture():
    """Body: {"image": "data:image/jpeg;base64,..."}"""
    img = (request.get_json(silent=True) or {}).get("image")
    if not img:
        return jsonify(error="'image' is required"), 400
    try:
        text, conf = gesture_service.predict(decode_image(img))
    except RuntimeError as e:
        return jsonify(error=str(e)), 503
    return jsonify(text=text, confidence=round(conf * 100, 1),
                   images=sign_service.images_for_word(text) if text else [])

@api.post("/speech-to-sign")
def speech_to_sign():
    """Accepts JSON {"text": "..."} (browser Web Speech API) OR multipart 'audio' (WAV file)."""
    text = (request.get_json(silent=True) or {}).get("text")
    if not text and "audio" in request.files:
        r = sr.Recognizer()
        try:
            with sr.AudioFile(request.files["audio"]) as src:
                text = r.recognize_google(r.record(src))
        except sr.UnknownValueError:
            return jsonify(error="Could not understand audio"), 422
        except sr.RequestError as e:
            return jsonify(error=f"Speech service failed: {e}"), 502
    if not text:
        return jsonify(error="Provide 'text' or an 'audio' file"), 400
    return jsonify(text=text, signs=sign_service.sentence_to_signs(text))

@api.get("/gesture-images/<word>")
def gesture_images(word):
    imgs = sign_service.images_for_word(word)
    return (jsonify(word=word, images=imgs), 200) if imgs else (jsonify(word=word, images=[], error="No images"), 404)
