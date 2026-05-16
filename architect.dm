# Parking Management System: Full Architecture & File Mapping

This document provides a comprehensive breakdown of the entire Parking Management System. The project follows a **Microservices Architecture**, divided into three main software components (Camera/AI, Backend API, Frontend Dashboard) and one hardware component (Arduino).

Here is the complete mapping of how all files and directories interact.

---

## 1. High-Level System Flow

```mermaid
graph TD
    %% Hardware & Vision
    Webcam[Webcam/Hardware] -->|Live Frames| Camera[Camera Module]
    Camera -->|MJPEG Stream| Dashboard[Frontend UI]
    Camera -->|Plate Text & Confidence| API[Flask Backend API]

    %% Backend & Database
    API <-->|Read/Write| DB[(SQLite Database)]
    Dashboard <-->|Fetch Status & History| API

    %% Automation
    API -->|Serial Commands O/C| Arduino[Arduino Microcontroller]
    Arduino -->|PWM/GPIO| Barrier[Physical Gate]
```

---

## 2. Directory & File Mapping

### 📸 `camera/` (Computer Vision & AI Service)
This service runs independently on **Port 5001**. Its sole responsibility is processing video frames, running the AI models, and communicating with the backend.

*   `camera.py`
    *   **Role**: The core AI engine.
    *   **How it works**: Uses a Python `while True` loop to capture frames from the webcam. It runs the YOLOv8 object detection model to find license plates. When a plate is found, it crops the image and runs a secondary OCR model to read the Arabic characters.
    *   **Interaction**: Sends HTTP POST requests to `http://localhost:5000/api/detect` with the parsed text. It also uses Flask to serve a raw `multipart/x-mixed-replace` video stream at `/video_feed` so the frontend can display the live camera feed without connecting directly to the webcam hardware.
*   `config.py`
    *   **Role**: Configuration central for the vision module.
    *   **How it works**: Stores variables like `CAMERA_SOURCE` (usually `0` for default webcam), `CONFIDENCE_THRESHOLD`, API endpoint URLs, and Arabic character mapping dictionaries.
*   `best.pt` & `best_ocr.pt`
    *   **Role**: The trained neural network weights. `best.pt` detects the bounding box of the plate. `best_ocr.pt` extracts the characters from that bounded box.

### ⚙️ `backend/` (API & Database Service)
This is the central nervous system running on **Port 5000**. It validates data, saves logs, and bridges the AI with the UI and the physical hardware.

*   `server.py`
    *   **Role**: The Flask REST API and Serial Controller.
    *   **How it works**: Listens for incoming POST requests from `camera.py`. When a plate is received, it asks `database.py` to log it. It exposes multiple GET endpoints for the frontend to fetch real-time analytics.
    *   **Hardware Mapping**: Contains the `SerialController` class. If an authorized plate is detected, it opens a serial connection (e.g., `COM3`) to the Arduino and sends the ASCII character `'O'` (Open). After 5 seconds, it sends `'C'` (Close).
*   `database.py`
    *   **Role**: The Data Access Layer (DAL).
    *   **How it works**: Provides Python functions to execute raw SQL queries against the database (e.g., `is_authorized()`, `add_parking_log()`, `get_parking_status()`). It handles calculating how many spots are currently free or occupied.
*   `parking.db`
    *   **Role**: A lightweight, serverless relational database (SQLite3).
    *   **Tables**:
        *   `authorized_vehicles`: A simple list of allowed license plates.
        *   `parking_logs`: A historical ledger of every vehicle that entered, the AI confidence score, the timestamp, and whether they were authorized or denied.
        *   `settings`: Key-value store for lot capacity (e.g., total spaces, reserved spaces).

### 🖥️ `frontend/` (React User Interface)
This is the modern web dashboard running on **Port 5173**. It is entirely decoupled from the hardware and AI, relying strictly on APIs.

*   `src/app/App.tsx`
    *   **Role**: The main application shell and state manager.
    *   **How it works**: Uses React `useEffect` hooks to poll `http://localhost:5000/api/status` and `http://localhost:5000/api/history` every 3 seconds. It manages the layout structure (Dashboard vs. Analytics tabs) and embeds the `http://localhost:5001/video_feed` as an `<img>` tag. It also monitors the history data to trigger the barrier animation automatically when an allowed plate enters.
*   `src/app/components/BarrierAnimation.tsx`
    *   **Role**: Visual feedback component.
    *   **How it works**: Uses SVG manipulation to rotate a graphical barrier arm based on the `barrierState` prop passed down from `App.tsx` (`closed` -> `opening` -> `open` -> `closing`).
*   `src/app/components/tables/AuthorizedVehiclesTable.tsx`
    *   **Role**: User management panel.
    *   **How it works**: Fetches data from `/api/authorized` and allows the admin to Add or Delete allowed license plates. These changes are immediately reflected in the SQLite database via POST/DELETE requests to the backend API.

### 🔌 `arduino/` (Hardware Controller)
The physical edge device that actuates the real-world gate.

*   `barrier.ino`
    *   **Role**: Microcontroller firmware.
    *   **How it works**: Constantly listens to the Serial port (baud rate 9600). When it receives an `'O'` from `server.py`, it activates a servo motor or relay to raise the physical parking gate. When it receives a `'C'`, it lowers it.

---

## 3. Step-by-Step Data Lifecycle

To understand how the system maps together, here is the lifecycle of a single car entering the parking lot:

1. **Capture**: A car pulls up. `camera.py` captures a frame from the webcam.
2. **AI Inference**: The YOLO model in `camera.py` detects the plate, crops it, and runs the OCR model to read "12345أ6".
3. **API Submission**: `camera.py` sends a JSON payload to `server.py` (`POST /api/detect`).
4. **Database Verification**: `server.py` receives the payload and calls `database.is_authorized("12345أ6")`.
5. **Logging**: `server.py` writes a new row to the `parking_logs` table in `parking.db`.
6. **Actuation**: Because the plate is authorized, `server.py` sends the `'O'` signal over the USB Serial cable to the Arduino to open the gate.
7. **UI Update**: Three seconds later, `App.tsx` running in the browser polls the API, sees the new entry in the history, updates the "Occupied Spaces" counter on the dashboard, and visually triggers the `BarrierAnimation` component.
