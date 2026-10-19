"""Sign Language Translator - Flask entry point. Run: python app.py"""
from flask import Flask, jsonify
from flask_cors import CORS
from routes.api import api

# Gesture images are served at /images/<file> from static/images
app = Flask(__name__, static_folder="static/images", static_url_path="/images")
CORS(app)  # allow the React dev server to call the API
app.register_blueprint(api)

@app.errorhandler(Exception)
def on_error(e):
    return jsonify(error=str(e)), getattr(e, "code", 500)

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
