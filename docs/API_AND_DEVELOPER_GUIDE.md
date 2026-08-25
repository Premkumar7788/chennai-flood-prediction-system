# 🛠️ Chennai Flood Prediction System — Developer & API Integration Guide

## 1. Quick Start Guide

### Prerequisites
- **Node.js**: v18.0 or higher
- **Package Manager**: `npm` v9+

### Running the Frontend
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server (Port 3000)
npm run dev

# Run production build validation
npm run build
```

---

## 2. API Contract & Integration Specifications

The frontend communicates with the Spring Boot backend (`http://localhost:8080`) through the `/api` proxy.

### 2.1 Zone Polygons (GeoJSON)
- **Endpoint**: `GET /api/zones/geojson`
- **Response**: `FeatureCollection` (EPSG:4326)
- **Properties**:
  ```json
  {
    "id": 1,
    "zoneName": "Adyar",
    "wardNumber": 170,
    "riskLevel": "HIGH",
    "floodProbability": 0.76,
    "avgElevationM": 4.8,
    "drainageCapacity": "LOW"
  }
  ```

### 2.2 Live Rainfall Telemetry
- **Endpoint**: `GET /api/rainfall/current`
- **Response**: Array of current zone sensor readings:
  ```json
  [
    {
      "zoneId": 1,
      "zoneName": "Adyar",
      "rainfall1hCm": 4.2,
      "rainfall24hCm": 18.5,
      "timestamp": "2026-08-25T17:30:00Z"
    }
  ]
  ```

### 2.3 ML XGBoost Flood Risk Prediction
- **Endpoint**: `POST /api/predict`
- **Payload Schema**:
  ```json
  {
    "zoneId": 2,
    "rainfall1hCm": 5.5,
    "rainfall24hCm": 22.0,
    "rainfall7dCm": 35.0,
    "humidityPct": 88.0,
    "reservoirLevelPct": 78.0
  }
  ```
- **Response Schema**:
  ```json
  {
    "zoneId": 2,
    "zoneName": "Velachery",
    "floodProbability": 0.89,
    "riskLevel": "CRITICAL",
    "predictedFloodDepthCm": 45.0,
    "recommendedAction": "Immediate Evacuation to high ground.",
    "timestamp": "2026-08-25T17:30:00Z"
  }
  ```

---

## 3. Directory Layout

```
frontend/
├── src/
│   ├── components/
│   │   ├── charts/       # Recharts bar and donut visualizers
│   │   ├── common/       # RiskBadge and shared widgets
│   │   ├── dashboard/    # Alert banners and metric cards
│   │   ├── layout/       # AppShell, Header, Sidebar
│   │   └── map/          # Leaflet map, GeoJSON layer, legend
│   ├── pages/            # Dashboard, Map, Predict, History, About
│   ├── services/         # Axios API client with offline fallback support
│   ├── store/            # Zustand state store
│   └── utils/            # Map styles, coordinates, and formatters
```
