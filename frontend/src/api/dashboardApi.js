import api from './axiosInstance';

/** Fetch dashboard overview for a plant */
export const getDashboardData = async (plantId) => {
  const response = await api.get(`/api/dashboard/${plantId}`);
  return response.data;
};
