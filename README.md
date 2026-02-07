# MarkScan AI - IC Validation System

**MarkScan AI** is an advanced computer vision solution designed to verify the authenticity of Integrated Circuits (ICs) using deep learning. It automates the inspection process, detecting counterfeit components by analyzing their markings against known genuine patterns.

## 🚀 Features

- **Automated Defect Detection**: powered by **YOLOv8** for high-accuracy identification of counterfeit markings.
- **Local-First Architecture**: Completely offline-capable with a local SQLite database and file storage. No cloud dependencies required.
- **Real-time Analytics**: Interactive dashboard tracking pass/fail rates, vendor performance, and defect trends.
- **Dual Mode Operation**: 
  - **Manual Mode**: Upload single images for quick verification.
  - **Auto Scan Mode**: Simulates batch processing for high-volume inspection.
- **Detailed History**: Full audit trail of all inspections with searchable logs and image evidence.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Shadcn UI
- **Backend**: Python (FastAPI), Ultralytics YOLOv8, OpenCV, SQLite
- **AI Model**: Custom trained YOLOv8 model for IC surface defect detection

## 🏁 Quick Start

### Prerequisites
- Python 3.8+
- Node.js & npm

### Automatic Setup (Recommended)

We have provided convenience scripts to get you up and running quickly.

1. **Start the Backend Server**:
   ```bash
   chmod +x start_backend.sh
   ./start_backend.sh
   ```
   This will create a virtual environment, install Python dependencies, and launch the API at `http://localhost:8000`.

2. **Start the Frontend UI**:
   Open a new terminal window and run:
   ```bash
   chmod +x start_frontend.sh
   ./start_frontend.sh
   ```
   The application will be available at `http://localhost:8080`.

### Manual Setup

<details>
<summary>Click to expand manual instructions</summary>

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd ui
npm install
npm run dev
```
</details>

## 📂 Project Structure

```
IC-SCANNER/
├── backend/
│   ├── main.py              # FastAPI server & business logic
│   ├── inspection.db        # Local SQLite database
│   ├── best.pt              # Trained YOLOv8 model
│   └── static/uploads/      # Local storage for inspection images
├── ui/
│   ├── src/                 # React source code
│   │   ├── components/      # UI components (Dashboard, History, etc.)
│   │   └── pages/           # Application views
│   └── public/              # Static assets
└── database/
    └── schema.sql           # Database schema reference
```

## 🔍 How to Use

1. **Launch the App**: Open your browser to the frontend URL.
2. **Start Inspection**:
   - Go to **Inspection Hub**.
   - Select **Manual Scan** to upload an image of an IC.
   - Click **Scan & Verify** to run the AI analysis.
3. **Review Results**:
   - The system will flag the IC as "Genuine" or "Counterfeit" with a confidence score.
   - You can manually override results if necessary.
4. **Analyze Trends**:
   - Visit the **Analytics** tab to see inspection statistics by vendor and lot.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
*Built for the Smart India Hackathon (SIH) - Hardware Edition*
