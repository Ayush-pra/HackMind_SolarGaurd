import api from './axiosInstance';

/** Send a question to the AI copilot */
export const askCopilot = async (payload) => {
  const response = await api.post('/api/copilot/ask', payload);
  return response.data;
};
