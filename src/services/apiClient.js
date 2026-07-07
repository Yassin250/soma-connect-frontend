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

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('soma_refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('soma_token');
        localStorage.removeItem('soma_user');
        localStorage.removeItem('soma_refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const resp = await fetch('http://localhost:5050/admin/auth/refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!resp.ok) throw new Error('Refresh failed');
        const data = await resp.json();
        const newToken = data.token || data.data?.token;
        if (!newToken) throw new Error('No token in refresh response');
        localStorage.setItem('soma_token', newToken);
        onRefreshed(newToken);
        isRefreshing = false;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem('soma_token');
        localStorage.removeItem('soma_user');
        localStorage.removeItem('soma_refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);