import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthPage } from '../features/auth/AuthPage'; // 1. Import AuthPage
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';

const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 2. Point to AuthPage, not LoginPage */}
        <Route path="/login" element={<AuthPage />} />

        <Route
          path="/admin/users"
          element={
          <ProtectedRoute>
            <UserManagementPage />
          </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/admin/users" replace />} />
        <Route path="*" element={<Navigate to="/admin/users" replace />} />
      </Routes>
    </BrowserRouter>
  );
};