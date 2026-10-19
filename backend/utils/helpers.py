import base64, cv2, numpy as np

def decode_image(data_url: str):
    """Decode a base64 data-URL (from the browser canvas) into a BGR frame."""
    raw = base64.b64decode(data_url.split(",")[-1])
    return cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)

def landmarks_to_features(lm):
    """21 landmarks -> 63 floats, translated to wrist and scaled (position/size invariant)."""
    pts = np.array([[p.x, p.y, p.z] for p in lm], dtype=np.float32)
    pts -= pts[0]
    scale = np.max(np.abs(pts)) or 1.0
    return (pts / scale).flatten()
