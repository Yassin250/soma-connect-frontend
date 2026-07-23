import { apiClient } from './apiClient';

const unwrapApiResult = (response) => {
  if (response?.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }

  return response.data;
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseBody = error?.response?.data;
  const backendMessage = responseBody?.message;
  if (backendMessage) return backendMessage;

  if (responseBody?.errors && typeof responseBody.errors === 'object') {
    const firstError = Object.values(responseBody.errors)[0];
    if (typeof firstError === 'string' && firstError.trim()) return firstError;
  }

  return error?.message || fallbackMessage;
};

export const authService = {
  // Self-service learner signup. Backend: POST /admin/auth/register.
  registerLearner: async ({ name, email, password, confirmPassword }) => {
    try {
      const response = await apiClient.post('/admin/auth/register', {
        name, email, password, confirmPassword,
      });
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not create your account'));
    }
  },

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
  // ── Users ──────────────────────────────────────────────────────────────────
  getUsers: async ({ active, enabled } = {}) => {
    try {
      const params = {};
      if (active !== undefined) params.active = active;
      if (enabled !== undefined) params.enabled = enabled;
      return unwrapApiResult(await apiClient.get('/api/admin/users', { params }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load users'));
    }
  },
  createUser: async (payload) => {
    try {
      return unwrapApiResult(await apiClient.post('/api/admin/users', payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create user'));
    }
  },
  updateUser: async (id, payload) => {
    try {
      return unwrapApiResult(await apiClient.put(`/api/admin/users/${id}`, payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update user'));
    }
  },
  deleteUser: async (id) => {
    try {
      return unwrapApiResult(await apiClient.delete(`/api/admin/users/${id}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete user'));
    }
  },
  lockUser: async (id) => {
    try {
      return unwrapApiResult(await apiClient.post(`/api/admin/users/${id}/lock`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to lock user'));
    }
  },
  unlockUser: async (id) => {
    try {
      return unwrapApiResult(await apiClient.post(`/api/admin/users/${id}/unlock`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to unlock user'));
    }
  },
  setUserStatus: async (id, enabled) => {
    try {
      return unwrapApiResult(await apiClient.patch(`/api/admin/users/${id}/status`, { enabled }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update user status'));
    }
  },
  assignUserRoles: async (userId, roleIds) => {
    try {
      return unwrapApiResult(await apiClient.post(`/api/admin/users/${userId}/roles`, { roleIds }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to assign roles'));
    }
  },

  // ── Roles ──────────────────────────────────────────────────────────────────
  getRoles: async (active) => {
    try {
      const params = active !== undefined ? { active } : {};
      return unwrapApiResult(await apiClient.get('/api/admin/roles', { params }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load roles'));
    }
  },
  createRole: async (payload) => {
    try {
      return unwrapApiResult(await apiClient.post('/api/admin/roles', payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create role'));
    }
  },
  updateRole: async (id, payload) => {
    try {
      return unwrapApiResult(await apiClient.put(`/api/admin/roles/${id}`, payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update role'));
    }
  },
  deleteRole: async (id) => {
    try {
      return unwrapApiResult(await apiClient.delete(`/api/admin/roles/${id}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete role'));
    }
  },
  setRoleStatus: async (id, active) => {
    try {
      return unwrapApiResult(await apiClient.patch(`/api/admin/roles/${id}/status`, { active }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update role status'));
    }
  },
  assignRolePermissions: async (roleId, permissionIds) => {
    try {
      return unwrapApiResult(await apiClient.post(`/api/admin/roles/${roleId}/permissions`, { permissionIds }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to assign permissions'));
    }
  },

  // ── Permissions ────────────────────────────────────────────────────────────
  getPermissions: async () => {
    try {
      return unwrapApiResult(await apiClient.get('/api/admin/permissions'));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load permissions'));
    }
  },

  // ── System Parameters ─────────────────────────────────────────────────────
  getSystemParameters: async ({ active } = {}) => {
    try {
      const params = active !== undefined ? { active } : {};
      return unwrapApiResult(await apiClient.get('/api/admin/system-parameters', { params }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load system parameters'));
    }
  },
  createSystemParameter: async (payload) => {
    try {
      return unwrapApiResult(await apiClient.post('/api/admin/system-parameters', payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create system parameter'));
    }
  },
  updateSystemParameter: async (id, payload) => {
    try {
      return unwrapApiResult(await apiClient.put(`/api/admin/system-parameters/${id}`, payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update system parameter'));
    }
  },
  deleteSystemParameter: async (id) => {
    try {
      return unwrapApiResult(await apiClient.delete(`/api/admin/system-parameters/${id}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete system parameter'));
    }
  },
};

export const entityRegistrationService = {
  start: async (payload) => {
    try {
      const response = await apiClient.post('/entity/auth/register/start', payload);
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to start registration'));
    }
  },

  verifyOtp: async (payload) => {
    try {
      const response = await apiClient.post('/entity/auth/register/verify-otp', payload);
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to verify OTP'));
    }
  },

  resendOtp: async (payload) => {
    try {
      const response = await apiClient.post('/entity/auth/register/resend-otp', payload);
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to resend OTP'));
    }
  },

  complete: async (payload) => {
    try {
      const response = await apiClient.post('/entity/auth/register/complete', payload);
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to complete registration'));
    }
  },
};

// ---- Entity-admin: manage users within my own entity ----
export const entityUserService = {
  list: async () => {
    try {
      return unwrapApiResult(await apiClient.get('/api/entity/users'));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load users'));
    }
  },
  create: async (payload) => {
    try {
      return unwrapApiResult(await apiClient.post('/api/entity/users', payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create user'));
    }
  },
  update: async (id, payload) => {
    try {
      return unwrapApiResult(await apiClient.put(`/api/entity/users/${id}`, payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update user'));
    }
  },
  assignRoles: async (id, roleIds) => {
    try {
      return unwrapApiResult(await apiClient.post(`/api/entity/users/${id}/roles`, { roleIds }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to assign roles'));
    }
  },
  lock: async (id) => {
    try {
      return unwrapApiResult(await apiClient.post(`/api/entity/users/${id}/lock`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to lock user'));
    }
  },
  unlock: async (id) => {
    try {
      return unwrapApiResult(await apiClient.post(`/api/entity/users/${id}/unlock`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to unlock user'));
    }
  },
  setStatus: async (id, active) => {
    try {
      return unwrapApiResult(await apiClient.patch(`/api/entity/users/${id}/status`, { active }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update status'));
    }
  },
  remove: async (id) => {
    try {
      return unwrapApiResult(await apiClient.delete(`/api/entity/users/${id}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete user'));
    }
  },
};

// ---- Entity-admin: custom roles + assignable permission catalog ----
export const entityRoleService = {
  list: async () => {
    try {
      return unwrapApiResult(await apiClient.get('/api/entity/roles'));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load roles'));
    }
  },
  assignablePermissions: async () => {
    try {
      return unwrapApiResult(await apiClient.get('/api/entity/roles/assignable-permissions'));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load permissions'));
    }
  },
  create: async (payload) => {
    try {
      return unwrapApiResult(await apiClient.post('/api/entity/roles', payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create role'));
    }
  },
  update: async (id, payload) => {
    try {
      return unwrapApiResult(await apiClient.put(`/api/entity/roles/${id}`, payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update role'));
    }
  },
  remove: async (id) => {
    try {
      return unwrapApiResult(await apiClient.delete(`/api/entity/roles/${id}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete role'));
    }
  },
};

// ---- Entity-admin: course authoring within my own entity ----
export const entityCourseService = {
  list: async () => {
    try {
      return unwrapApiResult(await apiClient.get('/api/entity/courses'));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load courses'));
    }
  },
  getOne: async (id) => {
    try {
      return unwrapApiResult(await apiClient.get(`/api/entity/courses/${id}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load course'));
    }
  },
  // The full wizard payload — course, objectives, and curriculum saved atomically.
  create: async (payload) => {
    try {
      return unwrapApiResult(await apiClient.post('/api/entity/courses', payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create course'));
    }
  },
  update: async (id, payload) => {
    try {
      return unwrapApiResult(await apiClient.put(`/api/entity/courses/${id}`, payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update course'));
    }
  },
  setStatus: async (id, status) => {
    try {
      return unwrapApiResult(await apiClient.patch(`/api/entity/courses/${id}/status`, { status }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update course status'));
    }
  },
  remove: async (id) => {
    try {
      return unwrapApiResult(await apiClient.delete(`/api/entity/courses/${id}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete course'));
    }
  },
};

// ---- Super-admin: read-only course oversight across all entities ----
export const platformCourseService = {
  list: async ({ search, entityId, status } = {}) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (entityId) params.entityId = entityId;
      if (status) params.status = status;
      return unwrapApiResult(await apiClient.get('/api/admin/courses', { params }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load courses'));
    }
  },
  getOne: async (id) => {
    try {
      return unwrapApiResult(await apiClient.get(`/api/admin/courses/${id}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load course'));
    }
  },

  // ── Curriculum: granular module CRUD (admin oversight) ──────────────────
  // Module payload: { title, description, moduleType, lockedAfterPrevious, sortOrder? }
  createModule: async (courseId, payload) => {
    try {
      return unwrapApiResult(await apiClient.post(`/api/admin/courses/${courseId}/modules`, payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create module'));
    }
  },
  updateModule: async (courseId, moduleId, payload) => {
    try {
      return unwrapApiResult(await apiClient.put(`/api/admin/courses/${courseId}/modules/${moduleId}`, payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update module'));
    }
  },
  deleteModule: async (courseId, moduleId) => {
    try {
      return unwrapApiResult(await apiClient.delete(`/api/admin/courses/${courseId}/modules/${moduleId}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete module'));
    }
  },
  reorderModules: async (courseId, orderedIds) => {
    try {
      return unwrapApiResult(await apiClient.patch(`/api/admin/courses/${courseId}/modules/reorder`, { orderedIds }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to reorder modules'));
    }
  },

  // ── Curriculum: granular lesson-item CRUD (admin oversight) ─────────────
  // Lesson payload: { title, itemType, contentUrl, attachmentUrl, attachmentName, durationMinutes, required, sortOrder? }
  createLesson: async (courseId, moduleId, payload) => {
    try {
      return unwrapApiResult(await apiClient.post(`/api/admin/courses/${courseId}/modules/${moduleId}/items`, payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create lesson'));
    }
  },
  updateLesson: async (courseId, moduleId, itemId, payload) => {
    try {
      return unwrapApiResult(await apiClient.put(`/api/admin/courses/${courseId}/modules/${moduleId}/items/${itemId}`, payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update lesson'));
    }
  },
  deleteLesson: async (courseId, moduleId, itemId) => {
    try {
      return unwrapApiResult(await apiClient.delete(`/api/admin/courses/${courseId}/modules/${moduleId}/items/${itemId}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete lesson'));
    }
  },

  // ── Cross-course aggregation for the global Modules / Lessons oversight ──
  // Works today by flattening the existing read endpoints (list + getOne).
  // When a dedicated /api/admin/modules endpoint ships, swap the body here.
  listAllModules: async () => {
    const courses = await platformCourseService.list();
    const arr = Array.isArray(courses) ? courses : [];
    const details = await Promise.all(
      arr.map((c) => platformCourseService.getOne(c.id).catch(() => null))
    );
    const out = [];
    details.forEach((course) => {
      if (!course) return;
      (course.modules || []).forEach((m) => {
        out.push({
          ...m,
          courseId: course.id,
          courseTitle: course.title,
          courseCode: course.code,
          entityName: course.entityName,
          lessonCount: m.items?.length ?? 0,
        });
      });
    });
    return out;
  },
  listAllLessons: async () => {
    const courses = await platformCourseService.list();
    const arr = Array.isArray(courses) ? courses : [];
    const details = await Promise.all(
      arr.map((c) => platformCourseService.getOne(c.id).catch(() => null))
    );
    const out = [];
    details.forEach((course) => {
      if (!course) return;
      (course.modules || []).forEach((m) => {
        (m.items || []).forEach((i) => {
          out.push({
            ...i,
            courseId: course.id,
            courseTitle: course.title,
            entityName: course.entityName,
            moduleId: m.id,
            moduleTitle: m.title,
            moduleType: m.moduleType,
          });
        });
      });
    });
    return out;
  },
};

// ---- Public: course catalog for landing page (no auth required) ----
export const publicCourseService = {
  list: async ({ search, category, level } = {}) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (level) params.level = level;
      return unwrapApiResult(await apiClient.get('/api/public/courses', { params }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load courses'));
    }
  },
  getOne: async (id) => {
    try {
      return unwrapApiResult(await apiClient.get(`/api/public/courses/${id}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load course'));
    }
  },
};

// ---- Learner: a signed-in user's own enrollments + lesson progress ----
export const learnerCourseService = {
  // "My Courses" list — every course this learner has ever opened.
  listMyCourses: async () => {
    try {
      return unwrapApiResult(await apiClient.get('/api/learner/courses'));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load your courses'));
    }
  },
  // Full curriculum + this learner's completion state. Auto-enrolls on first call.
  getMyCourse: async (courseId) => {
    try {
      return unwrapApiResult(await apiClient.get(`/api/learner/courses/${courseId}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load course'));
    }
  },
  completeItem: async (courseId, itemId) => {
    try {
      return unwrapApiResult(await apiClient.post(`/api/learner/courses/${courseId}/items/${itemId}/complete`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to save your progress'));
    }
  },
};

// ---- Files: uploads for course covers and lesson attachments ----
export const fileService = {
  // kind: 'image' (covers — images only, ≤5MB) | 'attachment' (notes/videos).
  // Returns { url, name, size, contentType }.
  upload: async (file, { kind = 'attachment', onProgress } = {}) => {
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await apiClient.post('/api/files', form, {
        params: { kind },
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      return unwrapApiResult(response);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Upload failed — try again'));
    }
  },
};

// ---- Course categories: public read (dropdown/filters) + platform-admin CRUD ----
export const courseCategoryService = {
  // Active categories — for the course-builder dropdown and public filters.
  listActive: async () => {
    try {
      return unwrapApiResult(await apiClient.get('/api/public/course-categories'));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load categories'));
    }
  },
  // Platform admin: full taxonomy management.
  listAll: async () => {
    try {
      return unwrapApiResult(await apiClient.get('/api/admin/course-categories'));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load categories'));
    }
  },
  create: async (payload) => {
    try {
      return unwrapApiResult(await apiClient.post('/api/admin/course-categories', payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create category'));
    }
  },
  update: async (id, payload) => {
    try {
      return unwrapApiResult(await apiClient.put(`/api/admin/course-categories/${id}`, payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update category'));
    }
  },
  setStatus: async (id, active) => {
    try {
      return unwrapApiResult(await apiClient.patch(`/api/admin/course-categories/${id}/status`, null, { params: { active } }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update category status'));
    }
  },
  remove: async (id) => {
    try {
      return unwrapApiResult(await apiClient.delete(`/api/admin/course-categories/${id}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete category'));
    }
  },
};

// ---- Entity-admin: own entity profile ----
export const entityProfileService = {
  getProfile: async () => {
    try {
      return unwrapApiResult(await apiClient.get('/api/entity/profile'));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load profile'));
    }
  },
  updateProfile: async (payload) => {
    try {
      return unwrapApiResult(await apiClient.put('/api/entity/profile', payload));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update profile'));
    }
  },
};

// ---- Super-admin: directory of all registered entities ----
export const platformEntityService = {
  list: async ({ page = 0, size = 10, search = '' } = {}) => {
    try {
      const params = { page, size };
      if (search) params.search = search;
      return unwrapApiResult(await apiClient.get('/api/admin/entities', { params }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load entities'));
    }
  },
  getOne: async (id) => {
    try {
      return unwrapApiResult(await apiClient.get(`/api/admin/entities/${id}`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load entity'));
    }
  },
  getUsers: async (id) => {
    try {
      return unwrapApiResult(await apiClient.get(`/api/admin/entities/${id}/users`));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load entity users'));
    }
  },
  setStatus: async (id, active) => {
    try {
      return unwrapApiResult(await apiClient.patch(`/api/admin/entities/${id}/status`, { active }));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update entity status'));
    }
  },
};
