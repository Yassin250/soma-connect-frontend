import axios from 'axios';

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    throw new Error(
      'Missing VITE_API_BASE_URL. Define it in your Vite environment file.'
    );
  }

  return configuredBaseUrl.replace(/\/+$/, '');
};

export const API_BASE_URL = resolveApiBaseUrl();

/* ========================
   Axios Instance
======================== */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ========================
   REQUEST INTERCEPTOR
======================== */
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

/* ========================
   RESPONSE INTERCEPTOR
   (AUTO LOGOUT ON 401)
======================== */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // clear auth data safely
      localStorage.removeItem('soma_token');
      localStorage.removeItem('soma_user');

      // redirect to login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);