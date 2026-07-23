// Single source of truth for "where does this role land after login/landing".
// Takes the full user (not just roles) because STUDENT splits two ways: a
// school-cohort student has a schoolId and gets the school console; a
// self-registered learner has none and gets their own "My Courses" dashboard.
export const dashboardPathForRoles = (user) => {
  const primaryRole = user?.roles?.[0]?.toUpperCase();
  switch (primaryRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/admin/dashboard';
    case 'ENTITY_ADMIN':
    case 'SCHOOL_ADMIN':
      return '/school/dashboard';
    case 'STUDENT':
      return user?.schoolId ? '/student/dashboard' : '/learning/dashboard';
    case 'LECTURER':
      return '/lecturer/dashboard';
    default:
      // Unknown/missing role — never assume the admin console; the landing
      // page is the only destination that renders for everyone.
      return '/';
  }
};

export default dashboardPathForRoles;
