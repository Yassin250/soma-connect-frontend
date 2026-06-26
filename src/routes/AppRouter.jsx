import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';


const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuth();

  if (!token || !user) return <Navigate to="/login" replace />;

  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin/users"
          element={
          <ProtectedRoute>
            <UserManagementPage />
          </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
};