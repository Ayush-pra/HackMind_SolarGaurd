import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

/** Fetch all plants */
export const getPlants = async () => {
  const response = await api.get('/api/plants');
  return response.data;
};

/** Add a new plant */
export const addPlant = async (data) => {
  const response = await api.post('/api/plants', data);
  return response.data;
};

/** Add a new inverter to a plant */
export const addInverter = async (data) => {
  const response = await api.post('/api/inverters', data);
  return response.data;
};

/** Submit manual telemetry for an inverter */
export const addTelemetry = async (data) => {
  const response = await api.post('/api/telemetry', data);
  return response.data;
};
