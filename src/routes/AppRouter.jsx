import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRoles } from '../utils/dashboardPath';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';
import { RolesPage } from '../features/admin/pages/RolesPage';
import { PermissionsPage } from '../features/admin/pages/PermissionsPage';
import { SystemParametersPage } from '../features/admin/pages/SystemParametersPage';

import { AdminCommandCenter } from '../features/admin/pages/AdminCommandCenter';
import { AdminAccountPage } from '../features/admin/pages/AdminAccountPage';
import { SystemHealthPage } from '../features/admin/pages/SystemHealthPage';
import { AuditLogsPage } from '../features/admin/pages/AuditLogsPage';
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
import { EntitiesPage } from '../features/admin/pages/EntitiesPage';
import { SchoolAdminDashboardLayout } from '../features/schools/layouts/SchoolAdminDashboardLayout';
import { SchoolOverviewPage } from '../features/schools/pages/SchoolOverviewPage';
import { CourseBuilderPage } from '../features/courses/CourseBuilderPage';
import { SchoolCourseDetailPage } from '../features/schools/pages/SchoolCourseDetailPage';
import { AdminCourseDetailPage } from '../features/admin/pages/AdminCourseDetailPage';
import { AdminCourseModulesPage } from '../features/admin/pages/AdminCourseModulesPage';
import { AdminModuleLessonsPage } from '../features/admin/pages/AdminModuleLessonsPage';
import { AdminAllModulesPage } from '../features/admin/pages/AdminAllModulesPage';
import { AdminAllLessonsPage } from '../features/admin/pages/AdminAllLessonsPage';
import { AdminEntityUsersPage } from '../features/admin/pages/AdminEntityUsersPage';
import { UnassignedUsersPage } from '../features/admin/pages/UnassignedUsersPage';
import { CourseCategoriesPage } from '../features/admin/pages/CourseCategoriesPage';
import { SchoolAccountPage } from '../features/schools/pages/SchoolAccountPage';
import { SchoolProfilePage } from '../features/schools/pages/SchoolProfilePage';
import { SchoolClassesPage } from '../features/schools/pages/SchoolClassesPage';
import { SchoolSubjectsPage } from '../features/schools/pages/SchoolSubjectsPage';
import { SchoolTimetablePage } from '../features/schools/pages/SchoolTimetablePage';
import { SchoolAssessmentsPage } from '../features/schools/pages/SchoolAssessmentsPage';
import { SchoolStaffPage } from '../features/schools/pages/SchoolStaffPage';
import { EntityUsersPage } from '../features/schools/pages/EntityUsersPage';
import { EntityRolesPage } from '../features/schools/pages/EntityRolesPage';
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
import { LearnerRegisterPage } from '../features/auth/pages/LearnerRegisterPage';
import { AdminLayout } from '../features/admin/layouts/AdminLayout';
import { LearningLayout } from '../layouts/LearningLayout';
import { LandingPage } from '../features/marketing/pages/LandingPage';
import { CourseLearningPage } from '../features/learning/pages/CourseLearningPage';
import { StudentDashboard } from '../features/learning/pages/StudentDashboard';
import { LearnerDashboard } from '../features/learning/pages/LearnerDashboard';
import { CourseCatalogPage } from '../features/courses/pages/CourseCatalogPage';
import { LearnerNotificationsPage } from '../features/learning/pages/LearnerNotificationsPage';
import { LearnerAccountPage } from '../features/learning/pages/LearnerAccountPage';
import GradesPage from '../features/learning/pages/GradesPage';
import MyCoursesPage from '../features/learning/pages/MyCoursesPage';
import { LecturerDashboardPage } from '../features/lecturer/pages/LecturerDashboardPage';
import { LecturerAccountPage } from '../features/lecturer/pages/LecturerAccountPage';
import { LecturerNotificationsPage } from '../features/lecturer/pages/LecturerNotificationsPage';
import LecturerCoursesPage from '../features/lecturer/pages/LecturerCoursesPage';
import { LecturerLayout } from '../features/lecturer/layouts/LecturerLayout';

// Platform-console permissions. The backend guards /api/admin/** with these exact
// authorities, so the UI must gate on them too (not on role names) or a user can
// reach a page whose data calls immediately 403 with "Access Denied".
export const PLATFORM_ADMIN_PERMISSIONS = ['manage_users', 'manage_roles', 'manage_permissions', 'manage_system_parameters'];

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
  if (isAuthenticated) return <Navigate to={dashboardPathForRoles(user)} replace />;
  return children;
};

const SchoolRoute = ({ children }) => {
  const { isAuthenticated, hasPermission } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasPermission('view_entity_dashboard')) return <Navigate to="/" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, hasAnyPermission } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Gate on the same permissions the backend requires. A signed-in user without any
  // platform-admin permission (e.g. an entity admin) is sent to their own dashboard
  // rather than shown a page that would 403 on every data call.
  if (!hasAnyPermission(PLATFORM_ADMIN_PERMISSIONS)) {
    // An ADMIN-role session with no permissions (stale/corrupt) would have its
    // dashboard right back inside this guard — redirecting there loops forever
    // and renders nothing. Break the cycle by falling back to the landing page.
    const target = dashboardPathForRoles(user);
    return <Navigate to={target.startsWith('/admin') ? '/' : target} replace />;
  }
  return children;
};

// Root ("/"): send authenticated users to their dashboard, everyone else to login.
const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  return <Navigate to={isAuthenticated ? dashboardPathForRoles(user) : '/login'} replace />;
};

// Learning pages require a signed-in account. An anonymous visitor who clicks a
// course is sent to registration, carrying the course as ?next= so they resume
// right where they intended after signing in.
const LearningRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    // Sign-in first (matching the course-card flow); new learners can hop to
    // /register from the login page — ?next= survives the trip either way.
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth screens — hidden from users who already have a session */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
        <Route path="/reset-password" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><LearnerRegisterPage /></PublicOnlyRoute>} />
        <Route path="/register/institution" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* Forced first-login password change — needs a session but no role gate */}
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<AdminRoute><AdminCommandCenter /></AdminRoute>} />
          <Route path="/admin/account" element={<AdminRoute><AdminAccountPage /></AdminRoute>} />
          <Route path="/admin/system-health" element={<AdminRoute><SystemHealthPage /></AdminRoute>} />
          <Route path="/admin/audit-logs" element={<AdminRoute><AuditLogsPage /></AdminRoute>} />

          <Route path="/admin/courses" element={<AdminRoute><CoursesPage /></AdminRoute>} />
          <Route path="/admin/courses/new" element={<AdminRoute><CourseBuilderPage /></AdminRoute>} />
          <Route path="/admin/courses/:id/modules/:moduleId/lessons" element={<AdminRoute><AdminModuleLessonsPage /></AdminRoute>} />
          <Route path="/admin/courses/:id/modules" element={<AdminRoute><AdminCourseModulesPage /></AdminRoute>} />
          <Route path="/admin/courses/:id/edit" element={<AdminRoute><CourseBuilderPage /></AdminRoute>} />
          <Route path="/admin/courses/:id" element={<AdminRoute><AdminCourseDetailPage /></AdminRoute>} />
          <Route path="/admin/course-categories" element={<AdminRoute><CourseCategoriesPage /></AdminRoute>} />
          <Route path="/admin/modules" element={<AdminRoute><AdminAllModulesPage /></AdminRoute>} />
          <Route path="/admin/lessons" element={<AdminRoute><AdminAllLessonsPage /></AdminRoute>} />
          <Route path="/admin/plagiarism" element={<AdminRoute><PlagiarismPage /></AdminRoute>} />
          <Route path="/admin/revenue" element={<AdminRoute><RevenuePage /></AdminRoute>} />
          <Route path="/admin/invoices" element={<AdminRoute><InvoicesPage /></AdminRoute>} />
          <Route path="/admin/payouts" element={<AdminRoute><PayoutsPage /></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><NotificationsPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
          <Route path="/admin/roles" element={<AdminRoute><RolesPage /></AdminRoute>} />
          <Route path="/admin/permissions" element={<AdminRoute><PermissionsPage /></AdminRoute>} />
          <Route path="/admin/system-parameters" element={<AdminRoute><SystemParametersPage /></AdminRoute>} />

          <Route path="/admin/entities/:id/users" element={<AdminRoute><AdminEntityUsersPage /></AdminRoute>} />
          <Route path="/admin/entities/unassigned" element={<AdminRoute><UnassignedUsersPage /></AdminRoute>} />
          <Route path="/admin/entities" element={<AdminRoute><EntitiesPage /></AdminRoute>} />
          <Route path="/admin/employers" element={<AdminRoute><EmployersPage /></AdminRoute>} />
          <Route path="/admin/jobs" element={<AdminRoute><JobBoardPage /></AdminRoute>} />
          <Route path="/admin/placements" element={<AdminRoute><PlacementTrackingPage /></AdminRoute>} />
          <Route path="/admin/ai-tuning" element={<AdminRoute><AITuningPage /></AdminRoute>} />
        </Route>

        <Route element={<ProtectedRoute><SchoolAdminDashboardLayout /></ProtectedRoute>}>
          <Route path="/school/dashboard" element={<SchoolRoute><SchoolOverviewPage /></SchoolRoute>} />
          <Route path="/school/account" element={<SchoolRoute><SchoolAccountPage /></SchoolRoute>} />
          <Route path="/school/profile" element={<SchoolRoute><SchoolProfilePage /></SchoolRoute>} />
          <Route path="/school/classes" element={<SchoolRoute><SchoolClassesPage /></SchoolRoute>} />
          <Route path="/school/subjects" element={<SchoolRoute><SchoolSubjectsPage /></SchoolRoute>} />
          <Route path="/school/timetable" element={<SchoolRoute><SchoolTimetablePage /></SchoolRoute>} />
          <Route path="/school/assessments" element={<SchoolRoute><SchoolAssessmentsPage /></SchoolRoute>} />
          <Route path="/school/staff" element={<SchoolRoute><EntityUsersPage /></SchoolRoute>} />
          <Route path="/school/roles" element={<SchoolRoute><EntityRolesPage /></SchoolRoute>} />
          <Route path="/school/students" element={<SchoolRoute><SchoolStudentsPage /></SchoolRoute>} />
          <Route path="/school/attendance" element={<SchoolRoute><SchoolAttendancePage /></SchoolRoute>} />
          <Route path="/school/courses" element={<SchoolRoute><SchoolCoursesPage /></SchoolRoute>} />
          <Route path="/school/courses/new" element={<SchoolRoute><CourseBuilderPage /></SchoolRoute>} />
          <Route path="/school/courses/:id" element={<SchoolRoute><SchoolCourseDetailPage /></SchoolRoute>} />
          <Route path="/school/courses/:id/edit" element={<SchoolRoute><CourseBuilderPage /></SchoolRoute>} />
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

        {/* School-specific student dashboard — keeps its own sidebar */}
        <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />

        <Route element={<ProtectedRoute><LearningLayout /></ProtectedRoute>}>
          <Route path="/learning/dashboard" element={<LearnerDashboard />} />
          <Route path="/learning/grades" element={<GradesPage />} />
          <Route path="/learning/my-courses" element={<MyCoursesPage />} />
          <Route path="/learning/assignments" element={
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="w-16 h-16 rounded-2xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center mb-4">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </span>
              <h2 className="text-lg font-semibold text-[#1b1e26]">Assignments — Under Development</h2>
              <p className="text-sm text-gray-400 mt-1">This feature is being built. Check back soon!</p>
            </div>
          } />
          <Route path="/learning/notifications" element={<LearnerNotificationsPage />} />
          <Route path="/learner/account" element={<LearnerAccountPage />} />
          <Route path="/courses" element={<CourseCatalogPage />} />
        </Route>

        <Route element={<ProtectedRoute><LecturerLayout /></ProtectedRoute>}>
          <Route path="/lecturer/dashboard" element={<LecturerDashboardPage />} />
          <Route path="/lecturer/courses/new" element={<CourseBuilderPage />} />
          <Route path="/lecturer/courses/:id/edit" element={<CourseBuilderPage />} />
          <Route path="/lecturer/courses" element={<LecturerCoursesPage />} />
          <Route path="/lecturer/students" element={
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Students — Under Development</div>
          } />
          <Route path="/lecturer/assignments" element={
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Assignments — Under Development</div>
          } />
          <Route path="/lecturer/timetable" element={
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Timetable — Under Development</div>
          } />
          <Route path="/lecturer/account" element={<LecturerAccountPage />} />
          <Route path="/lecturer/notifications" element={<LecturerNotificationsPage />} />
        </Route>

        {/* The public landing page is the front door of the app */}
        <Route path="/" element={<LandingPage />} />
        {/* Public course player — reached from the landing "Popular programs" cards */}
        <Route path="/learning/course/:courseId" element={<LearningRoute><CourseLearningPage /></LearningRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
