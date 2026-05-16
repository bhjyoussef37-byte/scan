<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Flask-2.x-000000?style=for-the-badge&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/YOLOv8-Ultralytics-00FFFF?style=for-the-badge&logo=yolo&logoColor=black" />
  <img src="https://img.shields.io/badge/Arduino-UNO-00979D?style=for-the-badge&logo=arduino&logoColor=white" />
</p>

# 🅿️ Parking Vision Pro

**An AI-Powered Automatic License Plate Recognition (ALPR) & Barrier Control System**

> Real-time license plate detection using YOLOv8, a React management dashboard, Flask REST API, and Arduino-controlled physical barrier — all working together as a complete smart parking solution.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the System](#-running-the-system)
- [API Reference](#-api-reference)
- [Arduino Wiring](#-arduino-wiring)
- [Configuration](#-configuration)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🔭 Overview

**Parking Vision Pro** is a full-stack smart parking management system that uses computer vision to automatically recognize vehicle license plates (including Arabic characters), verify them against a whitelist, and control a physical barrier in real time.

The system is built on a **distributed micro-services architecture** where each node handles a specific responsibility: perception, logic, or physical action.

---

## 🏗️ Architecture

```
┌─────────────────┐      MJPEG Stream       ┌──────────────────┐
│   Webcam / IP   │ ─────────────────────►   │  YOLO v8 Engine  │
│     Camera      │                          │   (camera.py)    │
└─────────────────┘                          └────────┬─────────┘
                                                      │ POST /api/detect
                                                      ▼
┌─────────────────┐    REST / Polling        ┌──────────────────┐
│  React + Vite   │ ◄─────────────────────►  │  Flask Backend   │
│   Dashboard     │                          │   (server.py)    │
└─────────────────┘                          └───────┬──────────┘
                                                     │ Serial @ 9600
                                                     ▼
                                             ┌──────────────────┐
                                             │   Arduino UNO    │
                                             │  (barrier.ino)   │
                                             │   Servo Motor    │
                                             └──────────────────┘
```

### Detection Lifecycle

| Step | Action | Component | Data |
|:----:|--------|-----------|------|
| 1 | Frame capture | `camera.py` | Raw image |
| 2 | AI inference (plate detection + OCR) | `camera.py` | Plate text |
| 3 | Send detection to API | `camera.py` → `server.py` | `POST {plate, confidence}` |
| 4 | Authorization check | `database.py` | Whitelist lookup |
| 5 | Barrier trigger (if authorized) | `server.py` → Arduino | Serial command `'O'` |
| 6 | Physical barrier opens | Arduino + Servo | Servo → 90° |
| 7 | Log entry | `database.py` | Insert into `parking_logs` |
| 8 | Dashboard updates | React UI | REST polling |
| 9 | Auto-close after 5s | `server.py` → Arduino | Serial command `'C'` |

---

## ✨ Features

- 🎯 **Real-time ALPR** — YOLOv8 plate detection + character OCR
- 🔤 **Arabic character support** — Maps YOLO class IDs to Arabic letters (أ, ب, د, ج, ه, و, ز, ط, ي, ك, ل)
- 🚧 **Automated barrier control** — Serial communication with Arduino Servo
- 📊 **Live dashboard** — React + Vite with real-time stats, history, and vehicle management
- 🔐 **Whitelist system** — Add/remove authorized plates via the dashboard
- 📹 **MJPEG live stream** — Camera feed viewable in the browser
- 🛡️ **Manual override** — Open barrier manually from the dashboard
- 📈 **Occupancy tracking** — Real-time space availability monitoring

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion, Radix UI, Recharts |
| **Backend API** | Python, Flask, Flask-CORS |
| **AI / Vision** | OpenCV, Ultralytics YOLOv8, PyTorch |
| **Database** | SQLite3 |
| **Hardware** | Arduino UNO, Servo Motor (SG90) |
| **Communication** | REST API, Serial (9600 baud), MJPEG streaming |

---

## 📁 Project Structure

```
projectfinal/
├── backend/
│   ├── server.py          # Flask API server (port 5000)
│   ├── database.py        # SQLite3 ORM & queries
│   └── parking.db         # Database file (auto-generated)
│
├── camera/
│   ├── camera.py          # ALPR engine + MJPEG stream (port 5001)
│   ├── config.py          # All configurable parameters
│   ├── best.pt            # YOLOv8 plate detection model
│   └── best_ocr.pt        # YOLOv8 character OCR model
│
├── frontend/
│   ├── src/               # React application source
│   ├── package.json       # Dependencies (pnpm)
│   └── vite.config.ts     # Vite configuration
│
├── arduino/
│   └── barrier.ino        # Servo barrier controller
│
├── ARCHITECTURE.md         # Detailed architecture documentation
└── README.md               # ← You are here
```

---

## 📋 Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| pnpm | 8+ |
| Arduino IDE | 2.x (for flashing `barrier.ino`) |
| Webcam or IP Camera | Any USB/MJPEG source |

### Python Packages (Backend)

```
flask
flask-cors
pyserial
```

### Python Packages (Camera / AI)

```
opencv-python
ultralytics
torch
requests
flask
flask-cors
```

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/bhjyoussef37-byte/scan.git
cd scan
```

### 2. Backend Setup

```bash
cd backend
pip install flask flask-cors pyserial
```

### 3. Camera / AI Setup

```bash
cd camera
pip install opencv-python ultralytics torch requests flask flask-cors
```

> **Note:** The YOLO model weights (`best.pt` and `best_ocr.pt`) must be present in the `camera/` directory. These are custom-trained models for Moroccan license plate detection.

### 4. Frontend Setup

```bash
cd frontend
pnpm install
```

### 5. Arduino Setup

1. Open `arduino/barrier.ino` in the Arduino IDE
2. Connect your Arduino UNO via USB
3. Upload the sketch
4. Note the COM port (e.g., `COM3`) — update `SERIAL_PORT` in `backend/server.py`

---

## ▶️ Running the System

Start each component in a **separate terminal**:

### Terminal 1 — Backend API

```bash
cd backend
python server.py
```
> Runs on `http://localhost:5000`

### Terminal 2 — Camera / AI Engine

```bash
cd camera
python camera.py
```
> MJPEG stream at `http://localhost:5001/video_feed`

### Terminal 3 — Frontend Dashboard

```bash
cd frontend
pnpm run dev
```
> Dashboard at `http://localhost:5173`

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/api/status` | Parking occupancy stats |
| `GET` | `/api/history` | Recent detection logs (last 30) |
| `GET` | `/api/authorized` | List authorized vehicles |
| `POST` | `/api/authorized` | Add vehicle `{ "plate_number": "..." }` |
| `DELETE` | `/api/authorized/:id` | Remove vehicle by ID |
| `POST` | `/api/detect` | Receive plate detection `{ "plate_number": "...", "confidence": 0.95 }` |
| `POST` | `/api/barrier/open` | Manual barrier override |

---

## 🔌 Arduino Wiring

| Component | Arduino Pin |
|-----------|-------------|
| Servo Signal (Orange) | **D9** |
| Servo Power (Red) | **5V** |
| Servo Ground (Brown) | **GND** |

**Serial Commands:**
- `'O'` → Open barrier (servo to 90°)
- `'C'` → Close barrier (servo to 0°)

---

## ⚙️ Configuration

All camera/AI settings are centralized in `camera/config.py`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `CAMERA_SOURCE` | `0` | `0` for webcam, URL for IP cam |
| `FRAME_WIDTH` | `640` | Capture resolution width |
| `FRAME_HEIGHT` | `480` | Capture resolution height |
| `CONFIDENCE_THRESHOLD` | `0.5` | Min confidence for plate detection |
| `OCR_CONFIDENCE_THRESHOLD` | `0.4` | Min confidence for character OCR |
| `COOLDOWN_SECONDS` | `5` | Seconds before re-sending same plate |
| `API_URL` | `http://localhost:5000/api/detect` | Backend endpoint |
| `STREAM_PORT` | `5001` | MJPEG stream port |

Backend serial port is set in `backend/server.py`:

```python
SERIAL_PORT = 'COM3'   # Change to your Arduino port
BAUD_RATE = 9600
```

---

## 📊 Database Schema

### `authorized_vehicles`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `plate_number` | TEXT | Unique plate string |

### `parking_logs`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `plate_number` | TEXT | Detected plate |
| `confidence` | REAL | Detection confidence |
| `status` | TEXT | `authorized` or `denied` |
| `action` | TEXT | `ENTRY`, `OPEN_BARRIER`, or `MANUAL` |
| `timestamp` | DATETIME | Server timestamp |

---

## 📄 License

This project is developed as an academic/final project. All rights reserved.

---

<p align="center">
  Built with ❤️ using YOLOv8, React, Flask & Arduino
</p>
