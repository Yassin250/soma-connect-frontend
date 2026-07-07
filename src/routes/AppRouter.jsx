import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';
import { RolesPage } from '../features/admin/pages/RolesPage';
import { PermissionsPage } from '../features/admin/pages/PermissionsPage';
import { SchoolApprovalsPage } from '../features/admin/pages/SchoolApprovalsPage';
import { AdminCommandCenter } from '../features/admin/pages/AdminCommandCenter';
import { SystemHealthPage } from '../features/admin/pages/SystemHealthPage';
import { AuditLogsPage } from '../features/admin/pages/AuditLogsPage';
import { SubscriptionsPage } from '../features/admin/pages/SubscriptionsPage';
import { CoursesPage } from '../features/admin/pages/CoursesPage';
import { PlagiarismPage } from '../features/admin/pages/PlagiarismPage';
import { RevenuePage } from '../features/admin/pages/RevenuePage';
import { InvoicesPage } from '../features/admin/pages/InvoicesPage';
import { PayoutsPage } from '../features/admin/pages/PayoutsPage';
import { NotificationsPage } from '../features/admin/pages/NotificationsPage';
import { EmployersPage } from '../features/admin/pages/EmployersPage';
import { JobBoardPage } from '../features/admin/pages/JobBoardPage';
import { PlacementTrackingPage } from '../features/admin/pages/PlacementTrackingPage';
import { AITuningPage } from '../features/admin/pages/AITuningPage';
import { SchoolAdminDashboardLayout } from '../features/schools/layouts/SchoolAdminDashboardLayout';
import { SchoolOverviewPage } from '../features/schools/pages/SchoolOverviewPage';
import { SchoolProfilePage } from '../features/schools/pages/SchoolProfilePage';
import { SchoolClassesPage } from '../features/schools/pages/SchoolClassesPage';
import { SchoolSubjectsPage } from '../features/schools/pages/SchoolSubjectsPage';
import { SchoolTimetablePage } from '../features/schools/pages/SchoolTimetablePage';
import { SchoolAssessmentsPage } from '../features/schools/pages/SchoolAssessmentsPage';
import { SchoolStaffPage } from '../features/schools/pages/SchoolStaffPage';
import { SchoolStudentsPage } from '../features/schools/pages/SchoolStudentsPage';
import { SchoolAttendancePage } from '../features/schools/pages/SchoolAttendancePage';
import { SchoolCoursesPage } from '../features/schools/pages/SchoolCoursesPage';
import { SchoolPlagiarismPage } from '../features/schools/pages/SchoolPlagiarismPage';
import { SchoolLibraryPage } from '../features/schools/pages/SchoolLibraryPage';
import { SchoolFeesPage } from '../features/schools/pages/SchoolFeesPage';
import { SchoolExpenditurePage } from '../features/schools/pages/SchoolExpenditurePage';
import { SchoolFinancialReportsPage } from '../features/schools/pages/SchoolFinancialReportsPage';
import { SchoolNotificationsPage } from '../features/schools/pages/SchoolNotificationsPage';
import { SchoolDisciplinePage } from '../features/schools/pages/SchoolDisciplinePage';
import { SchoolHealthPage } from '../features/schools/pages/SchoolHealthPage';
import { SchoolInternshipsPage } from '../features/schools/pages/SchoolInternshipsPage';
import { SchoolAlumniPage } from '../features/schools/pages/SchoolAlumniPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import ChangePasswordPage from '../features/auth/pages/ChangePasswordPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { AdminLayout } from '../features/admin/layouts/AdminLayout';
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
          <Route path="/admin/system-health" element={<AdminRoute><SystemHealthPage /></AdminRoute>} />
          <Route path="/admin/audit-logs" element={<AdminRoute><AuditLogsPage /></AdminRoute>} />
          <Route path="/admin/subscriptions" element={<AdminRoute><SubscriptionsPage /></AdminRoute>} />
          <Route path="/admin/courses" element={<AdminRoute><CoursesPage /></AdminRoute>} />
          <Route path="/admin/plagiarism" element={<AdminRoute><PlagiarismPage /></AdminRoute>} />
          <Route path="/admin/revenue" element={<AdminRoute><RevenuePage /></AdminRoute>} />
          <Route path="/admin/invoices" element={<AdminRoute><InvoicesPage /></AdminRoute>} />
          <Route path="/admin/payouts" element={<AdminRoute><PayoutsPage /></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><NotificationsPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
          <Route path="/admin/roles" element={<AdminRoute><RolesPage /></AdminRoute>} />
          <Route path="/admin/permissions" element={<AdminRoute><PermissionsPage /></AdminRoute>} />
          <Route path="/admin/approvals" element={<AdminRoute><SchoolApprovalsPage /></AdminRoute>} />
          <Route path="/admin/employers" element={<AdminRoute><EmployersPage /></AdminRoute>} />
          <Route path="/admin/jobs" element={<AdminRoute><JobBoardPage /></AdminRoute>} />
          <Route path="/admin/placements" element={<AdminRoute><PlacementTrackingPage /></AdminRoute>} />
          <Route path="/admin/ai-tuning" element={<AdminRoute><AITuningPage /></AdminRoute>} />
        </Route>

        <Route element={<ProtectedRoute><SchoolAdminDashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/school/dashboard" replace />} />
          <Route path="/school/dashboard" element={<SchoolRoute><SchoolOverviewPage /></SchoolRoute>} />
          <Route path="/school/profile" element={<SchoolRoute><SchoolProfilePage /></SchoolRoute>} />
          <Route path="/school/classes" element={<SchoolRoute><SchoolClassesPage /></SchoolRoute>} />
          <Route path="/school/subjects" element={<SchoolRoute><SchoolSubjectsPage /></SchoolRoute>} />
          <Route path="/school/timetable" element={<SchoolRoute><SchoolTimetablePage /></SchoolRoute>} />
          <Route path="/school/assessments" element={<SchoolRoute><SchoolAssessmentsPage /></SchoolRoute>} />
          <Route path="/school/staff" element={<SchoolRoute><SchoolStaffPage /></SchoolRoute>} />
          <Route path="/school/students" element={<SchoolRoute><SchoolStudentsPage /></SchoolRoute>} />
          <Route path="/school/attendance" element={<SchoolRoute><SchoolAttendancePage /></SchoolRoute>} />
          <Route path="/school/courses" element={<SchoolRoute><SchoolCoursesPage /></SchoolRoute>} />
          <Route path="/school/plagiarism" element={<SchoolRoute><SchoolPlagiarismPage /></SchoolRoute>} />
          <Route path="/school/library" element={<SchoolRoute><SchoolLibraryPage /></SchoolRoute>} />
          <Route path="/school/fees" element={<SchoolRoute><SchoolFeesPage /></SchoolRoute>} />
          <Route path="/school/expenditure" element={<SchoolRoute><SchoolExpenditurePage /></SchoolRoute>} />
          <Route path="/school/financial-reports" element={<SchoolRoute><SchoolFinancialReportsPage /></SchoolRoute>} />
          <Route path="/school/notifications" element={<SchoolRoute><SchoolNotificationsPage /></SchoolRoute>} />
          <Route path="/school/discipline" element={<SchoolRoute><SchoolDisciplinePage /></SchoolRoute>} />
          <Route path="/school/health" element={<SchoolRoute><SchoolHealthPage /></SchoolRoute>} />
          <Route path="/school/internships" element={<SchoolRoute><SchoolInternshipsPage /></SchoolRoute>} />
          <Route path="/school/alumni" element={<SchoolRoute><SchoolAlumniPage /></SchoolRoute>} />
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
