import { apiClient } from './apiClient';

const unwrapApiResult = (response) => {
  if (response?.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }

  return response.data;
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const backendMessage = error?.response?.data?.message;
  return backendMessage || error?.message || fallbackMessage;
};

export const authService = {
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/admin/auth/login', {
        username,
        password,
      });
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Invalid credentials'));
    }
  },
  verifyOtp: async (username, otp) => {
    try {
      const response = await apiClient.post('/admin/auth/verify-otp', {
        username,
        otp,
      });
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'OTP verification failed'));
    }
  }
};

export const adminService = {
  getUsers: async () => {
    try {
      const response = await apiClient.get('/api/admin/users');
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load users'));
    }
  }
};