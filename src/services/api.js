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
      const response = await apiClient.post('/api/admin/auth/login', {
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
      const response = await apiClient.post('/api/admin/auth/verify-otp', {
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
  },
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/api/admin/users', userData);
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create user'));
    }
  },
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/api/admin/users/${userId}`, userData);
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update user'));
    }
  },
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/api/admin/users/${userId}`);
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete user'));
    }
  }
};
