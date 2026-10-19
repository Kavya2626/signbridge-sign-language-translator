# Backend - Sign Language Translator
## Setup (Python 3.10-3.11)
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
## Dataset
datasets/<gesture>/*.jpg  (e.g. datasets/hello, datasets/thanks; 150+ varied images each)
Reference images: static/images/hello1.jpg, hello2.jpg, good1.jpg, morning1.jpg ... (word + number)
## Train and run
python train_model.py   # writes models/gesture_model.h5 + labels.json
python app.py           # http://localhost:5000
## API
POST /predict-gesture  {"image":"data:image/jpeg;base64,..."}
  -> {"text":"hello","confidence":92.4,"images":["/images/hello1.jpg"]}  (text is null if confidence < 70% or no hand)
POST /speech-to-sign   {"text":"good morning"} or multipart audio=<wav>
  -> {"text":"good morning","signs":[{"word":"good","images":[...]},{"word":"morning","images":[...]}]}
GET  /gesture-images/<word> -> {"word":"hello","images":["/images/hello1.jpg","/images/hello2.jpg"]} (404 if none)
## Test
curl http://localhost:5000/gesture-images/hello
curl -X POST localhost:5000/speech-to-sign -H "Content-Type: application/json" -d '{"text":"good morning"}'
