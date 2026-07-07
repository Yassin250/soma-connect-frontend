import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';
import { RolesPage } from '../features/admin/pages/RolesPage';
import { PermissionsPage } from '../features/admin/pages/PermissionsPage';
import { SchoolApprovalsPage } from '../features/admin/pages/SchoolApprovalsPage';
import { AdminCommandCenter } from '../features/admin/pages/AdminCommandCenter';
import { SchoolSetupChecklist } from '../features/schools/components/SchoolSetupChecklist';
import { SchoolAdminDashboard } from '../features/schools/components/SchoolAdminDashboard';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import ChangePasswordPage from '../features/auth/pages/ChangePasswordPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { AdminLayout } from '../features/admin/layouts/AdminLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LearningLayout } from '../layouts/LearningLayout';

// Single source of truth for "where does this role land after login".
export const dashboardPathForRoles = (roles) => {
  const primaryRole = roles?.[0]?.toUpperCase();
  switch (primaryRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/admin/dashboard';
    case 'SCHOOL_ADMIN':
      return '/school/dashboard';
    case 'STUDENT':
      return '/student/dashboard';
    case 'LECTURER':
      return '/lecturer/dashboard';
    default:
      return '/admin/dashboard';
  }
};

// Requires a valid (non-expired) session; otherwise back to login.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Login/forgot pages: an already-authenticated user is bounced to their home
// so hitting "/" or "/login" never flashes the auth screens over a live session.
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) return <Navigate to={dashboardPathForRoles(user?.roles)} replace />;
  return children;
};

const SchoolRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user.schoolId) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.roles?.[0]?.toUpperCase())) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Root ("/"): send authenticated users to their dashboard, everyone else to login.
const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  return <Navigate to={isAuthenticated ? dashboardPathForRoles(user?.roles) : '/login'} replace />;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth screens — hidden from users who already have a session */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
        <Route path="/reset-password" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* Forced first-login password change — needs a session but no role gate */}
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<AdminRoute><AdminCommandCenter /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
          <Route path="/admin/roles" element={<AdminRoute><RolesPage /></AdminRoute>} />
          <Route path="/admin/permissions" element={<AdminRoute><PermissionsPage /></AdminRoute>} />
          <Route path="/admin/approvals" element={<AdminRoute><SchoolApprovalsPage /></AdminRoute>} />
        </Route>

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/school/setup" element={<SchoolSetupChecklist />} />
          <Route path="/school/dashboard" element={<SchoolRoute><SchoolAdminDashboard /></SchoolRoute>} />
        </Route>

        <Route element={<ProtectedRoute><LearningLayout /></ProtectedRoute>}>
          <Route path="/student/dashboard" element={<div>Student Dashboard</div>} />
          <Route path="/lecturer/dashboard" element={<div>Lecturer Dashboard</div>} />
        </Route>

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};
