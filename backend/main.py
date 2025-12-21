# =========================================================================
#  MarkScan AI - YOLOv8 Backend API with Supabase Integration
# =========================================================================
#
#  This script hosts a YOLOv8 model and connects to a Supabase backend
#  to provide a complete data persistence solution for the inspection app.
#
# =========================================================================

import io
import cv2
import os
import numpy as np
from datetime import datetime
from ultralytics import YOLO
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
# Add this to your imports
from dotenv import load_dotenv 

# Add this right below the imports
load_dotenv()

# --- Constants ---
MODEL_PATH = 'best.pt'
CLASS_NAMES = {0: "Defective", 1: "Perfect"}

# --- Supabase Setup ---
# IMPORTANT: Get these from your Supabase Project Settings -> API
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Successfully connected to Supabase.")
except Exception as e:
    print(f"❌ ERROR: Could not connect to Supabase. Details: {e}")
    exit()

# --- FastAPI App Initialization & Model Loading ---
app = FastAPI(title="MarkScan AI Verification Engine")

try:
    model = YOLO(MODEL_PATH)
    print(f"✅ Model '{MODEL_PATH}' loaded successfully.")
except Exception as e:
    print(f"❌ ERROR: Failed to load model at '{MODEL_PATH}'.")
    exit()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"], # Allows all HTTP methods
    allow_headers=["*"], # Allows all headers
)

# =========================================================================
#  API ENDPOINT FOR PREDICTION AND STORAGE
# =========================================================================

@app.post("/predict/")
async def predict(
    file: UploadFile = File(...),
    # These values will be sent from the React frontend's FormData
    vendor: str = Form(...),
    lotId: str = Form(...),
    partNumber: str = Form(...),
    operator: str = Form(...)
):
    """
    This endpoint performs a full inspection cycle:
    1. Receives an image and its metadata from the UI.
    2. Runs the YOLOv8 model prediction.
    3. Uploads the original image to Supabase Storage.
    4. Saves the complete inspection record to the Supabase database.
    5. Returns the prediction result to the UI.
    """
    # 1. Read and decode the image
    contents = await file.read()
    try:
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not decode image: {e}")

    # 2. Run YOLO prediction
    results = model.predict(source=img, verbose=False) # verbose=False keeps the logs clean

    # 3. Process results to find the top detection
    detections = []
    for box in results[0].boxes:
        cls_id = int(box.cls[0])
        confidence = float(box.conf[0])
        label = CLASS_NAMES.get(cls_id, "Unknown")
        detections.append({'label': label, 'confidence': confidence})

    # Default to 'Defective' if the model finds nothing
    top_detection = detections[0] if detections else {'label': 'Defective', 'confidence': 0.0}
    print(f"Prediction complete. Top result: {top_detection['label']} ({top_detection['confidence']:.2f})")

    # 4. Upload image to Supabase Storage
    image_url = None
    try:
        # Create a unique file name to prevent overwrites
        file_path_in_bucket = f"scan_{int(datetime.now().timestamp())}_{file.filename}"
        
        # Upload the file bytes
        supabase.storage.from_("inspection_images").upload(
            file=contents,
            path=file_path_in_bucket,
            file_options={"content-type": file.content_type}
        )
        
        # Get the public URL for the newly uploaded file
        res = supabase.storage.from_("inspection_images").get_public_url(file_path_in_bucket)
        image_url = res
        print(f"✅ Image uploaded to Supabase Storage: {image_url}")

    except Exception as e:
        print(f"⚠️ Could not upload image to Supabase Storage. Details: {e}")

    # 5. Insert record into Supabase Database
    try:
        scan_result = "pass" if top_detection['label'] == "Perfect" else "fail"
        
        # Insert the data, including the permanent image URL
        supabase.table('inspection_records').insert({
            "vendor": vendor,
            "lot_id": lotId,
            "part_number": partNumber,
            "result": scan_result,
            "operator": operator,
            "image_url": image_url, # Save the permanent link
            "confidence": top_detection['confidence']
        }).execute()
        print("✅ Inspection record saved to database.")

    except Exception as e:
        print(f"❌ ERROR: Could not save record to database. Details: {e}")
        # Optionally, raise an HTTPException to inform the frontend of the DB error
        
    # 6. Return the prediction result to the UI
    return {"detections": [top_detection]}

# --- A simple root endpoint to confirm the server is running ---
@app.get("/")
def read_root():
    return {"status": "MarkScan AI Backend is running."}