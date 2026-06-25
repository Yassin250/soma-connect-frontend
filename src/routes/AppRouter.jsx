import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';

// School onboarding feature imports
import { SchoolRegistrationForm } from '../features/schools/components/SchoolRegistrationForm';
import { SuperAdminApprovals } from '../features/schools/components/SuperAdminApprovals';
import { SchoolSetupChecklist } from '../features/schools/components/SchoolSetupChecklist';
import { SchoolAdminDashboard } from '../features/schools/components/SchoolAdminDashboard';
import { StudentJoinPortal } from '../features/schools/components/StudentJoinPortal';

// Student learning feature imports
import { StudentDashboard } from '../features/learning/pages/StudentDashboard';
import { ModuleViewer } from '../features/learning/components/ModuleViewer';
import { QuizEngine } from '../features/learning/components/QuizEngine';
import { AssignmentSubmit } from '../features/assignments/components/AssignmentSubmit';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();

  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-school" element={<SchoolRegistrationForm />} />
        <Route path="/join/:schoolSlug" element={<StudentJoinPortal />} />
        
        {/* Super Admin approvals */}
        <Route path="/super-admin/approvals" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SuperAdminApprovals />
          </ProtectedRoute>
        } />

        {/* Super Admin User Management */}
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserManagementPage />
          </ProtectedRoute>
        } />

        {/* School Admin Setup Checklist */}
        <Route path="/school/setup" element={
          <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
            <SchoolSetupChecklist />
          </ProtectedRoute>
        } />

        {/* School Dashboard (Admins, Lecturers) */}
        <Route path="/school/dashboard" element={
          <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'LECTURER']}>
            <SchoolAdminDashboard />
          </ProtectedRoute>
        } />

        {/* Student Portal Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/module/:moduleId" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ModuleViewer />
          </ProtectedRoute>
        } />
        <Route path="/student/quiz/:quizId" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <QuizEngine />
          </ProtectedRoute>
        } />
        <Route path="/student/assignment/:assignmentId" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AssignmentSubmit />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};