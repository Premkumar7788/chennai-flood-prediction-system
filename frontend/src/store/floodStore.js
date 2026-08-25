import { create } from 'zustand';
import { fetchZones, fetchStreets, fetchCurrentRainfall, fetchHistory, submitPrediction } from '../services/api';

export const useFloodStore = create((set, get) => ({
  zones: null,
  streets: null,
  rainfall: [],
  selectedZone: null,
  history: [],
  predictions: {},
  loading: false,
  error: null,
  alertZones: [],
  lastUpdated: new Date(),

  setSelectedZone: (zone) => set({ selectedZone: zone }),
  clearSelectedZone: () => set({ selectedZone: null }),

  loadAllData: async () => {
    set({ loading: true, error: null });
    try {
      const [zonesData, streetsData, rainfallData, historyData] = await Promise.all([
        fetchZones(),
        fetchStreets(),
        fetchCurrentRainfall(),
        fetchHistory(),
      ]);

      const alerts = zonesData?.features?.filter(
        (f) => f.properties?.riskLevel === 'HIGH' || f.properties?.riskLevel === 'CRITICAL'
      ) || [];

      set({
        zones: zonesData,
        streets: streetsData,
        rainfall: rainfallData || [],
        history: historyData || [],
        alertZones: alerts,
        loading: false,
        lastUpdated: new Date(),
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  predictFloodRisk: async (requestData) => {
    set({ loading: true });
    try {
      const result = await submitPrediction(requestData);
      set((state) => ({
        predictions: {
          ...state.predictions,
          [result.zoneId || requestData.zoneId]: result,
        },
        loading: false,
      }));
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
