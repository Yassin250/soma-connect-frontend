import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { BrandLockup } from '../../../components/shared/Brand';
import { NotificationBell } from '../../../components/shared/NotificationBell';

const dashboardItem = { id: 'dashboard', label: 'Dashboard', path: '/lecturer/dashboard' };

const modules = [
  {
    id: 'teaching',
    label: 'Teaching',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    items: [
      { id: 'courses', label: 'My Courses', path: '/lecturer/courses' },
      { id: 'assignments', label: 'Assignments & Grading', path: '/lecturer/assignments' },
    ],
  },
  {
    id: 'people',
    label: 'People',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    items: [
      { id: 'students', label: 'My Students', path: '/lecturer/students' },
    ],
  },
  {
    id: 'planning',
    label: 'Planning',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    items: [
      { id: 'timetable', label: 'Timetable', path: '/lecturer/timetable' },
    ],
  },
];

const flattenedPages = [dashboardItem, ...modules.flatMap((m) => m.items)];

const initialsOf = (name) =>
  (name || 'User').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const SEED_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Welcome to the Lecturer Portal',
    body: 'Your teaching dashboard is ready. Manage courses, assignments, and students from here.',
    time: 'Just now',
    category: 'Getting started',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    unread: true,
    archived: false,
    action: { label: 'View courses', to: '/lecturer/courses' },
  },
  {
    id: 'n2',
    title: 'Pending grading queue',
    body: 'You have submissions awaiting review. Check the Assignments tab to grade them.',
    time: '1 hour ago',
    category: 'Grading',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    unread: true,
    archived: false,
    action: { label: 'Grade now', to: '/lecturer/assignments' },
  },
  {
    id: 'n3',
    title: 'Student engagement alert',
    body: 'Several students have low submission rates. You may want to reach out.',
    time: 'Yesterday',
    category: 'Students',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    unread: true,
    archived: false,
    action: { label: 'View students', to: '/lecturer/students' },
  },
  {
    id: 'n4',
    title: 'Security reminder',
    body: 'Use a strong password of at least 8 characters. You can change it anytime from your account page.',
    time: '2 days ago',
    category: 'Security',
    icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
    unread: false,
    archived: false,
    action: { label: 'Change password', to: '/lecturer/account?tab=password' },
  },
  {
    id: 'n5',
    title: 'New features on the roadmap',
    body: 'Timetable view and messaging are coming in an upcoming release.',
    time: '3 days ago',
    category: 'Roadmap',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    unread: false,
    archived: false,
  },
];

export const LecturerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const [expandedModules, setExpandedModules] = useState(() => {
    const activeMod = modules.find((m) => m.items.some((i) => location.pathname === i.path));
    const initial = {};
    modules.forEach((m) => { initial[m.id] = m.id === activeMod?.id; });
    return initial;
  });

  const isActive = (path) => location.pathname === path;
  const activePage = flattenedPages.find((p) => isActive(p.path));
  const onAccountPage = location.pathname === '/lecturer/account';
  const entityName = user?.entityName || 'Your Institution';

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const owner = modules.find((m) => m.items.some((i) => i.path === location.pathname));
    if (owner) {
      setExpandedModules((prev) => (prev[owner.id] ? prev : { ...prev, [owner.id]: true }));
    }
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggleModule = (id) => {
    if (collapsed && !mobileOpen) {
      setCollapsed(false);
      setExpandedModules(() => {
        const next = {};
        modules.forEach((m) => { next[m.id] = m.id === id; });
        return next;
      });
    } else {
      setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen w-full flex bg-[#f3f4f6] text-[#1b1e26] antialiased overflow-hidden">

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`bg-[#1b1e26] flex flex-col fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-[84px]' : 'lg:w-72'} w-72`}
      >
        <div className="px-5 pt-5 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <BrandLockup hideText={collapsed} size={36} />
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-white/50 hover:text-white p-1"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>
          {!collapsed && (
            <p className="mt-2 ml-[48px] text-[9px] font-black text-[#d0f24a] uppercase tracking-[0.25em]">Lecturer Portal</p>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3.5 py-2 space-y-1.5 school-scroll">
          <NavLink
            to={dashboardItem.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive: active }) =>
              `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
                active
                  ? 'bg-[#d0f24a] text-[#1b1e26] font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06] font-medium'
              }`
            }
          >
            <svg className="w-5 h-5 shrink-0 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="truncate text-[13px]">Dashboard</span>
          </NavLink>

          {modules.map((mod) => {
            const expanded = expandedModules[mod.id];
            const anyChildActive = mod.items.some((i) => isActive(i.path));
            const railMode = collapsed && !mobileOpen;

            return (
              <div key={mod.id}>
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  title={railMode ? mod.label : undefined}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    railMode ? 'lg:justify-center' : 'justify-between'
                  } ${
                    railMode && anyChildActive
                      ? 'bg-[#d0f24a] text-[#1b1e26] shadow-sm'
                      : expanded && !railMode
                      ? 'text-white bg-white/[0.06]'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <svg className="w-5 h-5 shrink-0 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={mod.icon} />
                    </svg>
                    {!railMode && <span className="truncate text-[13px] font-semibold">{mod.label}</span>}
                  </span>
                  {!railMode && (
                    <svg
                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${expanded ? 'rotate-180 text-[#d0f24a]' : 'text-white/30'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expanded && !railMode ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="ml-[24px] pl-3.5 border-l border-white/10 space-y-0.5 py-0.5">
                    {mod.items.map((item) => {
                      const active = isActive(item.path);
                      return (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          onClick={() => setMobileOpen(false)}
                          className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all duration-200 ${
                            active
                              ? 'bg-[#d0f24a] text-[#1b1e26] font-semibold shadow-sm'
                              : 'text-white/50 hover:text-white hover:bg-white/[0.06] font-medium'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${active ? 'bg-[#1b1e26]' : 'bg-white/20 group-hover:bg-[#d0f24a]'}`} />
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-3.5 shrink-0">
            <div className="rounded-2xl bg-[#d0f24a] p-4 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/20" />
              <div className="relative">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1b1e26] animate-pulse" />
                  <p className="text-[11px] font-bold text-[#1b1e26] uppercase tracking-wide truncate">{entityName}</p>
                </div>
                <p className="text-xs text-[#1b1e26]/70 mt-1 font-medium">
                  {user?.entityType ? `${user.entityType.charAt(0)}${user.entityType.slice(1).toLowerCase()} institution` : 'Lecturer portal'}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">

        <header className="h-[72px] shrink-0 bg-white border-b border-gray-100 flex items-center gap-4 px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-500 hover:text-[#1b1e26] p-1" aria-label="Open menu">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:flex text-gray-400 hover:text-[#1b1e26] hover:bg-gray-100 w-9 h-9 rounded-lg items-center justify-center transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>

          <div className="hidden sm:block min-w-0">
            <p className="text-[11px] font-medium text-gray-400 truncate">{entityName}</p>
            <h1 className="text-base font-semibold text-[#1b1e26] leading-tight truncate">
              {onAccountPage
                ? 'My Account'
                : activePage?.label
                  || (location.pathname.startsWith('/lecturer/courses') ? 'My Courses' : 'Dashboard')}
            </h1>
          </div>

          <div className="flex-1 max-w-md ml-auto hidden md:block">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" /></svg>
              <input
                type="text"
                placeholder="Search courses, students, assignments…"
                className="w-full rounded-xl bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none border border-transparent focus:bg-white focus:border-[#1b1e26]/15 focus:ring-4 focus:ring-[#1b1e26]/5 transition-all"
              />
            </div>
          </div>

          <NotificationBell seed={SEED_NOTIFICATIONS} viewAllPath="/lecturer/notifications" />

          <div className="relative" ref={profileRef}>
            <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="w-9 h-9 rounded-full bg-[#1b1e26] text-white text-xs font-bold flex items-center justify-center">
                {initialsOf(user?.name || user?.username)}
              </span>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[#1b1e26] leading-tight max-w-[200px] truncate">{user?.name || 'Lecturer'}</p>
                <p className="text-[11px] text-gray-400 leading-tight max-w-[200px] truncate">{user?.email || 'Lecturer'}</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#1b1e26] text-[#d0f24a] text-xs font-bold flex items-center justify-center shrink-0">
                    {initialsOf(user?.name || user?.username)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1b1e26] truncate">{user?.name || user?.username}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email || '—'}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/lecturer/account'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:text-[#1b1e26] hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  My Profile
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/lecturer/account?tab=password'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:text-[#1b1e26] hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                  Change Password
                </button>
                <div className="my-1.5 border-t border-gray-50" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" /></svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div key={location.pathname} className="max-w-[2100px] mx-auto w-full animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        .school-scroll::-webkit-scrollbar { width: 5px; }
        .school-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }
        .school-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
      `}</style>
    </div>
  );
};

export default LecturerLayout;
