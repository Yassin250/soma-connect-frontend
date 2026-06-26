import { apiClient } from './apiClient';

const unwrapApiResult = (response) => {
  if (
    response?.data &&
    typeof response.data === 'object' &&
    'data' in response.data
  ) {
    return response.data.data;
  }
  return response.data;
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const backendMessage = error?.response?.data?.message;
  return backendMessage || error?.message || fallbackMessage;
};

/* ========================
   AUTH SERVICE
======================== */
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
  },

  register: async (registrationData) => {
    try {
      const response = await apiClient.post(
        '/api/admin/auth/register',
        registrationData
      );
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Registration failed'));
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put(
        '/api/admin/auth/change-password',
        { currentPassword, newPassword }
      );
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Password change failed'));
    }
  },
};

/* ========================
   ADMIN SERVICE
======================== */
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

  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(
        `/api/admin/users/${id}`,
        userData
      );
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update user'));
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/api/admin/users/${id}`);
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete user'));
    }
  },

  toggleUserStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(
        `/api/admin/users/${id}/status`,
        { status }
      );
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update user status'));
    }
  },

  unlockUser: async (id) => {
    try {
      const response = await apiClient.patch(
        `/api/admin/users/${id}/unlock`
      );
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to unlock user'));
    }
  },

  /* ========================
     ROLES
  ======================== */

  getRoles: async () => {
    try {
      const response = await apiClient.get('/api/admin/roles');
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load roles'));
    }
  },

  createRole: async (roleData) => {
    try {
      const response = await apiClient.post('/api/admin/roles', roleData);
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create role'));
    }
  },

  updateRole: async (id, roleData) => {
    try {
      const response = await apiClient.put(
        `/api/admin/roles/${id}`,
        roleData
      );
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update role'));
    }
  },

  deleteRole: async (id) => {
    try {
      const response = await apiClient.delete(`/api/admin/roles/${id}`);
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete role'));
    }
  },

  toggleRoleStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(
        `/api/admin/roles/${id}/status`,
        { status }
      );
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update role status'));
    }
  },

  /* ========================
     PERMISSIONS
  ======================== */

  getPermissions: async () => {
    try {
      const response = await apiClient.get('/api/admin/permissions');
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load permissions'));
    }
  },
};