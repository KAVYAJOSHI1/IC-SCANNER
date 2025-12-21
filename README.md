# MarkScan AI: Automated IC Defect Detection System

![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)
![YOLOv8](https://img.shields.io/badge/AI-YOLOv8-green)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)

## 🚀 Overview
**MarkScan AI** is an automated quality control solution designed to detect counterfeit Integrated Circuits (ICs) by analyzing surface markings. Built to integrate seamlessly into large-scale manufacturing conveyor belts, this system replaces manual inspection with high-speed computer vision to ensure hardware integrity and supply chain security.

This system addresses critical supply chain vulnerabilities where counterfeit chips are introduced into sensitive electronics.

## ✨ Key Features
* **Real-Time Detection:** Uses YOLOv8 to classify ICs as "Perfect" or "Defective" in milliseconds.
* **Cloud Logging:** Automatically uploads inspection images and metadata to Supabase (PostgreSQL) for audit trails.
* **Live Dashboard:** React-based UI for operators to view live scans and pass/fail status.
* **Security:** Prevents "Greenwashing" by creating an immutable record of every chip inspected.

## 🏗️ Architecture
The project follows a professional **Monorepo** structure:

```text
IC-SCANNER/
├── ui/              # Frontend: React.js (Vite) + Tailwind CSS
├── backend/         # Backend: FastAPI + YOLOv8 (Inference Engine)
└── database/        # Database: Supabase (PostgreSQL) Schema
