import axios from 'axios';

const FALLBACK_API_BASE_URL = 'http://localhost:5050';
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || FALLBACK_API_BASE_URL;
const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('soma_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('soma_token');
      localStorage.removeItem('soma_user');
    }
    return Promise.reject(error);
  }
);