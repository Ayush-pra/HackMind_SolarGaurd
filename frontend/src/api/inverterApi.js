import api from './axiosInstance';

/** Get full details for a single inverter */
export const getInverterDetails = async (inverterId) => {
  const response = await api.get(`/api/inverters/${inverterId}`);
  return response.data;
};

/** Trigger AI analysis for an inverter */
export const generateAIAnalysis = async (inverterId) => {
  const response = await api.post(`/api/inverters/${inverterId}/analyze`);
  return response.data;
};
