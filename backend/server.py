import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import database
import serial
import time
import threading
import sys
import re

# Force UTF-8 encoding for stdout to handle Arabic characters on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    except:
        pass

app = Flask(__name__)
CORS(app)

# --- SERIAL CONFIGURATION ---
SERIAL_PORT = 'COM3'  # Change this to your Arduino port (e.g., 'COM3' or '/dev/ttyUSB0')
BAUD_RATE = 9600

class SerialController:
    def __init__(self, port, baud):
        self.port = port
        self.baud = baud
        self.serial = None
        self.connect()

    def connect(self):
        try:
            self.serial = serial.Serial(self.port, self.baud, timeout=1)
            print(f"[SERIAL] Connected to Arduino on {self.port}")
        except Exception as e:
            print(f"[SERIAL ERROR] Could not connect to {self.port}: {e}")

    def send_command(self, command):
        if self.serial and self.serial.is_open:
            try:
                self.serial.write(command.encode())
                print(f"[SERIAL] Command sent: {command}")
                return True
            except Exception as e:
                print(f"[SERIAL ERROR] Failed to send command: {e}")
        return False

# Initialize Serial
barrier_controller = SerialController(SERIAL_PORT, BAUD_RATE)

def trigger_barrier_sequence():
    """Sequence: Open -> Wait -> Close"""
    if barrier_controller.send_command('O'):
        # Keep open for 5 seconds
        time.sleep(5)
        barrier_controller.send_command('C')

@app.errorhandler(Exception)
def handle_exception(e):
    """Global error handler for unhandled exceptions."""
    print(f"[CRITICAL ERROR] Unhandled Exception: {e}")
    import traceback
    traceback.print_exc()
    return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@app.route('/')
def index():
    return jsonify({"status": "API Server Active", "port": 5000})

@app.route('/api/status', methods=['GET'])
def get_status():
    status = database.get_parking_status()
    if status:
        return jsonify(status)
    return jsonify({"error": "DB Error"}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    history = database.get_recent_history()
    return jsonify(history)

@app.route('/api/authorized', methods=['GET'])
def get_authorized():
    vehicles = database.get_authorized_vehicles()
    return jsonify(vehicles)

@app.route('/api/authorized', methods=['POST'])
def add_authorized():
    data = request.json
    plate = data.get('plate_number')
    if plate and database.add_authorized_vehicle(plate):
        return jsonify({"status": "added", "plate": plate})
    return jsonify({"error": "Failed to add"}), 400

@app.route('/api/authorized/<int:vehicle_id>', methods=['DELETE'])
def remove_authorized(vehicle_id):
    if database.remove_authorized_vehicle(vehicle_id):
        return jsonify({"status": "removed", "id": vehicle_id})
    return jsonify({"error": "Failed to remove"}), 400

@app.route('/api/detect', methods=['POST'])
def receive_detection():
    """Endpoint called by the separate camera.py script."""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    plate = data.get('plate_number', '').strip()
    confidence = data.get('confidence', 0.95)
    
    # Simple sanitization
    plate = re.sub(r'\s+', '', plate)
    
    try:
        print(f"[DEBUG] Received plate: {plate} (confidence: {confidence})")
    except UnicodeEncodeError:
        print(f"[DEBUG] Received plate: [Unicode Plate] (confidence: {confidence})")
    
    if not plate:
        print("[DEBUG] Plate number missing in request")
        return jsonify({"error": "No plate number provided"}), 400
        
    if database.add_parking_log(plate, confidence):
        print(f"[SUCCESS] Detection received and logged: {plate}")
        
        # Check authorization and open barrier if allowed
        if database.is_authorized(plate):
            try:
                print(f"[BARRIER] Plate {plate} is AUTHORIZED. Triggering barrier...")
            except UnicodeEncodeError:
                print(f"[BARRIER] Plate [Unicode] is AUTHORIZED. Triggering barrier...")
            threading.Thread(target=trigger_barrier_sequence, daemon=True).start()
        else:
            try:
                print(f"[BARRIER] Plate {plate} is DENIED.")
            except UnicodeEncodeError:
                print(f"[BARRIER] Plate [Unicode] is DENIED.")
            
        return jsonify({"status": "logged", "plate": plate})
    
    print(f"[ERROR] Database failed to log plate: {plate}")
    return jsonify({"error": "Database error"}), 500

@app.route('/api/camera/start', methods=['POST'])
def start_camera():
    # Camera is handled separately by camera.py now
    return jsonify({"status": "proxy_started", "info": "Camera script must be running"})

@app.route('/api/camera/stop', methods=['POST'])
def stop_camera():
    return jsonify({"status": "proxy_stopped"})

@app.route('/api/barrier/open', methods=['POST'])
def open_barrier():
    print("[API] Barrier opened manually via dashboard")
    database.add_parking_log("MANUAL", 1.0, action="OPEN_BARRIER")
    threading.Thread(target=trigger_barrier_sequence, daemon=True).start()
    return jsonify({"status": "opening"})

if __name__ == '__main__':
    database.init_db()
    print("API Backend (Database Only) started on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
