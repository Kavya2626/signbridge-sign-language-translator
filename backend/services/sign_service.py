import os
import re
import glob

IMG_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "static",
    "images"
)

def images_for_word(word: str):
    word = re.sub(r"[^a-z0-9]", "", word.lower())

    files = sorted(
        glob.glob(os.path.join(IMG_DIR, f"{word}[0-9]*.*"))
    )

    return [
        f"/images/{os.path.basename(f)}"
        for f in files
    ]


def sentence_to_signs(text: str):
    signs = []

    for char in text.lower():
        if char.isalpha():
            images = images_for_word(char)

            signs.append({
                "word": char.upper(),
                "images": images
            })

    return signs