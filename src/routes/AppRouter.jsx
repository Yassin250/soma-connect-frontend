import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';
import { DashboardLayout } from '../layouts/DashboardLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();

  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout>
              <Routes>
                <Route path="users" element={<UserManagementPage />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};