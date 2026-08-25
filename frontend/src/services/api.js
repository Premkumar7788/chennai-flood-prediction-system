import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Fallback mock GeoJSON for the 15 Chennai zones if backend is not currently connected
const MOCK_CHENNAI_ZONES = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', id: 1, properties: { id: 1, zoneName: 'Adyar', wardNumber: 170, riskLevel: 'HIGH', floodProbability: 0.76, areaSqkm: 15.4, avgElevationM: 4.8, drainageCapacity: 'LOW' }, geometry: { type: 'Polygon', coordinates: [[[80.24, 13.00], [80.27, 13.00], [80.26, 12.98], [80.23, 12.98], [80.24, 13.00]]] } },
    { type: 'Feature', id: 2, properties: { id: 2, zoneName: 'Velachery', wardNumber: 178, riskLevel: 'CRITICAL', floodProbability: 0.89, areaSqkm: 12.1, avgElevationM: 3.2, drainageCapacity: 'LOW' }, geometry: { type: 'Polygon', coordinates: [[[80.20, 12.98], [80.23, 12.98], [80.22, 12.96], [80.19, 12.96], [80.20, 12.98]]] } },
    { type: 'Feature', id: 3, properties: { id: 3, zoneName: 'T. Nagar', wardNumber: 135, riskLevel: 'MODERATE', floodProbability: 0.48, areaSqkm: 8.5, avgElevationM: 7.5, drainageCapacity: 'MEDIUM' }, geometry: { type: 'Polygon', coordinates: [[[80.22, 13.04], [80.25, 13.04], [80.24, 13.02], [80.21, 13.02], [80.22, 13.04]]] } },
    { type: 'Feature', id: 4, properties: { id: 4, zoneName: 'Mylapore', wardNumber: 125, riskLevel: 'LOW', floodProbability: 0.22, areaSqkm: 9.3, avgElevationM: 8.2, drainageCapacity: 'HIGH' }, geometry: { type: 'Polygon', coordinates: [[[80.26, 13.04], [80.28, 13.04], [80.28, 13.02], [80.25, 13.02], [80.26, 13.04]]] } },
    { type: 'Feature', id: 5, properties: { id: 5, zoneName: 'Anna Nagar', wardNumber: 102, riskLevel: 'LOW', floodProbability: 0.18, areaSqkm: 14.0, avgElevationM: 11.5, drainageCapacity: 'HIGH' }, geometry: { type: 'Polygon', coordinates: [[[80.20, 13.09], [80.23, 13.09], [80.22, 13.07], [80.19, 13.07], [80.20, 13.09]]] } },
    { type: 'Feature', id: 6, properties: { id: 6, zoneName: 'Saidapet', wardNumber: 142, riskLevel: 'HIGH', floodProbability: 0.71, areaSqkm: 7.8, avgElevationM: 5.1, drainageCapacity: 'LOW' }, geometry: { type: 'Polygon', coordinates: [[[80.21, 13.02], [80.24, 13.02], [80.23, 13.00], [80.20, 13.00], [80.21, 13.02]]] } },
    { type: 'Feature', id: 7, properties: { id: 7, zoneName: 'Guindy', wardNumber: 165, riskLevel: 'MODERATE', floodProbability: 0.52, areaSqkm: 11.2, avgElevationM: 6.9, drainageCapacity: 'MEDIUM' }, geometry: { type: 'Polygon', coordinates: [[[80.19, 13.01], [80.22, 13.01], [80.21, 12.99], [80.18, 12.99], [80.19, 13.01]]] } },
    { type: 'Feature', id: 8, properties: { id: 8, zoneName: 'Perungudi', wardNumber: 185, riskLevel: 'CRITICAL', floodProbability: 0.84, areaSqkm: 16.5, avgElevationM: 3.5, drainageCapacity: 'LOW' }, geometry: { type: 'Polygon', coordinates: [[[80.23, 12.96], [80.26, 12.96], [80.25, 12.93], [80.22, 12.93], [80.23, 12.96]]] } },
    { type: 'Feature', id: 9, properties: { id: 9, zoneName: 'Sholinganallur', wardNumber: 195, riskLevel: 'HIGH', floodProbability: 0.69, areaSqkm: 19.8, avgElevationM: 4.1, drainageCapacity: 'LOW' }, geometry: { type: 'Polygon', coordinates: [[[80.22, 12.91], [80.25, 12.91], [80.24, 12.87], [80.21, 12.87], [80.22, 12.91]]] } },
    { type: 'Feature', id: 10, properties: { id: 10, zoneName: 'Tambaram', wardNumber: 201, riskLevel: 'HIGH', floodProbability: 0.65, areaSqkm: 21.0, avgElevationM: 14.5, drainageCapacity: 'MEDIUM' }, geometry: { type: 'Polygon', coordinates: [[[80.11, 12.93], [80.14, 12.93], [80.13, 12.90], [80.10, 12.90], [80.11, 12.93]]] } }
  ]
};

const MOCK_RAINFALL = [
  { zoneId: 1, zoneName: 'Adyar', rainfall1hCm: 4.2, rainfall24hCm: 18.5, timestamp: new Date().toISOString() },
  { zoneId: 2, zoneName: 'Velachery', rainfall1hCm: 6.8, rainfall24hCm: 26.4, timestamp: new Date().toISOString() },
  { zoneId: 3, zoneName: 'T. Nagar', rainfall1hCm: 3.1, rainfall24hCm: 12.2, timestamp: new Date().toISOString() },
  { zoneId: 4, zoneName: 'Mylapore', rainfall1hCm: 1.8, rainfall24hCm: 7.4, timestamp: new Date().toISOString() },
  { zoneId: 5, zoneName: 'Anna Nagar', rainfall1hCm: 1.2, rainfall24hCm: 5.5, timestamp: new Date().toISOString() },
  { zoneId: 8, zoneName: 'Perungudi', rainfall1hCm: 5.9, rainfall24hCm: 22.1, timestamp: new Date().toISOString() }
];

export async function fetchZones() {
  try {
    const res = await api.get('/zones/geojson');
    return res.data;
  } catch (err) {
    console.warn('Using mock zones data (backend offline):', err.message);
    return MOCK_CHENNAI_ZONES;
  }
}

export async function fetchStreets() {
  try {
    const res = await api.get('/streets/geojson');
    return res.data;
  } catch (err) {
    return { type: 'FeatureCollection', features: [] };
  }
}

export async function fetchCurrentRainfall() {
  try {
    const res = await api.get('/rainfall/current');
    return res.data;
  } catch (err) {
    console.warn('Using mock rainfall data:', err.message);
    return MOCK_RAINFALL;
  }
}

export async function fetchHistory(startDate, endDate) {
  try {
    const params = {};
    if (startDate) params.start = startDate;
    if (endDate) params.end = endDate;
    const res = await api.get('/history', { params });
    return res.data;
  } catch (err) {
    return [
      { id: 1, zoneName: 'Velachery', floodDate: '2015-12-01', rainfall24hCm: 34.5, maxFloodDepthCm: 120, severity: 'CRITICAL', notes: 'Severe overflow of Velachery lake' },
      { id: 2, zoneName: 'Adyar', floodDate: '2015-12-01', rainfall24hCm: 29.0, maxFloodDepthCm: 95, severity: 'CRITICAL', notes: 'Adyar river breach' },
      { id: 3, zoneName: 'Saidapet', floodDate: '2021-11-11', rainfall24hCm: 18.2, maxFloodDepthCm: 60, severity: 'HIGH', notes: 'Maraimalai Adigalar Bridge area inundation' },
      { id: 4, zoneName: 'Perungudi', floodDate: '2023-12-04', rainfall24hCm: 27.6, maxFloodDepthCm: 85, severity: 'CRITICAL', notes: 'Cyclone Michaung severe waterlogging' }
    ];
  }
}

export async function submitPrediction(predictionData) {
  try {
    const res = await api.post('/predict', predictionData);
    return res.data;
  } catch (err) {
    console.warn('Simulating ML XGBoost prediction fallback:', err.message);
    const rain = Number(predictionData.rainfall1hCm || 0) + Number(predictionData.rainfall24hCm || 0) / 4;
    let prob = Math.min(0.98, Math.max(0.05, (rain / 20) * 0.8 + (predictionData.humidityPct || 70) / 500));
    let risk = 'LOW';
    if (prob > 0.75) risk = 'CRITICAL';
    else if (prob > 0.55) risk = 'HIGH';
    else if (prob > 0.35) risk = 'MODERATE';

    return {
      zoneId: predictionData.zoneId || 2,
      zoneName: predictionData.zoneName || 'Velachery',
      floodProbability: Number(prob.toFixed(3)),
      riskLevel: risk,
      predictedFloodDepthCm: Number((prob * 85).toFixed(1)),
      recommendedAction: risk === 'CRITICAL' ? 'Evacuate immediately' : risk === 'HIGH' ? 'Prepare flood barriers' : 'Monitor local conditions',
      timestamp: new Date().toISOString()
    };
  }
}
