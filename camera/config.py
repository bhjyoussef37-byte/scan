import os

# --- PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PLAQUE_PATH = os.path.join(BASE_DIR, "best.pt")
MODEL_OCR_PATH = os.path.join(BASE_DIR, "best_ocr.pt")

# --- CAMERA ---
CAMERA_SOURCE = 0  # 0 for webcam, or "http://ip:port/video" for IP Cam
FRAME_WIDTH = 640
FRAME_HEIGHT = 480

# --- ALPR SETTINGS ---
CONFIDENCE_THRESHOLD = 0.5
OCR_CONFIDENCE_THRESHOLD = 0.4
COOLDOWN_SECONDS = 5

# --- NETWORK ---
API_URL = "http://localhost:5000/api/detect"
STREAM_PORT = 5001

# --- DICTIONARIES ---
NOMS_YOLO = ['0', '1', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '2', '20', '3', '4', '5', '6', '7', '8', '9']
LETTRES_ARABES = {
    '10': 'أ', '11': 'ب', '12': 'د', '13': 'ج', '14': 'ه', 
    '15': 'و', '16': 'ز', '17': 'ط', '18': 'ي', '19': 'ك', '20': 'ل'
}
