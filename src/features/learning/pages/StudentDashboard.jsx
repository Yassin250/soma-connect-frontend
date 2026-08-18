import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { BrandLockup } from '../../../components/shared/Brand';
import { NotificationBell } from '../../../components/shared/NotificationBell';
import { notificationService } from '../../../services/api';

const API_BASE_URL = 'http://localhost:5050/api/student';

const INK = '#171717';

/* ── shared motion helpers ── */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const StudentDashboard = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    // This console is built for students enrolled through a partner school.
    // Self-registered learners (no schoolId) have nothing to fetch here — stop
    // the spinner immediately instead of hanging on it forever.
    if (!user || !user.schoolId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const schoolResponse = await fetch(`${API_BASE_URL}/school/${user.schoolId}`, {
          headers: getHeaders(),
        });
        if (schoolResponse.ok) {
          const schoolData = await schoolResponse.json();
          setSchool(schoolData.data || schoolData);
        }

        const dashboardResponse = await fetch(`${API_BASE_URL}/dashboard/${user.id}`, {
          headers: getHeaders(),
        });
        if (dashboardResponse.ok) {
          const dashboardDataResult = await dashboardResponse.json();
          setDashboardData(dashboardDataResult.data || dashboardDataResult);
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, getHeaders]);

  useEffect(() => {
    notificationService.list()
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-[15px] font-semibold text-gray-900 mb-2">Error loading dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2 bg-[#171717] text-white rounded-xl font-semibold hover:bg-black transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user?.schoolId) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#1b1e26]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-[15px] font-semibold text-gray-900 mb-2">This console is for school-enrolled students</h2>
          <p className="text-gray-600 mb-6">
            Your account isn't linked to a partner school, so there's no cohort dashboard to show here. Head to your own learning dashboard instead.
          </p>
          <Link to="/learning/dashboard" className="inline-block px-5 py-2 bg-[#171717] text-white rounded-xl font-semibold hover:bg-black transition-colors">
            Go to My Learning
          </Link>
        </div>
      </div>
    );
  }

  if (!school || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-[15px] font-semibold text-gray-900 mb-2">No data available</h2>
          <p className="text-gray-600">Please contact your administrator if this issue persists.</p>
        </div>
      </div>
    );
  }

  const { courses, summary } = dashboardData;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  const activeCourse = courses[0];
  const activeModules = activeCourse?.modules || [];
  const completedMods = activeModules.filter(m => m.unlocked);
  const courseProgress = activeCourse?.stats?.moduleProgress || 0;
  const totalXp = 1240;
  const level = Math.max(1, Math.floor(totalXp / 500) + 1);
  const xpIntoLevel = totalXp % 500;
  const xpPct = Math.round((xpIntoLevel / 500) * 100);

  const allAssignments = courses.flatMap(c =>
    c.assignments.map(a => ({ ...a, courseCode: c.code, courseTitle: c.title, courseId: c.id }))
  );
  const pendingAssignments = allAssignments.filter(a => {
    const sub = courses.flatMap(c => c.submissions).find(s => s.assignmentId === a.id);
    return !sub;
  });

  const verifiedSkills = courses.flatMap(c => c.skills || []);
  const uniqueSkills = [...new Set(verifiedSkills)];

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4-1a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
    { id: 'courses', label: 'My Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'assignments', label: 'Assignments', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'jobs', label: 'Job Matches', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-2M9 7h1m-1 4h1m4-4h1m-1 4h1' },
    { id: 'badges', label: 'Achievements', icon: 'M12 15l-2 5 2-1 2 1-2-5M12 2a5 5 0 110 10 5 5 0 010-10z' },
  ];

  const STAT_CARDS = [
    { label: 'Courses Enrolled', value: summary.enrolledCourses, tag: 'Active', tone: 'lime',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Verified Skills', value: uniqueSkills.length, tag: 'Earned', tone: 'emerald',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { label: 'Assignments Due', value: summary.pendingCount, tag: 'Pending', tone: 'amber',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { label: 'Average Score', value: `${summary.overallAvg || 0}%`, tag: 'Overall', tone: 'violet',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  const toneStyles = {
    lime: 'bg-accent/15 text-accent-text',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    violet: 'bg-violet-100 text-violet-600',
  };
  const iconTileStyles = {
    lime: 'bg-accent text-[#1b1e26]',
    emerald: 'bg-emerald-500 text-white',
    amber: 'bg-amber-500 text-white',
    violet: 'bg-violet-500 text-white',
  };

  const firstName = user?.name?.split(' ')[0] || 'Learner';

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1b1e26] antialiased flex">

      {/* ── SIDEBAR (dark premium) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed lg:sticky top-0 z-50 lg:z-10 h-screen w-72 shrink-0 flex flex-col justify-between p-6 overflow-hidden
        bg-gradient-to-b from-[#171717] via-[#1a1a1a] to-[#141414] text-white transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* ambient glow */}
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-accent/15 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-10 -right-16 w-64 h-64 rounded-full bg-[#C6FF34]/40 blur-[90px] pointer-events-none" />

        <div className="relative z-10 space-y-9">
          {/* Logo & School context */}
          <div className="flex items-center gap-3">
            <Link to="/" className="shrink-0"><BrandLockup hideText size={38} /></Link>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white truncate">{school.name}</h2>
              <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.15em] block">
                Student Portal
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1.5">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] px-4 mb-1">Menu</p>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                  className={`relative flex items-center gap-3 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                    active ? 'bg-accent text-[#1b1e26] shadow-lg shadow-accent/20' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => { navigate('/learning/notifications'); setSidebarOpen(false); }}
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-[13px] font-semibold text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Notifications</span>
            </button>
          </nav>
        </div>

        {/* User + Sign out */}
        <div className="relative z-10 border-t border-white/10 pt-5 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-accent text-[#1b1e26] flex items-center justify-center text-sm font-bold shrink-0 shadow-lg shadow-accent/20">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/45 truncate">{school.departments?.[0] || 'Student'}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] text-white/80 text-[13px] font-semibold hover:bg-white/[0.12] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 flex items-center justify-center" aria-label="Open menu">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>
          <Link to="/"><BrandLockup dark size={28} /></Link>
          <span className="ml-auto"><NotificationBell seed={notifications} viewAllPath="/learning/notifications" /></span>
        </div>

        <div className="p-5 sm:p-8 lg:p-10 max-w-[1400px] mx-auto">

          {/* ── HERO BANNER ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#141414] text-white px-7 sm:px-10 pt-9 pb-24 sm:pb-28"
          >
            <div className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-[#C6FF34]/40 blur-[110px] pointer-events-none" />
            <div className="absolute top-[18%] right-[8%] w-40 h-40 rounded-[2rem] border border-white/10 rotate-[18deg] pointer-events-none hidden sm:block" />
            <div className="absolute top-[30%] right-[4%] w-10 h-10 rounded-2xl bg-accent/25 rotate-12 pointer-events-none hidden sm:block" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-accent uppercase tracking-[0.18em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Student Learning Console
                </span>
                <h1 className="mt-3 text-[2rem] sm:text-[2.6rem] font-semibold tracking-tight leading-[1.1]">
                  Welcome back, {firstName} <span className="inline-block">👋</span>
                </h1>
                <p className="mt-2.5 text-white/55 text-sm sm:text-base leading-relaxed">
                  {school.name} · {school.academicYear || 'Academic Year'} — you're{' '}
                  <span className="text-white font-semibold">{courseProgress}%</span> through your active course.
                </p>
              </div>

              {/* Level / XP chip */}
              <div className="shrink-0 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-xl p-5 w-full sm:w-72">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-accent text-[#1b1e26] flex items-center justify-center shadow-lg shadow-accent/20">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </span>
                    <div>
                      <p className="text-[11px] text-white/45 font-medium leading-none">Level</p>
                      <p className="text-lg font-bold text-white leading-tight">{level}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-accent tabular-nums">{totalXp.toLocaleString()} XP</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} className="h-full rounded-full bg-accent" />
                </div>
                <p className="mt-2 text-[11px] text-white/40">{500 - xpIntoLevel} XP to level {level + 1}</p>
              </div>
            </div>
          </motion.div>

          {/* ── FLOATING STAT CARDS (overlap hero) ── */}
          <div className="relative z-20 -mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {STAT_CARDS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}
                className="bg-white rounded-2xl p-5 shadow-[0_12px_40px_rgba(23,23,23,0.10)] border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${iconTileStyles[s.tone]}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${toneStyles[s.tone]}`}>{s.tag}</span>
                </div>
                <p className="text-xl font-extrabold text-[#1b1e26] leading-none tracking-tight">{s.value}</p>
                <p className="mt-2 text-xs font-semibold text-gray-500">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* ── TAB CONTENT ── */}
          <div className="mt-8">

            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Continue learning */}
                  {activeCourse && (
                    <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-[#171717] text-accent flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                          </span>
                          <div>
                            <p className="text-sm font-bold text-[#1b1e26]">Continue learning</p>
                            <p className="text-xs text-gray-500">{activeCourse.title} · Module {completedMods.length} of {activeModules.length}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-accent-text bg-accent/20 px-3 py-1 rounded-full">In progress</span>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs text-gray-500">Course progress</span>
                          <span className="text-xs font-bold text-[#1b1e26]">{courseProgress}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${courseProgress}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-accent to-accent-dark" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {activeModules.slice(0, 3).map((mod, idx) => {
                          const isCompleted = idx < completedMods.length - 1;
                          const isCurrent = !isCompleted && mod.unlocked;
                          const isLocked = !mod.unlocked;
                          return (
                            <div
                              key={mod.id}
                              onClick={() => mod.unlocked && navigate(`/learning/course/${activeCourse.id}`)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                                isCurrent
                                  ? 'border-accent/40 bg-accent/10 hover:bg-accent/15 cursor-pointer'
                                  : isLocked
                                    ? 'opacity-50 cursor-default border-gray-100 bg-gray-50'
                                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer'
                              }`}
                            >
                              {isCurrent ? (
                                <span className="w-8 h-8 rounded-lg bg-accent text-[#1b1e26] flex items-center justify-center shrink-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg></span>
                              ) : isCompleted ? (
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
                              ) : (
                                <span className="w-8 h-8 rounded-lg bg-gray-200 text-gray-400 flex items-center justify-center shrink-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg></span>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#1b1e26]' : 'text-gray-700'}`}>{mod.title}</p>
                                <p className="text-xs text-gray-500">
                                  {isCompleted ? `Completed · ${mod.type}` : isLocked ? 'Unlocks after previous module' : `${mod.type} content`}
                                </p>
                              </div>
                              {isCurrent && <span className="text-xs px-3 py-1.5 rounded-lg bg-[#171717] text-white font-semibold shrink-0">Continue →</span>}
                              {isCompleted && <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-600 font-semibold shrink-0">Done</span>}
                              {isLocked && <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-200 text-gray-500 font-semibold shrink-0">Locked</span>}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Upcoming deadlines */}
                  <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      </span>
                      <p className="text-sm font-bold text-[#1b1e26]">Upcoming deadlines</p>
                    </div>
                    {pendingAssignments.length === 0 && (
                      <p className="text-sm text-gray-500 py-8 text-center">🎉 No upcoming deadlines — you're all caught up.</p>
                    )}
                    {pendingAssignments.slice(0, 4).map(a => {
                      const daysLeft = a.dueDate ? Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                      const isUrgent = daysLeft !== null && daysLeft <= 2;
                      return (
                        <div key={a.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-b-0">
                          <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isUrgent ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1b1e26] truncate">{a.courseCode} – {a.title}</p>
                            <p className="text-xs text-gray-500">{daysLeft !== null ? `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : 'No due date'}</p>
                          </div>
                          <button onClick={() => navigate(`/student/assignment/${a.id}`)} className="text-xs px-3 py-1.5 rounded-lg bg-[#171717] text-white font-semibold hover:bg-black transition-colors shrink-0">Submit →</button>
                        </div>
                      );
                    })}
                  </motion.div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col gap-6">
                  {/* Verified skills */}
                  <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </span>
                      <p className="text-sm font-bold text-[#1b1e26]">Verified skills</p>
                    </div>
                    {uniqueSkills.length === 0 && <p className="text-sm text-gray-500">Skills will appear as you complete courses.</p>}
                    <div className="space-y-2">
                      {uniqueSkills.map((skill, idx) => (
                        <div key={idx} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 ${idx >= 3 ? 'opacity-50' : ''}`}>
                          {idx < 3 ? (
                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${idx < 3 ? 'text-[#1b1e26]' : 'text-gray-500'}`}>{skill}</p>
                            <p className="text-xs text-gray-500">{idx < 3 ? 'Verified' : 'In progress'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recent badges */}
                  <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-sm font-bold text-[#1b1e26] mb-4">Recent badges</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Quiz ace', color: '#BA7517', icon: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' },
                        { label: '7-day streak', color: '#D85A30', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                        { label: 'Zero plagiarism', color: '#1D9E75', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                        { label: 'Peer helper', color: '#534AB7', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                      ].map((badge, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 border border-gray-100 bg-gray-50 rounded-xl">
                          <svg className="w-4 h-4" fill="none" stroke={badge.color} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={badge.icon} /></svg>
                          <span className="text-xs text-gray-700 font-medium">{badge.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Job matches teaser */}
                  <motion.div {...fadeUp} transition={{ delay: 0.35 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#171717] to-[#141414] text-white p-6 shadow-sm">
                    <div className="absolute -bottom-10 -right-8 w-40 h-40 rounded-full bg-accent/15 blur-[70px] pointer-events-none" />
                    <div className="relative z-10">
                      <p className="text-sm font-bold text-white mb-1">Job matches</p>
                      <p className="text-xs text-white/50 mb-4">Based on your {uniqueSkills.length} verified skills</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-lg bg-white/10 text-accent flex items-center justify-center shrink-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-2" /></svg></span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">Software intern · MTN Rwanda</p>
                            <p className="text-xs text-white/45">Strong match</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">Strong</span>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('jobs')} className="mt-4 w-full py-2 rounded-xl bg-accent text-[#1b1e26] text-xs font-bold hover:bg-accent-hover transition-colors">View all matches</button>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* COURSES */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                {courses.map(course => (
                  <motion.div key={course.id} {...fadeUp} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="font-mono text-accent-text bg-accent/20 px-2 py-0.5 rounded text-xs font-bold">{course.code}</span>
                        <h3 className="text-[15px] font-semibold text-[#1b1e26] mt-2">{course.title}</h3>
                        <p className="text-xs text-gray-500">Instructor: {course.lecturerName}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold shrink-0 ${course.stats.moduleProgress >= 50 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {course.stats.moduleProgress}% Progress
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-500">Module Progress</span>
                        <span className="text-xs font-semibold text-[#1b1e26]">{course.stats.completedModules}/{course.stats.totalModules}</span>
                      </div>
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${course.stats.moduleProgress >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${course.stats.moduleProgress}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Course Modules</p>
                      {course.modules.map((mod) => (
                        <div
                          key={mod.id}
                          onClick={() => mod.unlocked && navigate(`/learning/course/${course.id}`)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                            mod.unlocked ? 'border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer' : 'border-gray-100 bg-gray-50 opacity-50 cursor-default'
                          }`}
                        >
                          {mod.unlocked ? (
                            <svg className="w-5 h-5 text-accent-text shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1b1e26] truncate">{mod.title}</p>
                            <p className="text-xs text-gray-500 capitalize">{mod.type} content</p>
                          </div>
                          {mod.unlocked ? (
                            <svg className="w-5 h-5 text-[#1b1e26]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-lg bg-gray-200 text-gray-500 font-semibold">Locked</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {course.quizzes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quizzes</p>
                        {course.quizzes.map(quiz => {
                          const attempt = course.quizAttempts.find(a => a.quizId === quiz.id);
                          return (
                            <div
                              key={quiz.id}
                              onClick={() => !attempt && navigate(`/student/quiz/${quiz.id}`)}
                              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                                attempt ? 'border-gray-100 bg-gray-50' : 'border-accent/40 bg-accent/10 hover:bg-accent/15 cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <svg className={`w-5 h-5 shrink-0 ${attempt ? 'text-emerald-500' : 'text-accent-text'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div>
                                  <p className="text-sm font-semibold text-[#1b1e26]">{quiz.title}</p>
                                  <p className="text-xs text-gray-500">{quiz.questions.length} questions · {quiz.timeLimit} min</p>
                                </div>
                              </div>
                              {attempt ? (
                                <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${attempt.score >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>Score: {attempt.score}%</span>
                              ) : (
                                <button className="text-xs px-3 py-1.5 rounded-lg bg-[#171717] text-white font-semibold hover:bg-black transition-colors">Take Quiz</button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                ))}
                {courses.length === 0 && <p className="text-center text-sm text-gray-500 py-12">Not enrolled in any courses yet.</p>}
              </div>
            )}

            {/* ASSIGNMENTS */}
            {activeTab === 'assignments' && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">All Assignments</p>
                {courses.flatMap(course =>
                  course.assignments.map(assignment => {
                    const submission = course.submissions.find(s => s.assignmentId === assignment.id);
                    const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && !submission;
                    const statusLabel = submission
                      ? submission.status === 'graded' ? 'Graded' : submission.status === 'flagged' ? 'Under Review' : 'Submitted'
                      : isOverdue ? 'Overdue' : 'Pending';
                    const statusClass = submission
                      ? submission.status === 'graded' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      : isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600';

                    return (
                      <motion.div key={assignment.id} {...fadeUp}
                        onClick={() => !submission && navigate(`/student/assignment/${assignment.id}`)}
                        className={`bg-white border border-gray-100 rounded-2xl p-6 transition-colors shadow-sm ${!submission ? 'hover:border-accent/40 cursor-pointer' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="font-mono text-accent-text bg-accent/20 px-2 py-0.5 rounded text-xs font-bold">{course.code}</span>
                            <h4 className="text-sm font-bold text-[#1b1e26] mt-2">{assignment.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 max-w-lg">{assignment.description}</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold shrink-0 ${statusClass}`}>{statusLabel}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 mt-3">
                          <span>Max: {assignment.maxScore}</span>
                          {assignment.dueDate && <span>Due: {new Date(assignment.dueDate).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' })}</span>}
                          {submission?.grade && <span className="text-emerald-600 font-semibold">Grade: {submission.grade.total}%</span>}
                          {submission?.similarity != null && (
                            <span className={submission.similarity > 30 ? 'text-red-600' : 'text-emerald-600'}>Similarity: {submission.similarity}%</span>
                          )}
                        </div>
                        {!submission && (
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/student/assignment/${assignment.id}`); }} className="mt-4 text-xs px-4 py-2 rounded-xl bg-[#171717] text-white font-semibold hover:bg-black transition-colors">
                            Submit Assignment
                          </button>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}

            {/* JOBS */}
            {activeTab === 'jobs' && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Jobs & Internships</p>
                <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                  {[
                    { title: 'Software intern · MTN Rwanda', match: uniqueSkills.length, tag: 'Strong match', tone: 'bg-emerald-100 text-emerald-600' },
                    { title: 'Junior dev · Norrsken Kigali', match: Math.max(uniqueSkills.length - 1, 0), tag: 'Good match', tone: 'bg-accent/20 text-accent-text' },
                  ].map((job, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-50 last:border-b-0">
                      <span className="w-11 h-11 rounded-xl bg-[#171717] text-accent flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-2" /><path d="M9 7h1m-1 4h1m4-4h1m-1 4h1" /></svg>
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1b1e26] truncate">{job.title}</p>
                        <p className="text-xs text-gray-500">Matches {job.match} of your verified skills</p>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${job.tone}`}>{job.tag}</span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 text-center py-5">Employer portal coming soon — schools pay to post, students are always free.</p>
                </div>
              </div>
            )}

            {/* BADGES */}
            {activeTab === 'badges' && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Achievements & Badges</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Quiz Ace', desc: 'Score 90%+ on 3 quizzes', color: '#BA7517', earned: true, icon: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' },
                    { label: '7-Day Streak', desc: 'Log in 7 days in a row', color: '#D85A30', earned: true, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                    { label: 'Zero Plagiarism', desc: 'All submissions under 15% similarity', color: '#1D9E75', earned: true, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                    { label: 'Peer Helper', desc: 'Help 5 classmates in forums', color: '#534AB7', earned: false, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                    { label: 'Early Bird', desc: 'Submit all assignments before deadline', color: '#2563EB', earned: false, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Module Master', desc: 'Complete all modules in a course', color: '#7C3AED', earned: false, icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.247M12 2v8m0 0l-3-3m3 3l3-3' },
                  ].map((badge, idx) => (
                    <motion.div key={idx} {...fadeUp} transition={{ delay: idx * 0.05 }}
                      className={`bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-4 ${badge.earned ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-70'}`}
                    >
                      <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${badge.color}18` }}>
                        <svg className="w-6 h-6" fill="none" stroke={badge.color} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={badge.icon} /></svg>
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1b1e26]">{badge.label}</p>
                        <p className="text-xs text-gray-500">{badge.desc}</p>
                      </div>
                      {badge.earned
                        ? <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 font-bold shrink-0">Earned</span>
                        : <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-400 font-bold shrink-0">Locked</span>}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
