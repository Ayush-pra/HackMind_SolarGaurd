import api from './axiosInstance';

/** Get full details for a single inverter */
export const getInverterDetails = async (inverterId) => {
  const response = await api.get(`/api/inverters/${inverterId}`);
  return response.data;
};

/** Get top features (risk analysis) for an inverter */
export const getRiskTrend = async (inverterId) => {
  // note: analytics router is mounted at /api/inverter (singular)
  const response = await api.get(`/api/inverter/${inverterId}/risk-trend`);
  return response.data;
};


/** Get AI analysis for an inverter */
export const generateAIAnalysis = async (inverterId) => {
  const response = await api.get(`/api/inverters/${inverterId}/analyze`);
  return response.data;
};
