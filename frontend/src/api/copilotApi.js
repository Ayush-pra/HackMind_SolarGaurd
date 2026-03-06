import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

/** Send a question to the AI copilot */
export const askCopilot = async (payload) => {
  const response = await api.post('/api/copilot/ask', payload);
  return response.data;
};
