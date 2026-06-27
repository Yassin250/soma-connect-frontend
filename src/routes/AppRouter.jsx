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
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { AdminLayout } from '../features/admin/layouts/AdminLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LearningLayout } from '../layouts/LearningLayout';

const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuth();

  if (!token || !user) return <Navigate to="/login" replace />;

  return children;
};

const SchoolRoute = ({ children }) => {
  const { user, token } = useAuth();

  if (!token || !user) return <Navigate to="/login" replace />;
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

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
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

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};