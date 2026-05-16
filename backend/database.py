import sqlite3
import os
from datetime import datetime

# Path to the database file
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'parking.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialise la base de données et crée les tables si nécessaire."""
    print(f"[DB] Initialisation: {DB_PATH}")
    conn = get_connection()
    cursor = conn.cursor()
    
    # Table des logs de parking
    cursor.execute('''CREATE TABLE IF NOT EXISTS parking_logs 
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                      plate_number TEXT, 
                      confidence REAL, 
                      status TEXT,
                      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, 
                      action TEXT)''')
    
    # Try to add status column if it doesn't exist (for existing DBs)
    try:
        cursor.execute("ALTER TABLE parking_logs ADD COLUMN status TEXT")
    except:
        pass
    
    # Table des véhicules autorisés
    cursor.execute('''CREATE TABLE IF NOT EXISTS authorized_vehicles 
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                      plate_number TEXT UNIQUE)''')
    
    # Table des paramètres (ex: total des places)
    cursor.execute('''CREATE TABLE IF NOT EXISTS settings 
                     (key TEXT PRIMARY KEY, value TEXT)''')
    
    # Valeurs par défaut
    cursor.execute("INSERT OR IGNORE INTO settings VALUES ('total_spaces', '50')")
    cursor.execute("INSERT OR IGNORE INTO settings VALUES ('reserved_spaces', '5')")
    
    # Quelques véhicules de test
    test_plates = ['12345أ6', 'MA-5678-B', '16D-9922', 'CA-7777-D']
    for plate in test_plates:
        cursor.execute("INSERT OR IGNORE INTO authorized_vehicles (plate_number) VALUES (?)", (plate,))
    
    conn.commit()
    conn.close()

def is_authorized(plate_number):
    """Vérifie si une plaque est dans la liste autorisée."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM authorized_vehicles WHERE plate_number = ?", (plate_number,))
        res = cursor.fetchone()
        conn.close()
        return res is not None
    except:
        return False

def get_authorized_vehicles():
    """Liste tous les véhicules autorisés."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM authorized_vehicles")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows
    except:
        return []

def add_authorized_vehicle(plate_number):
    """Ajoute un véhicule à la liste."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO authorized_vehicles (plate_number) VALUES (?)", (plate_number,))
        conn.commit()
        conn.close()
        return True
    except:
        return False

def remove_authorized_vehicle(vehicle_id):
    """Supprime un véhicule de la liste."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM authorized_vehicles WHERE id = ?", (vehicle_id,))
        conn.commit()
        conn.close()
        return True
    except:
        return False

def add_parking_log(plate_number, confidence, action="ENTRY"):
    """Ajoute une nouvelle détection dans la base de données."""
    status = "authorized" if is_authorized(plate_number) else "denied"
    
    try:
        print(f"[DEBUG] DB: Logging {plate_number} (status: {status}, confidence: {confidence})")
    except UnicodeEncodeError:
        print(f"[DEBUG] DB: Logging [Unicode Plate] (status: {status}, confidence: {confidence})")
        
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO parking_logs (plate_number, confidence, status, action) VALUES (?, ?, ?, ?)",
            (plate_number, confidence, status, action)
        )
        conn.commit()
        conn.close()
        
        try:
            print(f"[DEBUG] DB: Successfully inserted log for {plate_number}")
        except UnicodeEncodeError:
            print(f"[DEBUG] DB: Successfully inserted log for [Unicode Plate]")
            
        return True
    except Exception as e:
        print(f"[DB ERROR] add_parking_log failed: {e}")
        return False

def get_parking_status():
    """Récupère les statistiques d'occupation en temps réel."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT value FROM settings WHERE key = 'total_spaces'")
        row_total = cursor.fetchone()
        total = int(row_total[0]) if row_total else 50
        
        cursor.execute("SELECT value FROM settings WHERE key = 'reserved_spaces'")
        row_reserved = cursor.fetchone()
        reserved = int(row_reserved[0]) if row_reserved else 5
        
        # On compte les plaques uniques détectées aujourd'hui comme occupation
        cursor.execute("SELECT COUNT(DISTINCT plate_number) FROM parking_logs WHERE date(timestamp) = date('now')")
        row_occupied = cursor.fetchone()
        occupied = row_occupied[0] if row_occupied else 0
        
        conn.close()
        return {
            "total_spaces": total,
            "reserved_spaces": reserved,
            "occupied_spaces": occupied,
            "free_spaces": max(0, total - occupied - reserved)
        }
    except Exception as e:
        print(f"[DB ERROR] get_parking_status: {e}")
        return None

def get_recent_history(limit=30):
    """Récupère les dernières détections."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM parking_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows
    except Exception as e:
        print(f"[DB ERROR] get_recent_history: {e}")
        return []
