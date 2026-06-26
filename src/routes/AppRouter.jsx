import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { AuthPage } from '../features/auth/AuthPage';
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';

import { SchoolRegistrationForm } from '../features/schools/components/SchoolRegistrationForm';
import { SuperAdminApprovals } from '../features/schools/components/SuperAdminApprovals';
import { SchoolSetupChecklist } from '../features/schools/components/SchoolSetupChecklist';
import { SchoolAdminDashboard } from '../features/schools/components/SchoolAdminDashboard';
import { StudentJoinPortal } from '../features/schools/components/StudentJoinPortal';

import { StudentDashboard } from '../features/learning/pages/StudentDashboard';
import { ModuleViewer } from '../features/learning/components/ModuleViewer';
import { QuizEngine } from '../features/learning/components/QuizEngine';

import { AssignmentSubmit } from '../features/assignments/components/AssignmentSubmit';
import { mockDb } from '../services/mockDb';

const getUserRoles = (user) => {
  if (!user) return [];
  if (Array.isArray(user.roles)) return user.roles;
  if (typeof user.roles === 'string') return [user.roles];
  return user.role ? [user.role] : [];
};

const getDefaultRouteForUser = (user) => {
  const roles = getUserRoles(user);

  if (roles.includes('ADMIN') || roles.includes('System Admin')) {
    return '/super-admin/approvals';
  }

  if (roles.includes('SCHOOL_ADMIN')) {
    const school = mockDb.getSchool(user.schoolId);
    return school?.status === 'ACTIVE'
      ? '/school/dashboard'
      : '/school/setup';
  }

  if (roles.includes('LECTURER')) return '/school/dashboard';
  if (roles.includes('STUDENT')) return '/student/dashboard';

  return '/admin/users';
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  const roles = getUserRoles(user);

  if (!token || !user) return <Navigate to="/login" replace />;

  if (
    allowedRoles?.length &&
    !allowedRoles.some((role) => roles.includes(role))
  ) {
    return <Navigate to={getDefaultRouteForUser(user)} replace />;
  }

  return children;
};

const HomeRedirect = () => {
  const { user, token } = useAuth();

  return (
    <Navigate
      to={token && user ? getDefaultRouteForUser(user) : '/login'}
      replace
    />
  );
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public route */}
        <Route path="/login" element={<AuthPage />} />

        {/* Admin */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'System Admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />

        {/* School onboarding */}
        <Route
          path="/register-school"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'System Admin']}>
              <SchoolRegistrationForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/approvals"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'System Admin']}>
              <SuperAdminApprovals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/school/setup"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
              <SchoolSetupChecklist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/school/dashboard"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'LECTURER']}>
              <SchoolAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/join/:schoolSlug"
          element={<StudentJoinPortal />}
        />

        {/* Learning (Students) */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/module/:moduleId"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ModuleViewer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/quiz/:quizId"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <QuizEngine />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/assignment/:assignmentId"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <AssignmentSubmit />
            </ProtectedRoute>
          }
        />

        {/* Home */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
};