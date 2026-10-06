# 🌊 Chennai Street-Level Flood Prediction System

A production-grade, full-stack flood prediction system for Chennai, India. Predicts flood risk at
the street/zone level using rainfall data, satellite imagery, elevation data, and historical flood records.

![Python](https://img.shields.io/badge/Backend-FastAPI-009688)
![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB)
![ML](https://img.shields.io/badge/ML-LightGBM-orange)
![PostGIS](https://img.shields.io/badge/Database-PostGIS-blue)
![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED)
![Jenkins CI](https://img.shields.io/badge/CI-Jenkins-D24939?logo=jenkins&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-13%20Passed-brightgreen)

---

## 🔄 Continuous Integration (Sprint 08)

The project includes an automated Continuous Integration pipeline implemented with Jenkins (`Jenkinsfile`):
- **Automated SCM Checkout**: Automatically retrieves source code upon Git repository updates.
- **Isolated Environment Build**: Prepares Python dependencies in an isolated virtual environment.
- **Automated Unit & Regression Testing**: Executes 13 `pytest` test suites verifying flood threshold boundaries, feature mappings, and health checks.
- **Docker Container Packaging**: Automatically builds and tags Docker images (`chennai-flood-backend:build-<BUILD_NUMBER>` and `latest`).
- **Automated Push Trigger Verification**: Live CI push test verified via GitHub Webhook / Poll SCM trigger (`test(ci): trigger automated build demonstration`).

---

## 🏗️ Architecture

```
┌──────────────────┐     ┌───────────────────────────────────┐
│  React App       │────▶│  FastAPI Backend                   │
│  (Leaflet Map)   │◀────│  (REST API + Embedded LightGBM)   │
│  Port 3000       │     │  Port 8000                         │
└──────────────────┘     └───────────────┬───────────────────┘
                                         │
                                 ┌───────▼──────────┐
                                 │  PostgreSQL +     │
                                 │  PostGIS          │
                                 │  Port 5432        │
                                 └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- At least 4GB RAM available

### Run with Docker Compose

```bash
# Clone the repository
git clone https://github.com/Premkumar7788/chennai-flood-prediction-system.git
cd chennai-flood-prediction-system

# Copy environment variables
cp .env.example .env

# Start everything
docker-compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
# Database: localhost:5432
```

### Run Services Individually (Development)

```bash
# 1. Start Database
docker-compose up postgres

# 2. Start Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 3. Start Frontend
cd frontend
npm install
npm run dev
```

---

## 🗺️ Features

- **Interactive Leaflet Map** — Chennai zones color-coded by flood risk (Green/Yellow/Red/Purple)
- **Real-time Predictions** — Enter rainfall data → get instant flood risk assessment per zone
- **15 Chennai Zones** — Adyar, Velachery, T. Nagar, Mylapore, Nungambakkam, and more
- **Historical Data** — 2015 and 2021 Chennai flood records
- **Alert System** — Automatic warnings when zones cross HIGH risk threshold
- **ML-Powered** — LightGBM model trained on elevation, drainage, rainfall, and satellite features

---

## 📡 API Endpoints

```
POST /api/predict            — Submit rainfall data, get flood prediction
GET  /api/zones              — All zones as GeoJSON FeatureCollection
GET  /api/rainfall/current   — Current rainfall readings from all stations
GET  /api/history?zone_id=1  — Historical flood events for a zone
GET  /api/streets            — Street-level GeoJSON data
GET  /health                 — Service health check
```

---

## 🧠 ML Model (LightGBM)

The LightGBM classifier uses environmental features to predict flood risk:

| Feature | Description |
|---------|-------------|
| `rainfall_1h_cm` | Current hour rainfall |
| `rainfall_24h_cm` | Last 24 hours cumulative |
| `rainfall_7d_cm` | Last 7 days cumulative |
| `avg_elevation_m` | Zone average elevation |
| `impervious_surface_pct` | Percentage of concrete/road |
| `drainage_capacity_score` | Drainage infrastructure quality |
| `humidity_pct` | Atmospheric humidity |
| `ndwi_value` | Satellite water index |
| `month` | Month (monsoon = Oct-Dec) |
| `reservoir_level_pct` | Reservoir fill percentage |

Risk Classification: **SAFE** (< 25%) → **MODERATE** (25-55%) → **HIGH** (55-80%) → **CRITICAL** (> 80%)

---

## 📁 Project Structure

```
├── frontend/               # React 18 + Vite + Leaflet.js (JSX)
├── backend/                # Python FastAPI + LightGBM (embedded ML)
│   └── app/
│       ├── api/            # Route handlers
│       ├── core/           # Configuration & settings
│       ├── db/             # Database session & connection
│       ├── models/         # SQLAlchemy + GeoAlchemy2 ORM
│       ├── schemas/        # Pydantic validation schemas
│       ├── services/       # Business logic & spatial queries
│       ├── ml/             # LightGBM model loader & inference
│       └── schedulers/     # Background jobs (weather fetch, alerts)
├── database/               # SQL schema & seed data
├── ml_pipeline/            # Offline data processing & model training
│   ├── pipeline/           # Data ingestion scripts
│   └── models/             # Training scripts & exported models
├── docker-compose.yml      # Full orchestration
└── .env.example            # Environment variable template
```

---

## 👥 Team Collaboration Guide

### Branch Strategy
- `main` — Stable, production-ready code
- `develop` — Integration branch for active development
- `feature/<name>` — Individual feature branches (e.g., `feature/postgis-zones`, `feature/react-map`)
- `bugfix/<name>` — Bug fix branches

### Workflow
1. Pull latest `develop` branch
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Make changes, commit, and push
4. Open a Pull Request to `develop`
5. Get code review from at least 1 teammate
6. Merge after approval

---

## 📊 Data Sources

| Dataset | Source |
|---------|--------|
| Rainfall | IMD / OpenWeatherMap API |
| Elevation | SRTM 30m DEM |
| Satellite | Sentinel-1/2 via Google Earth Engine |
| Street Network | OpenStreetMap (GeoFabrik) |
| Historical Floods | NDMA, EM-DAT, IMD records |

---

## ⚠️ Chennai Flood Context

- **Primary flood season**: October–December (Northeast Monsoon)
- **2015 Chennai Floods**: 49.4 cm rainfall in 24 hours at Nungambakkam — worst in 100 years
- **2021 Chennai Floods**: 21 cm in 24 hours, severe flooding in Velachery, Adyar, Porur
- **Key rivers**: Adyar, Cooum, Kosasthalaiyar
- **Critical reservoirs**: Chembarambakkam, Poondi, Red Hills

---

## 📄 License

This project is for educational and research purposes.
