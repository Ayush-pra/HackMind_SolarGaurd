import axios from 'axios';

// Axios instance with base URL from environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Login user with email and password.
 * @param {{ email: string, password: string }} data
 * @returns {Promise} — expected shape: { token, user }
 */
export const loginUser = async (data) => {
  const response = await api.post('/api/auth/login', data);
  return response.data;
};

/**
 * Register a new user.
 * @param {{ fullName: string, email: string, password: string, role: string }} data
 * @returns {Promise} — expected shape: { message }
 */
export const signupUser = async (data) => {
  const response = await api.post('/api/auth/signup', data);
  return response.data;
};
