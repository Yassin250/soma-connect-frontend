import axios from 'axios';

const FALLBACK_API_BASE_URL = 'http://localhost:5050';
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || FALLBACK_API_BASE_URL;
const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, '');

// Storage keys — kept in one place so AuthContext and the interceptors agree.
export const TOKEN_KEY = 'soma_token';
export const REFRESH_TOKEN_KEY = 'soma_refresh_token';
export const USER_KEY = 'soma_user';

const REFRESH_TOKEN_URL = '/admin/auth/refresh-token';

// Auth endpoints must never trigger the 401 -> refresh loop (a failed login is
// a legitimate 401, not an expired session).
const AUTH_ENDPOINTS = [
  '/admin/auth/login',
  '/admin/auth/verify-otp',
  REFRESH_TOKEN_URL,
];

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

export const apiClient = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Refresh-token plumbing (modeled on the e-procurement reference) ──────────
// While a refresh is in flight, other 401s queue up and replay once we have a
// fresh access token, so a burst of parallel requests only refreshes once.
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // The backend PasswordChangeFilter forces a first-login password change.
    if (status === 403 && error.response?.data?.code === 'PASSWORD_CHANGE_REQUIRED') {
      if (window.location.pathname !== '/change-password') {
        window.location.replace('/change-password');
      }
      return Promise.reject(error);
    }

    const isAuthCall = AUTH_ENDPOINTS.some((url) => originalRequest?.url?.includes(url));

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthCall) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        isRefreshing = false;
        clearSession();
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        // Bare axios call so the request interceptor doesn't attach the stale token.
        const { data } = await axios.post(
          `${normalizedBaseUrl}${REFRESH_TOKEN_URL}`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const payload = data?.data ?? data;
        const newToken = payload?.token;
        const newRefreshToken = payload?.refreshToken;
        if (!newToken) throw new Error('No token in refresh response');

        localStorage.setItem(TOKEN_KEY, newToken);
        if (newRefreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

        apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
