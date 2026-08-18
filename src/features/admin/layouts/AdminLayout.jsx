import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { BrandLockup } from '../../../components/shared/Brand';
import { NotificationBell } from '../../../components/shared/NotificationBell';

// Client-side starter feed for the bell — swaps for the backend endpoint later.
// Each item deep-links into the console area it talks about.
const ADMIN_NOTIFICATIONS = [
  {
    id: 'a1',
    title: 'Welcome to the platform console',
    body: 'Manage entities, users, roles, and permissions from one place.',
    time: 'Just now',
    category: 'Getting started',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    unread: true,
    archived: false,
    action: { label: 'View entities', to: '/admin/entities' },
  },
  {
    id: 'a2',
    title: 'Review new registrations',
    body: 'Recently registered institutions appear in the entity directory for review.',
    time: '1 hour ago',
    category: 'Entities',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1',
    unread: true,
    archived: false,
    action: { label: 'Open directory', to: '/admin/entities' },
  },
  {
    id: 'a3',
    title: 'Tune roles & permissions',
    body: 'Adjust what each platform role can see and do across the console.',
    time: 'Yesterday',
    category: 'Access control',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
    unread: true,
    archived: false,
    action: { label: 'Manage roles', to: '/admin/roles' },
  },
  {
    id: 'a4',
    title: 'Security reminder',
    body: 'If you are still on the default admin password, change it now from your account page.',
    time: '2 days ago',
    category: 'Security',
    icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
    unread: false,
    archived: false,
    action: { label: 'Change password', to: '/admin/account?tab=password' },
  },
  {
    id: 'a5',
    title: 'Audit logs on the roadmap',
    body: 'Full platform audit trails are coming in an upcoming release.',
    time: '3 days ago',
    category: 'Roadmap',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    unread: false,
    archived: false,
  },
];

const INK = '#120E1A';
const LIME = '#8B5CF6';

// ── Icon set (stroke) ────────────────────────────────────────────────────────
const ICONS = {
  overview: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  health: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  users: <><path d="M17 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>,
  roles: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>,
  permissions: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="M11 12l6-6 3 3-6 6" /><path d="M14 9l3 3" /></>,
  audit: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></>,
  approvals: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
  subscriptions: <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>,
  courses: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  modules: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
  lessons: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M10 9l4 3-4 3V9z" /></>,
  plagiarism: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></>,
  employers: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  jobs: <><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="4" x2="8" y2="9" /></>,
  placements: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  revenue: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  invoices: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></>,
  payouts: <><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>,
  notifications: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
  ai: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></>,
  system: <><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>,
};

const Icon = ({ name, className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {ICONS[name]}
  </svg>
);

// ── Navigation model — a lean rail: Overview + two collapsible groups ────────
const OVERVIEW_LINK = { label: 'Overview', to: '/admin/dashboard', icon: 'overview' };

const NAV = [
  {
    id: 'user-management',
    title: 'User Management',
    icon: 'users',
    items: [
      { label: 'Users', to: '/admin/users', icon: 'users' },
      { label: 'Roles', to: '/admin/roles', icon: 'roles' },
      { label: 'Permissions', to: '/admin/permissions', icon: 'permissions' },
    ],
  },
  {
    id: 'institutions',
    title: 'Institutions',
    icon: 'employers',
    items: [
      { label: 'Entities', to: '/admin/entities', icon: 'employers' },

      { label: 'Subscriptions', to: '/admin/subscriptions', icon: 'subscriptions' },
    ],
  },
  {
    id: 'academic',
    title: 'Academic',
    icon: 'courses',
    items: [
      { label: 'Courses', to: '/admin/courses', icon: 'courses' },
      { label: 'Categories', to: '/admin/course-categories', icon: 'courses' },
      { label: 'Modules', to: '/admin/modules', icon: 'modules' },
      { label: 'Lessons', to: '/admin/lessons', icon: 'lessons' },
    ],
  },
  {
    id: 'other-settings',
    title: 'Other Settings',
    icon: 'system',
    items: [
      { label: 'Sys Parameters', to: '/admin/system-parameters', icon: 'system' },
    ],
  },
];

// Routes still reachable outside the trimmed nav (bell links, direct URLs)
// keep a proper topbar title.
const EXTRA_TITLES = {
  '/admin/account': 'My Account',
  '/admin/notifications': 'Notifications',
  '/admin/system-health': 'System Health',
  '/admin/audit-logs': 'Audit Logs',
  '/admin/courses': 'Courses',
  '/admin/plagiarism': 'Plagiarism',
  '/admin/employers': 'Employers',
  '/admin/jobs': 'Job Board',
  '/admin/placements': 'Placements',
  '/admin/revenue': 'Revenue',
  '/admin/invoices': 'Invoices',
  '/admin/payouts': 'Payouts',
  '/admin/ai-tuning': 'AI Tuning',
  '/admin/system-parameters': 'Sys Parameters',
};

const ALL_ITEMS = NAV.flatMap((s) => s.items);

// A nav item is active when the path equals its target OR is nested beneath it,
// so drill-downs like /admin/courses/:id/modules/:moduleId/lessons keep the
// "Courses" item highlighted and the Academic group expanded. No item.to is a
// prefix of another here, so this never double-matches.
const isPathActive = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

const initialsOf = (name) =>
  (name || 'User').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Expand the group that owns the current route on first render
  const [expandedSections, setExpandedSections] = useState(() => {
    const activeSection = NAV.find((s) => s.items.some((i) => isPathActive(location.pathname, i.to)));
    const initial = {};
    NAV.forEach((s) => { initial[s.id] = s.id === activeSection?.id; });
    return initial;
  });

  const toggleSection = (id) => {
    if (collapsed && !mobileOpen) {
      // Clicking a group while collapsed re-opens the rail focused on that group
      setCollapsed(false);
      setExpandedSections(() => {
        const next = {};
        NAV.forEach((s) => { next[s.id] = s.id === id; });
        return next;
      });
    } else {
      setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const year = new Date().getFullYear();
  const activeItem =
    location.pathname === OVERVIEW_LINK.to
      ? OVERVIEW_LINK
      : ALL_ITEMS.find((i) => i.to === location.pathname);
  const pageTitle =
    activeItem?.label
      || EXTRA_TITLES[location.pathname]
      || (location.pathname.startsWith('/admin/courses/') ? 'Course Details' : 'Admin');

  // Close mobile drawer + profile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Always reveal the group that owns the page we are on
  useEffect(() => {
    const owner = NAV.find((s) => s.items.some((i) => isPathActive(location.pathname, i.to)));
    if (owner) {
      setExpandedSections((prev) => (prev[owner.id] ? prev : { ...prev, [owner.id]: true }));
    }
  }, [location.pathname]);

  // Dismiss profile dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen w-full flex bg-[#f3f4f6] text-[#120E1A] antialiased overflow-hidden">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`bg-[#120E1A] flex flex-col fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-[84px]' : 'lg:w-72'} w-72`}
      >
        {/* Brand */}
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
            <p className="mt-2 ml-[48px] text-[9px] font-black text-[#8B5CF6] uppercase tracking-[0.25em]">Super Admin Portal</p>
          )}
        </div>

        {/* Nav — Overview link + collapsible groups (mirrors the school sidebar) */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-2 space-y-1.5 admin-scroll">
          {/* Overview — standalone entry */}
          <NavLink
            to={OVERVIEW_LINK.to}
            title={collapsed && !mobileOpen ? OVERVIEW_LINK.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200 ${
                collapsed && !mobileOpen ? 'lg:justify-center' : ''
              } ${
                isActive
                      ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`
            }
          >
            <Icon name={OVERVIEW_LINK.icon} className="w-5 h-5 shrink-0" />
            {!(collapsed && !mobileOpen) && (
              <span className="truncate text-[12px] font-semibold">{OVERVIEW_LINK.label}</span>
            )}
          </NavLink>

          {NAV.map((section) => {
            const expanded = expandedSections[section.id];
            const anyChildActive = section.items.some((i) => isPathActive(location.pathname, i.to));
            const railMode = collapsed && !mobileOpen;

            return (
              <div key={section.id}>
                {/* Group header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  title={railMode ? section.title : undefined}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    railMode ? 'lg:justify-center' : 'justify-between'
                  } ${
                    railMode && anyChildActive
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                      : expanded && !railMode
                      ? 'text-white bg-white/[0.06]'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon name={section.icon} className="w-5 h-5 shrink-0" />
                    {!railMode && <span className="truncate text-[12px] font-semibold">{section.title}</span>}
                  </span>
                  {!railMode && (
                    <svg
                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${expanded ? 'rotate-180 text-[#8B5CF6]' : 'text-white/30'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {/* Group items — smooth expand/collapse */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expanded && !railMode ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="ml-[24px] pl-3.5 border-l border-white/10 space-y-0.5 py-0.5">
                    {section.items.map((item) => {
                      const active = isPathActive(location.pathname, item.to);
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] transition-all duration-200 ${
                            active
                               ? 'bg-[#8B5CF6] text-white font-semibold shadow-sm'
                              : 'text-white/50 hover:text-white hover:bg-white/[0.06] font-medium'
                          }`}
                        >
                          <Icon name={item.icon} className="w-4 h-4 shrink-0" />
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

        {/* Bottom status card */}
        {!collapsed && (
          <div className="p-3 shrink-0">
            <div className="rounded-2xl bg-[#8B5CF6] p-4 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/20" />
              <div className="relative">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <p className="text-[11px] font-bold text-white uppercase tracking-wide">System Operational</p>
                </div>
                <p className="text-xs text-white/70 mt-1 font-medium">Environment · Rwanda</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-[72px] shrink-0 bg-white border-b border-gray-100 flex items-center gap-4 px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-500 hover:text-[#120E1A] p-1" aria-label="Open menu">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:flex text-gray-400 hover:text-[#120E1A] hover:bg-gray-100 w-9 h-9 rounded-lg items-center justify-center transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>

          <div className="hidden sm:block min-w-0">
            <p className="text-[11px] font-medium text-gray-400">Rwanda</p>
            <h1
              key={pageTitle}
              className="text-base font-semibold text-[#120E1A] leading-tight truncate animate-in fade-in slide-in-from-bottom-1 duration-300"
            >
              {pageTitle}
            </h1>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md ml-auto hidden md:block">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" /></svg>
              <input
                type="text"
                placeholder="Search…"
                className="w-full rounded-xl bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none border border-transparent focus:bg-white focus:border-[#120E1A]/15 focus:ring-4 focus:ring-[#120E1A]/5 transition-all"
              />
            </div>
          </div>

          {/* Notifications */}
          <NotificationBell seed={ADMIN_NOTIFICATIONS} viewAllPath="/admin/notifications" />

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setProfileOpen((o) => !o)} className="group flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] text-white text-xs font-bold flex items-center justify-center ring-0 ring-[#8B5CF6]/0 group-hover:ring-4 group-hover:ring-[#8B5CF6]/40 transition-all duration-200">
                {initialsOf(user?.name || user?.username)}
              </span>
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-semibold text-[#120E1A] leading-tight max-w-[200px] truncate">{user?.name || user?.username || 'Admin'}</p>
                <p className="text-[11px] text-gray-400 leading-tight max-w-[200px] truncate">{user?.email || user?.roles?.[0] || 'Administrator'}</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {initialsOf(user?.name || user?.username)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#120E1A] truncate">{user?.name || user?.username}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email || '—'}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/admin/account'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:text-[#120E1A] hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  My Profile
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/admin/account?tab=password'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:text-[#120E1A] hover:bg-gray-50 transition-colors"
                >
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
        </header>

        {/* Page content — fills large monitors, capped only on extreme ultra-wide.
            Keyed on the route so every page glides in with a soft fade + rise. */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div key={location.pathname} className="max-w-[2100px] mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        .admin-scroll::-webkit-scrollbar { width: 5px; }
        .admin-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }
        .admin-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
      `}</style>
    </div>
  );
};

export default AdminLayout;
