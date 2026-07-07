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
  },

  // Resend the login OTP. Backend: POST /admin/auth/resend-otp { username }.
  resendOtp: async (username) => {
    try {
      const response = await apiClient.post('/admin/auth/resend-otp', { username });
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not resend the code'));
    }
  },

  // Forced first-login / self-service password change while authenticated.
  // Backend: POST /admin/auth/change-password { oldPassword, newPassword, confirmPassword }.
  changePassword: async ({ oldPassword, newPassword, confirmPassword }) => {
    try {
      const response = await apiClient.post('/admin/auth/change-password', {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not change password'));
    }
  },

  // Step 1 of password reset: backend generates a reset token for the account.
  // Backend: POST /admin/auth/forgot-password { email }.
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/admin/auth/forgot-password', { email });
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not start password reset'));
    }
  },

  // Step 2 of password reset: submit the reset token + new password.
  // Backend: POST /admin/auth/reset-password { token, newPassword, confirmPassword }.
  resetPassword: async ({ token, newPassword, confirmPassword }) => {
    try {
      const response = await apiClient.post('/admin/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });
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
