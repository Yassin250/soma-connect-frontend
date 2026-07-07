import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { LecturerPortal } from '../components/LecturerPortal';
import logo from '../../../assets/2.png';
import miniLogo from '../../../assets/1.png';

const modules = [
  {
    id: 'overview',
    label: 'Institutional Overview',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/school/dashboard' },
      { id: 'profile', label: 'School Profile', path: '/school/profile' },
    ],
  },
  {
    id: 'academic',
    label: 'Academic Management',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    items: [
      { id: 'classes', label: 'Classes & Sections', path: '/school/classes' },
      { id: 'subjects', label: 'Subject Allocation', path: '/school/subjects' },
      { id: 'timetable', label: 'Timetable', path: '/school/timetable' },
      { id: 'assessments', label: 'Assessments & Exams', path: '/school/assessments' },
    ],
  },
  {
    id: 'records',
    label: 'Staff & Student Records',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    items: [
      { id: 'staff', label: 'Staff Profile', path: '/school/staff' },
      { id: 'students', label: 'Student Registry', path: '/school/students' },
      { id: 'attendance', label: 'Attendance Tracking', path: '/school/attendance' },
    ],
  },
  {
    id: 'learning',
    label: 'SomaConnect Learning & Integrity',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    items: [
      { id: 'courses', label: 'Course Monitoring', path: '/school/courses' },
      { id: 'plagiarism', label: 'Plagiarism Oversight', path: '/school/plagiarism' },
      { id: 'library', label: 'Digital Library', path: '/school/library' },
    ],
  },
  {
    id: 'financials',
    label: 'Financials & Fees',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    items: [
      { id: 'fees', label: 'Fee Management', path: '/school/fees' },
      { id: 'expenditure', label: 'Expenditure', path: '/school/expenditure' },
      { id: 'reports', label: 'Financial Reports', path: '/school/financial-reports' },
    ],
  },
  {
    id: 'comms',
    label: 'Communication & Welfare',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    items: [
      { id: 'notifications', label: 'SMS & Notifications', path: '/school/notifications' },
      { id: 'discipline', label: 'Student Discipline', path: '/school/discipline' },
      { id: 'health', label: 'Health & Welfare', path: '/school/health' },
    ],
  },
  {
    id: 'career',
    label: 'Career & Internship Pipeline',
    icon: 'M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    items: [
      { id: 'internships', label: 'Internship Coordinator', path: '/school/internships' },
      { id: 'alumni', label: 'Alumni Network', path: '/school/alumni' },
    ],
  },
];

const flattenedPages = modules.flatMap((m) => m.items);

export const SchoolAdminDashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [expandedModules, setExpandedModules] = useState(() => {
    const activeMod = modules.find((m) => m.items.some((i) => location.pathname === i.path));
    const initial = {};
    modules.forEach((m) => { initial[m.id] = m.id === (activeMod?.id); });
    return initial;
  });

  const isActive = (path) => location.pathname === path;
  const isLecturer = user && user.roles?.[0]?.toUpperCase() === 'LECTURER';

  const toggleModule = (id) => {
    if (isSidebarCollapsed && !isMobileSidebarOpen) {
      setIsSidebarCollapsed(false);
      setExpandedModules((prev) => {
        const next = {};
        modules.forEach((m) => { next[m.id] = m.id === id; });
        return next;
      });
    } else {
      setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const activePage = flattenedPages.find((p) => isActive(p.path));

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-scroll::-webkit-scrollbar { width: 4px; }
      .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
      .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 4px; }
      .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
      .sidebar-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.25) transparent; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Lecturers get a full-page portal, not the admin layout
  if (isLecturer) {
    return (
      <div className="w-screen h-screen bg-[#F4F5FA] text-slate-800 flex flex-col overflow-hidden">
        <nav className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <img src={logo} alt="Logo" className="h-8 w-auto filter brightness-0 invert" />
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#5429FF]/10 text-[#5429FF] rounded-md uppercase tracking-wider">Faculty Hub</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">{user.role}</p>
                </div>
                <button onClick={() => { logout(); navigate('/login'); }} className="text-xs px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all">Sign Out</button>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <LecturerPortal />
        </main>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-[#F4F5FA] text-slate-800 antialiased flex flex-col md:flex-row overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <div className={`fixed md:relative z-40 h-full bg-[#5429FF] flex flex-col overflow-hidden shrink-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'w-[4.5rem]' : 'w-64'
      } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo area — fixed at top */}
        <div className="flex-shrink-0 h-20 flex items-center justify-center border-b border-white/10 px-4 relative z-10">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Full logo — slides out when collapsed */}
              <div className={`absolute transition-all duration-500 ease-in-out transform flex items-center justify-center ${
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? '-translate-y-20 opacity-0 pointer-events-none scale-75'
                  : 'translate-y-0 opacity-100 scale-100'
              }`}>
                <div
                  style={{
                    maskImage: `url(${logo})`,
                    WebkitMaskImage: `url(${logo})`,
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center'
                  }}
                  className="h-10 w-40 bg-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
                  role="img"
                  aria-label="SomaConnect"
                />
              </div>
              {/* Mini logo — slides in when collapsed */}
              <div className={`absolute transition-all duration-500 ease-in-out transform flex items-center justify-center ${
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? 'translate-y-0 opacity-100 scale-100'
                  : 'translate-y-20 opacity-0 pointer-events-none scale-50 -rotate-45'
              }`}>
                <div
                  style={{
                    maskImage: `url(${miniLogo})`,
                    WebkitMaskImage: `url(${miniLogo})`,
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center'
                  }}
                  className="h-12 w-10 bg-white drop-shadow-[0_3px_12px_rgba(255,255,255,0.25)]"
                  role="img"
                  aria-label="SomaConnect Mini"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto min-h-0 px-2 space-y-1 mt-2 sidebar-scroll">
            {modules.map((mod) => {
              const modExpanded = expandedModules[mod.id];
              const anyChildActive = mod.items.some((i) => isActive(i.path));
              return (
                <div key={mod.id} className="relative">
                  {/* Module header button */}
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className={`w-full flex items-center py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                      isSidebarCollapsed && !isMobileSidebarOpen
                        ? 'lg:justify-center lg:px-0 justify-between px-4'
                        : 'justify-between px-4'
                    } ${
                      modExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                        ? 'bg-white/15 text-white shadow-inner border border-white/5'
                        : isSidebarCollapsed && anyChildActive
                          ? 'lg:bg-white lg:text-[#5429FF] lg:shadow-md text-white/80'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed && !isMobileSidebarOpen ? 'lg:justify-center lg:w-full' : 'space-x-3'}`}>
                      <div className={`p-1.5 rounded-lg transition-colors ${modExpanded && (!isSidebarCollapsed || isMobileSidebarOpen) ? 'bg-white/10' : ''}`}>
                        <svg className="w-4 h-4 fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={mod.icon} />
                        </svg>
                      </div>
                      {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="tracking-wide text-[11px]">{mod.label}</span>}
                    </div>
                    {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                      <svg className={`w-3 h-3 transform transition-transform duration-200 text-white/50 ${modExpanded ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Sub-nav items */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden relative space-y-0.5 ${
                    modExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                      ? 'max-h-96 opacity-100 mt-1 pb-1 ml-2 pl-2 border-l border-white/15'
                      : 'max-h-0 opacity-0 pointer-events-none'
                  }`}>
                    {mod.items.map((item) => {
                      const active = isActive(item.path);
                      return (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          onClick={() => setIsMobileSidebarOpen(false)}
                          className={`flex items-center space-x-2 px-3 py-2 text-[11px] font-semibold rounded-lg transition-all tracking-wide ${
                            active
                              ? 'bg-white/20 text-white shadow-sm'
                              : 'text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : 'bg-white/20'}`} />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

        {/* User section — fixed at bottom */}
        <div className="flex-shrink-0 px-3 pt-4 pb-6 border-t border-white/10">
          {!isSidebarCollapsed && (
            <div className="px-1 mb-3">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-purple-200/60 font-mono">School Admin</p>
            </div>
          )}
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className={`flex items-center gap-3 w-full py-2.5 px-4 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all ${
              isSidebarCollapsed && !isMobileSidebarOpen ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hidden md:flex transition-all"
        >
          <svg className={`w-3 h-3 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="bg-white border-b border-slate-200 shadow-sm h-16 shrink-0 z-20">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Left: mobile hamburger + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-600">School</span>
                <span>/</span>
                <span className="font-medium">{activePage?.label || 'Dashboard'}</span>
              </div>
            </div>

            {/* Center: search */}
            <div className="flex-1 max-w-md mx-auto hidden md:block">
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search by name, email, or course..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5429FF] focus:ring-2 focus:ring-purple-50 transition-all"
                />
              </div>
            </div>

            {/* Right: notification bell + profile dropdown */}
            <div className="flex items-center gap-3">
              <NavLink
                to="/school/notifications"
                className="relative p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </NavLink>

              <div className="relative">
                <div
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group p-1.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 transition-all duration-150"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5429FF] to-purple-600 flex items-center justify-center text-xs font-black text-white shadow-md transition-transform duration-150 group-hover:scale-105">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}{user?.name?.split(' ')[1]?.charAt(0)?.toUpperCase() || ''}
                  </div>
                  <span className="hidden sm:inline text-sm font-bold text-slate-700 tracking-tight transition-colors group-hover:text-[#5429FF]">
                    {user?.name || 'Admin'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 mr-1 ${isProfileMenuOpen ? 'rotate-180 text-[#5429FF]' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                    <div className="absolute right-0 mt-3 w-72 bg-white rounded-[24px] shadow-2xl border border-slate-100 py-3.5 z-50 transform origin-top-right transition-all duration-200 mx-2 sm:mx-0">
                      <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45 hidden sm:block" />

                      <div className="px-5 py-3.5 flex items-center space-x-3.5 border-b border-slate-100/80 mb-2.5">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5429FF] to-purple-600 flex items-center justify-center text-sm font-black text-white shadow-sm">
                          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex flex-col text-left overflow-hidden">
                          <span className="text-sm font-black text-slate-800 leading-tight">{user?.name || 'Admin'}</span>
                          <span className="text-xs text-slate-400 font-semibold truncate max-w-[160px] mt-0.5">{user?.email || 'admin@somaconnect.com'}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => { setActiveModal('profile'); setIsProfileMenuOpen(false); }}
                        className="w-full px-5 py-3 flex items-center space-x-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left font-bold text-sm"
                      >
                        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#5429FF]">
                          <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                        <span>My Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setActiveModal('password'); setIsProfileMenuOpen(false); }}
                        className="w-full px-5 py-3 flex items-center space-x-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left font-bold text-sm border-b border-slate-100/80 pb-3.5"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                          <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </div>
                        <span>Change Password</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full px-5 mt-2.5 py-3 flex items-center space-x-3.5 text-red-600 hover:bg-red-50/60 transition-colors text-left font-extrabold text-sm"
                      >
                        <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                          <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                        </div>
                        <span>Logout Account</span>
                      </button>

                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Profile Modal */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-[520px] overflow-hidden border border-slate-100 p-7 relative">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute top-5 right-6 text-slate-400 hover:text-slate-600 text-2xl focus:outline-none">&times;</button>
            <div className="text-left mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Personal Information</h3>
              <p className="text-xs text-slate-400 mt-1">Your system operational directory identity properties.</p>
            </div>
            <div className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Name</label>
                  <input type="text" readOnly value={user?.name || 'Admin'} className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Phone</label>
                  <input type="text" readOnly value="N/A" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 italic font-medium focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Email</label>
                <input type="text" readOnly value={user?.email || 'admin@somaconnect.com'} className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">User Type</label>
                <input type="text" readOnly value="School Admin" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Assigned Roles</label>
                <div className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-extrabold bg-purple-50 text-[#5429FF] border border-purple-100 tracking-wider">
                    {user?.roles?.[0] || 'SCHOOL_ADMIN'}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-end">
              <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-200 shadow-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-[520px] overflow-hidden border border-slate-100 p-7 relative">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute top-5 right-6 text-slate-400 hover:text-slate-600 text-2xl focus:outline-none">&times;</button>
            <div className="text-left mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Change Password</h3>
              <p className="text-xs text-slate-400 mt-1">Update your authentication credentials.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); }} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Current Password</label>
                <div className="relative">
                  <input type={showCurrentPass ? 'text' : 'password'} placeholder="••••••••••••" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 text-slate-800 placeholder-slate-300 font-semibold" />
                  <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">New Password</label>
                <div className="relative">
                  <input type={showNewPass ? 'text' : 'password'} placeholder="••••••••••••" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 text-slate-800 placeholder-slate-300 font-semibold" />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirmPass ? 'text' : 'password'} placeholder="••••••••••••" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 text-slate-800 placeholder-slate-300 font-semibold" />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm">Cancel</button>
                <button type="submit" className="px-5 py-3 bg-[#5429FF] hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md">Update Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};