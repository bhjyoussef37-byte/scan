import cv2
import threading
import time
import requests
import torch
from flask import Flask, Response
from flask_cors import CORS
from ultralytics import YOLO

# Fix for PyTorch security issue if needed, but avoid multiple keyword argument error
# Fix for PyTorch 2.6+ weights_only security update
# This monkey-patch ensures that torch.load defaults to weights_only=False
# which is required for loading custom YOLO/Ultralytics model structures.
import torch
original_load = torch.load
def patched_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return original_load(*args, **kwargs)
torch.load = patched_load

# Import our new config
import config

class ALPRProcessor:
    def __init__(self):
        print("--- [VISION] Initializing AI Models ---")
        try:
            self.model_plaque = YOLO(config.MODEL_PLAQUE_PATH, task='detect')
            self.model_ocr = YOLO(config.MODEL_OCR_PATH, task='detect')
            print("Models Loaded.")
        except Exception as e:
            print(f"Initialization Error: {e}")
            raise e

        self.latest_frame = None
        self.lock = threading.Lock()
        self.statut_display = "READY"
        self.last_sent_plate = ""
        self.last_sent_time = 0

    def process_plate(self, frame):
        """Main AI Logic for detection and OCR."""
        results = self.model_plaque.predict(frame, conf=config.CONFIDENCE_THRESHOLD, verbose=False)
        found = False
        
        for box in results[0].boxes:
            if int(box.cls[0]) == 2: # Plate class
                found = True
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
                crop = frame[max(0,y1-5):min(frame.shape[0],y2+5), max(0,x1-5):min(frame.shape[1],x2+5)]
                if crop.size > 0:
                    text = self.perform_ocr(crop)
                    if text:
                        print(f"[DEBUG] Plate detected: {text}")
                        self.statut_display = f"PLATE: {text}"
                        self.send_to_backend(text)
        
        if not found:
            self.statut_display = "SCANNING..."
        
        return frame

    def perform_ocr(self, crop):
        """Reads characters from a cropped plate image."""
        ocr_res = self.model_ocr.predict(crop, conf=config.OCR_CONFIDENCE_THRESHOLD, iou=0.4, verbose=False)
        chars = []
        for cbox in ocr_res[0].boxes:
            chars.append((float(cbox.xyxy[0][0]), config.NOMS_YOLO[int(cbox.cls[0])]))
        
        if not chars: return None
        
        chars.sort(key=lambda x: x[0]) # Left to right
        text = "".join([config.LETTRES_ARABES.get(c[1], c[1]) for c in chars])
        return text

    def send_to_backend(self, plate_text):
        """Sends data to the API server with cooldown check."""
        now = time.time()
        if plate_text == self.last_sent_plate and (now - self.last_sent_time) < config.COOLDOWN_SECONDS:
            # print(f"[DEBUG] Cooldown active for {plate_text}")
            return

        print(f"[DEBUG] Sending to backend: {plate_text}")
        try:
            response = requests.post(config.API_URL, json={"plate_number": plate_text, "confidence": 0.95}, timeout=2)
            if response.status_code == 200:
                self.last_sent_plate = plate_text
                self.last_sent_time = now
                print(f"[SUCCESS] {plate_text} logged in backend")
            else:
                print(f"[ERROR] Backend returned {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[ERROR] Failed to connect to backend: {e}")

    def run_camera_loop(self):
        """Continuously captures frames and processes them."""
        cap = cv2.VideoCapture(config.CAMERA_SOURCE)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.FRAME_WIDTH)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.FRAME_HEIGHT)
        
        while True:
            ret, frame = cap.read()
            if not ret: continue

            processed_frame = self.process_plate(frame)
            
            # Overlay status
            cv2.putText(processed_frame, self.statut_display, (20, 40), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            
            with self.lock:
                self.latest_frame = processed_frame.copy()
            time.sleep(0.01)

# --- WEB SERVER FOR STREAMING ---
app = Flask(__name__)
CORS(app)
processor = ALPRProcessor()

@app.route('/video_feed')
def video_feed():
    def generate():
        while True:
            with processor.lock:
                if processor.latest_frame is None: continue
                _, buffer = cv2.imencode('.jpg', processor.latest_frame)
                frame_bytes = buffer.tobytes()
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.04)
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    # Start Vision in background
    threading.Thread(target=processor.run_camera_loop, daemon=True).start()
    print(f"Camera Stream started on http://localhost:{config.STREAM_PORT}/video_feed")
    app.run(host='0.0.0.0', port=config.STREAM_PORT, debug=False)