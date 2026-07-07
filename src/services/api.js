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
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/admin/auth/login', {
        email,
        password,
      });
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Invalid credentials'));
    }
  },
  verifyOtp: async (email, otp) => {
    try {
      const response = await apiClient.post('/admin/auth/verify-otp', {
        email,
        otp,
      });
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'OTP verification failed'));
    }
  },

  requestPasswordReset: async (email) => {
  try {
    const response = await apiClient.post('/admin/auth/forgot-password', { email });
    return unwrapApiResult(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not send reset code'));
  }
},

verifyPasswordResetOtp: async (email, otp) => {
  try {
    const response = await apiClient.post('/admin/auth/forgot-password/verify-otp', { email, otp });
    return unwrapApiResult(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Invalid or expired code'));
  }
},

resetPassword: async (email, newPassword) => {
  try {
    const response = await apiClient.post('/admin/auth/reset-password', { email, newPassword });
    return unwrapApiResult(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not reset password'));
  }
},


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