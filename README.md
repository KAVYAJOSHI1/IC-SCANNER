# IC-SCANNER
IC Scanner is an automated quality control solution designed to detect counterfeit Integrated Circuits (ICs) by analyzing surface markings. Built to integrate seamlessly into large-scale manufacturing conveyor belts, this system replaces manual inspection with high-speed computer vision to ensure hardware integrity and supply chain security.
# MarkScan AI: Automated IC Defect Detection System

![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)
![YOLOv8](https://img.shields.io/badge/AI-YOLOv8-green)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)

## 🚀 Overview
**MarkScan AI** is a computer vision solution designed to automate the quality control process for Integrated Circuits (ICs). It replaces manual visual inspection with an AI-driven system capable of detecting counterfeit or defective IC markings with high precision.

This system was developed to solve supply chain vulnerabilities where counterfeit chips are introduced into critical electronics.

## 🏗️ Architecture
The project follows a **Monorepo** structure with a 3-tier architecture:

```text
IC-SCANNER/
├── ui/              # Frontend: React.js (Vite) + Tailwind CSS
├── backend/         # Backend: FastAPI + YOLOv8 (Inference Engine)
└── database/        # Database: Supabase (PostgreSQL) Schema
