# =========================================================================
#  MarkScan AI - YOLOv8 Backend API with Local SQLite & File Storage
# =========================================================================
#
#  This script hosts a YOLOv8 model and uses a local SQLite database
#  to provide a complete data persistence solution for the inspection app.
#
# =========================================================================

import io
import cv2
import os
import shutil
import sqlite3
import numpy as np
from datetime import datetime
from ultralytics import YOLO
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional

# --- Constants ---
MODEL_PATH = 'best.pt'
CLASS_NAMES = {0: "Defective", 1: "Perfect"}
UPLOAD_DIR = "static/uploads"
DB_PATH = "inspection.db"
BASE_URL = "http://localhost:8000"  # Adjust if running on a different port/host

# --- Database Setup ---
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    # Create table based on schema.sql, adapted for SQLite
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inspection_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT DEFAULT (datetime('now', 'localtime')),
            vendor TEXT,
            lot_id TEXT,
            part_number TEXT,
            result TEXT NOT NULL,
            confidence REAL NOT NULL,
            operator TEXT,
            image_url TEXT
        )
    ''')
    conn.commit()
    conn.close()
    print("✅ Local database initialized.")

# Initialize DB on startup
init_db()

# --- FastAPI App Initialization & Model Loading ---
app = FastAPI(title="MarkScan AI Verification Engine")

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static directory for serving images
# Access images at: http://localhost:8000/uploads/filename.jpg
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

try:
    model = YOLO(MODEL_PATH)
    print(f"✅ Model '{MODEL_PATH}' loaded successfully.")
except Exception as e:
    print(f"❌ ERROR: Failed to load model at '{MODEL_PATH}'.")
    # We don't exit here to allow the server to run even if model fails, 
    # though predictions will fail.
    model = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all HTTP methods
    allow_headers=["*"], # Allows all headers
)

# --- Pydantic Models ---
class UpdateRecordRequest(BaseModel):
    result: str

# =========================================================================
#  API ENDPOINTS
# =========================================================================

@app.post("/predict/")
async def predict(
    file: UploadFile = File(...),
    vendor: str = Form(...),
    lotId: str = Form(...),
    partNumber: str = Form(...),
    operator: str = Form(...)
):
    """
    Performs inspection:
    1. Saves image locally.
    2. Runs YOLOv8 prediction.
    3. Saves record to SQLite.
    4. Returns result.
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded.")

    # 1. Read and decode image
    contents = await file.read()
    try:
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not decode image: {e}")

    # 2. Run YOLO prediction
    results = model.predict(source=img, verbose=False, conf=0.1)
    
    detections = []
    for box in results[0].boxes:
        cls_id = int(box.cls[0])
        confidence = float(box.conf[0])
        label = CLASS_NAMES.get(cls_id, "Unknown")
        detections.append({'label': label, 'confidence': confidence})

    top_detection = detections[0] if detections else {'label': 'No Detection', 'confidence': 0.0}
    print(f"Prediction: {top_detection['label']} ({top_detection['confidence']:.2f})")

    # 3. Save image locally
    filename = f"scan_{int(datetime.now().timestamp())}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
        image_url = f"{BASE_URL}/uploads/{filename}"
        print(f"✅ Image saved: {image_url}")
    except Exception as e:
        print(f"⚠️ Could not save image locally: {e}")
        image_url = None

    # 4. Insert record into SQLite
    try:
        scan_result = "pass" if top_detection['label'] == "Perfect" else "fail"
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO inspection_records 
            (vendor, lot_id, part_number, result, confidence, operator, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (vendor, lotId, partNumber, scan_result, top_detection['confidence'], operator, image_url))
        conn.commit()
        conn.close()
        print("✅ Record saved to database.")

    except Exception as e:
        print(f"❌ ERROR: Could not save record to database: {e}")
        # Continue to return prediction even if DB save fails
        
    return {"detections": [top_detection]}

@app.get("/inspection_records")
def get_records():
    """Fetch all inspection records, ordered by newest first."""
    try:
        conn = get_db_connection()
        records = conn.execute('SELECT * FROM inspection_records ORDER BY created_at DESC').fetchall()
        conn.close()
        return [dict(row) for row in records]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@app.put("/inspection_records/{record_id}")
def update_record(record_id: int, update_data: UpdateRecordRequest):
    """Update the result of an inspection record (e.g., override)."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE inspection_records SET result = ? WHERE id = ?', (update_data.result, record_id))
        conn.commit()
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Record not found")
        conn.close()
        return {"status": "success", "id": record_id, "new_result": update_data.result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@app.get("/")
def read_root():
    return {"status": "MarkScan AI Backend is running locally with SQLite."}