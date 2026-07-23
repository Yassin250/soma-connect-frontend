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
  { label: 'Catalog', to: '/courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
];

const PAGE_TITLES = {
  '/learning/dashboard': 'Dashboard',
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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <nav className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-black text-[#1b1e26] tracking-wider">SomaConnect</span>
              {user && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded border border-gray-200 uppercase">
                  {user.tenantId || 'School'}
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
