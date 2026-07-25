import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { BrandLockup } from '../components/shared/Brand';
import { NotificationBell } from '../components/shared/NotificationBell';
import { notificationService } from '../services/api';

const initialsOf = (name) =>
  (name || 'User').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const NAV = [
  { label: 'Dashboard', to: '/learning/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4-1a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
  { label: 'Grades', to: '/learning/grades', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'Catalog', to: '/courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
];

const PAGE_TITLES = {
  '/learning/dashboard': 'Dashboard',
  '/learning/grades': 'Grades & Progress',
  '/courses': 'Course Catalog',
  '/learning/notifications': 'Notifications',
  '/learner/account': 'My Account',
};

export const LearningLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const initials = initialsOf(user?.name);
  const pageTitle = PAGE_TITLES[location.pathname] || 'Learning';

  useEffect(() => {
    notificationService.list()
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  return (
    <div className="h-screen w-full flex bg-[#f7f8fa] text-[#1b1e26] antialiased overflow-hidden">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`bg-gradient-to-b from-[#20242e] via-[#181b22] to-[#101217] flex flex-col fixed top-[72px] bottom-0 left-0 z-50 lg:static lg:z-auto transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-[84px]' : 'lg:w-[335px]'} w-[335px]`}
      >
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-[#d0f24a]/10 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-10 -right-16 w-64 h-64 rounded-full bg-[#39435a]/30 blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Brand */}
          <div className="relative px-5 pt-10 lg:pt-6 pb-4 shrink-0">
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden absolute top-8 right-4 text-white/50 hover:text-white"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
            <BrandLockup hideText={collapsed} size={36} />
            {!collapsed && (
              <p className="mt-2 ml-[48px] text-[9px] font-black text-[#d0f24a] uppercase tracking-[0.25em]">Learning Portal</p>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3.5 py-2 space-y-1.5 learner-scroll">
            {NAV.map((item) => {
              const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200 ${
                    collapsed ? 'lg:justify-center' : ''
                  } ${
                    active
                      ? 'bg-[#d0f24a] text-[#1b1e26] shadow-lg shadow-[#d0f24a]/20'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  {!collapsed && <span className="truncate text-[15px] font-bold">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* User footer */}
          {!collapsed && (
            <div className="relative z-10 border-t border-white/10 mx-3 pt-4 pb-5">
              <div className="flex items-center gap-3 px-2">
                <span className="w-9 h-9 rounded-xl bg-[#d0f24a] text-[#1b1e26] text-xs font-bold flex items-center justify-center shrink-0 shadow-lg shadow-[#d0f24a]/20">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{user?.name || 'Learner'}</p>
                  <p className="text-[11px] text-white/45 truncate">{user?.email || ''}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[72px] shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center gap-4 px-4 sm:px-6 z-50 relative">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-[#1b1e26] flex items-center justify-center transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:flex w-9 h-9 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-[#1b1e26] items-center justify-center transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7M19 19l-7-7 7-7'} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>

          <div className="min-w-0">
            <h1 className="text-base font-semibold text-[#1b1e26] leading-tight truncate">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell seed={notifications} viewAllPath="/learning/notifications" />

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="group flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-[#1b1e26] text-[#d0f24a] text-xs font-bold flex items-center justify-center ring-0 ring-[#d0f24a]/0 group-hover:ring-4 group-hover:ring-[#d0f24a]/40 transition-all duration-200 shrink-0">
                  {initials}
                </span>
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-sm font-semibold text-[#1b1e26] leading-tight max-w-[160px] truncate">{user?.name || 'Learner'}</p>
                  <p className="text-[11px] text-gray-400 leading-tight max-w-[160px] truncate">{user?.email || ''}</p>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${profileOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#1b1e26] text-[#d0f24a] text-xs font-bold flex items-center justify-center shrink-0">{initials}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1b1e26] truncate">{user?.name || 'Learner'}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                    </div>
                  </div>
                  <button onClick={() => { setProfileOpen(false); navigate('/learner/account'); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:text-[#1b1e26] hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    My Profile
                  </button>
                  <button onClick={() => { setProfileOpen(false); navigate('/learner/account?tab=password'); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:text-[#1b1e26] hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                    Change Password
                  </button>
                  <div className="my-1.5 border-t border-gray-50" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" /></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div key={location.pathname} className="max-w-[2100px] mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300 p-5 sm:p-8 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        .learner-scroll::-webkit-scrollbar { width: 5px; }
        .learner-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }
        .learner-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
      `}</style>
    </div>
  );
};
