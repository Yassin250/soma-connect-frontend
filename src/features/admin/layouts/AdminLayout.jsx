import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/2.png';         
import miniLogo from '../../../assets/1.png';      


export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Layout navigation drawer control states
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(true);
  const [isDashboardMenuExpanded, setIsDashboardMenuExpanded] = useState(true);
  const [isUserAccessMenuExpanded, setIsUserAccessMenuExpanded] = useState(false);
  const [isInstitutionsMenuExpanded, setIsInstitutionsMenuExpanded] = useState(false);
  const [isAcademicMenuExpanded, setIsAcademicMenuExpanded] = useState(false);
  const [isCareerMenuExpanded, setIsCareerMenuExpanded] = useState(false);
  const [isFinancialsMenuExpanded, setIsFinancialsMenuExpanded] = useState(false);
  const [isCommsMenuExpanded, setIsCommsMenuExpanded] = useState(false);
  const [isSettingsMenuExpanded, setIsSettingsMenuExpanded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Mobile drawer layout override toggle state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modular overlay window active targeting states
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'password' | null

  // Input password mask reveal toggles
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Helper to check if a path is active
  const isActive = (path) => location.pathname === path;

  // Structural tracking variables for complex dashboard flows
  const activeNavigationClass = "bg-white text-[#1d4ed8] shadow-md font-bold scale-[1.02] border-r-4 border-purple-400";
  const inactiveNavigationClass = "text-white/80 hover:text-white hover:bg-white/10 font-medium hover:translate-x-1";

  // Inject custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-scroll::-webkit-scrollbar {
        width: 4px;
      }
      .sidebar-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .sidebar-scroll::-webkit-scrollbar-thumb {
        background: rgba(99, 102, 241, 0.4);
        border-radius: 4px;
        border: 1px solid transparent;
        background-clip: content-box;
      }
      .sidebar-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(99, 102, 241, 0.6);
      }
      .sidebar-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(99, 102, 241, 0.4) transparent;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="h-screen w-full bg-[#f4f7fe] text-gray-800 font-sans antialiased flex overflow-x-hidden p-0 sm:p-3 md:p-4 lg:p-5">
      
      {/* MOBILE BREAKPOINT DRAWER OVERLAY BACKDROP */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION DRAWER (Loaded with custom micro-geometry and glowing curved lines) */}
      <aside 
        className={`bg-[#1d4ed8] text-white flex flex-col fixed inset-y-0 left-0 lg:sticky lg:h-[calc(100vh-40px)] z-40 shadow-2xl select-none transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-24' : 'lg:w-72'} w-72 rounded-[28px]`}
      >
        
        {/* ========================================================= */}
        {/* COOL VISUAL DESIGN ACCENTS & AMBIENT OBJECTS               */}
        {/* ========================================================= */}
        {/* Accent 1: Top Ambient Gradient Back-mesh */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none transform -skew-y-12 origin-top-left scale-150 z-0" />
        
        {/* Accent 2: Glowing Tech-Curve Line 1 */}
        <svg className="absolute top-20 -left-10 w-80 h-40 text-white/5 pointer-events-none fill-none z-0 transform rotate-12" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,30 50,50 T100,50" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0,60 Q25,40 50,60 T100,60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
        </svg>

        {/* Accent 3: Floating Neon Blurry Sphere (Top Right) */}
        <div className="absolute top-12 -right-6 w-24 h-24 bg-sky-400/20 rounded-full pointer-events-none blur-xl z-0 animate-pulse" />

        {/* Accent 4: Glowing Tech-Curve Line 2 (Mid-Sidebar Track) */}
        <svg className="absolute top-[40%] -right-20 w-96 h-60 text-white/5 pointer-events-none fill-none z-0 transform -rotate-12" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,30 C30,80 70,0 100,70" stroke="currentColor" strokeWidth="1" />
        </svg>

        {/* Accent 5: Floating Glassmorphism Geometric Ring (Lower Left) */}
        <div className="absolute bottom-36 -left-8 w-20 h-20 rounded-full border-2 border-white/5 pointer-events-none z-0 backdrop-blur-[1px]" />
        
        {/* Accent 6: Bottom background geometric ambient circles */}
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/10 rounded-full pointer-events-none blur-2xl z-0" />
        <div className="absolute bottom-20 -right-10 w-24 h-24 bg-black/15 rounded-full pointer-events-none blur-lg z-0" />
        {/* ========================================================= */}

        {/* Brand Header Identity Frame with smooth layout tracking height */}
        <div className="h-28 flex items-center justify-between border-b border-white/10 px-6 relative z-10">
          <div className="flex items-center justify-center w-full relative h-20 overflow-hidden">
            
            {/* DUAL-ASSET SLIDING ANIMATION CONTAINER TRACK */}
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* STATE 1: MAIN WIDE BRAND LOGO (Slides up/out when collapsed) */}
              <div 
                className={`absolute transition-all duration-500 shortcuts ease-in-out transform flex items-center justify-center ${
                  isSidebarCollapsed && !isMobileSidebarOpen
                    ? '-translate-y-20 opacity-0 pointer-events-none scale-75' 
                    : 'translate-y-0 opacity-100 scale-100'
                }`}
              >
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
                  className="h-12 w-48 bg-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
                  role="img"
                  aria-label="SomaConnect Logo Wide"
                />
              </div>

              {/* STATE 2: COLLAPSED SECOND COMPACT MINI LOGO (Sized up significantly to look way cleaner!) */}
              <div 
                className={`absolute transition-all duration-500 ease-in-out transform flex items-center justify-center ${
                  isSidebarCollapsed && !isMobileSidebarOpen
                    ? 'translate-y-0 opacity-100 scale-100 rotate-0' 
                    : 'translate-y-20 opacity-0 pointer-events-none scale-50 -rotate-45'
                }`}
              >
               {/* STATE 2: COLLAPSED SECOND COMPACT MINI LOGO (Slides down/in with scale pulse when layout contracts) */}

              <div
                className={`absolute transition-all duration-500 ease-in-out transform flex items-center justify-center ${
                  isSidebarCollapsed && !isMobileSidebarOpen
                    ? 'translate-y-0 opacity-100 scale-110 rotate-0'
                    : 'translate-y-16 opacity-0 pointer-events-none scale-50 -rotate-45'
                }`}
              >
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
                  className="h-40 w-11 bg-white drop-shadow-[0_3px_12px_rgba(255,255,255,0.25)]"
                  role="img"
                  aria-label="SomaConnect Mini Icon"
                />
              </div>
            </div>
          </div>
          </div>
        
          {/* Explicit Mobile Nav Drawer Close Handle */}
          <button 
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action Callout Button Context Framework */}
        <div className="px-4 pt-6 pb-2 relative z-10">
          <button
            type="button"
            onClick={() => {
              if(isSidebarCollapsed) {
                setIsSidebarCollapsed(false);
              } else {
                setIsUserMenuExpanded(!isUserMenuExpanded);
              }
            }}
            className={`w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/15 text-white py-3 px-4 rounded-2xl border border-white/10 font-semibold text-xs tracking-wider uppercase shadow-sm transition-all duration-200 ${
              isSidebarCollapsed && !isMobileSidebarOpen ? 'lg:p-3 lg:rounded-xl' : ''
            }`}
          >
            <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="transition-opacity duration-200">Toggle Hub Controls</span>}
          </button>
        </div>

        {/* Navigation Link Element Hierarchy */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto relative z-10 sidebar-scroll">
          
          {/* Module 1 - Dashboard & Analytics */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsDashboardMenuExpanded(true);
                } else {
                  setIsDashboardMenuExpanded(!isDashboardMenuExpanded);
                }
              }}
              className={`w-full flex items-center py-3 text-sm font-bold rounded-2xl transition-all duration-200 ${
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? 'lg:justify-center h-12 lg:w-12 mx-auto px-0 justify-between px-4' 
                  : 'justify-between px-5'
              } ${
                isDashboardMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'bg-white/15 text-white shadow-inner border border-white/5' 
                  : isSidebarCollapsed && (isActive('/admin/dashboard') || isActive('/admin/system-health')) ? 'lg:bg-white lg:text-[#1d4ed8] lg:shadow-md text-white/80' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className={`flex items-center ${isSidebarCollapsed && !isMobileSidebarOpen ? 'lg:justify-center lg:w-full' : 'space-x-4'}`}>
                <div className={`p-1.5 rounded-xl transition-colors ${isDashboardMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen) ? 'bg-white/10' : ''}`}>
                  <svg className="w-5 h-5 fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="tracking-wide text-[14px]">Dashboard &amp; Analytics</span>}
              </div>
              
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <svg 
                  className={`w-4 h-4 transform transition-transform duration-200 text-white/60 ${isDashboardMenuExpanded ? 'rotate-180' : 'rotate-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden relative space-y-1.5 ${
                isDashboardMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'max-h-72 opacity-100 mt-3 pb-2 ml-2 pl-3 border-l border-white/20' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <NavLink
                to="/admin/dashboard"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </div>
                <span>Overview</span>
              </NavLink>

              <NavLink
                to="/admin/system-health"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <span>System Health</span>
              </NavLink>
            </div>
          </div>

          {/* Module 2 - User & Access */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsUserAccessMenuExpanded(true);
                } else {
                  setIsUserAccessMenuExpanded(!isUserAccessMenuExpanded);
                }
              }}
              className={`w-full flex items-center py-3 text-sm font-bold rounded-2xl transition-all duration-200 ${
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? 'lg:justify-center h-12 lg:w-12 mx-auto px-0 justify-between px-4' 
                  : 'justify-between px-5'
              } ${
                isUserAccessMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'bg-white/15 text-white shadow-inner border border-white/5' 
                  : isSidebarCollapsed && (isActive('/admin/users') || isActive('/admin/roles') || isActive('/admin/permissions') || isActive('/admin/audit-logs')) ? 'lg:bg-white lg:text-[#1d4ed8] lg:shadow-md text-white/80' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className={`flex items-center ${isSidebarCollapsed && !isMobileSidebarOpen ? 'lg:justify-center lg:w-full' : 'space-x-4'}`}>
                <div className={`p-1.5 rounded-xl transition-colors ${isUserAccessMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen) ? 'bg-white/10' : ''}`}>
                  <svg className="w-5 h-5 fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  </svg>
                </div>
                {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="tracking-wide text-[14px]">User &amp; Access</span>}
              </div>
              
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <svg 
                  className={`w-4 h-4 transform transition-transform duration-200 text-white/60 ${isUserAccessMenuExpanded ? 'rotate-180' : 'rotate-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden relative space-y-1.5 ${
                isUserAccessMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'max-h-72 opacity-100 mt-3 pb-2 ml-2 pl-3 border-l border-white/20' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <NavLink
                to="/admin/users"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <span>Users</span>
              </NavLink>

              <NavLink
                to="/admin/roles"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <span>Roles</span>
              </NavLink>

              <NavLink
                to="/admin/permissions"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <circle cx="12" cy="11" r="2.5" />
                    <path d="M12 13.5v3" />
                  </svg>
                </div>
                <span>Permissions</span>
              </NavLink>

              <NavLink
                to="/admin/audit-logs"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span>Audit Logs</span>
              </NavLink>
            </div>
          </div>

          {/* Module 3 - Institutions */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsInstitutionsMenuExpanded(true);
                } else {
                  setIsInstitutionsMenuExpanded(!isInstitutionsMenuExpanded);
                }
              }}
              className={`w-full flex items-center py-3 text-sm font-bold rounded-2xl transition-all duration-200 ${
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? 'lg:justify-center h-12 lg:w-12 mx-auto px-0 justify-between px-4' 
                  : 'justify-between px-5'
              } ${
                isInstitutionsMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'bg-white/15 text-white shadow-inner border border-white/5' 
                  : isSidebarCollapsed && (isActive('/admin/approvals') || isActive('/admin/subscriptions')) ? 'lg:bg-white lg:text-[#1d4ed8] lg:shadow-md text-white/80' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className={`flex items-center ${isSidebarCollapsed && !isMobileSidebarOpen ? 'lg:justify-center lg:w-full' : 'space-x-4'}`}>
                <div className={`p-1.5 rounded-xl transition-colors ${isInstitutionsMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen) ? 'bg-white/10' : ''}`}>
                  <svg className="w-5 h-5 fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="tracking-wide text-[14px]">Institutions</span>}
              </div>
              
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <svg 
                  className={`w-4 h-4 transform transition-transform duration-200 text-white/60 ${isInstitutionsMenuExpanded ? 'rotate-180' : 'rotate-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden relative space-y-1.5 ${
                isInstitutionsMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'max-h-72 opacity-100 mt-3 pb-2 ml-2 pl-3 border-l border-white/20' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <NavLink
                to="/admin/approvals"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <span>Schools &amp; Universities</span>
              </NavLink>

              <NavLink
                to="/admin/subscriptions"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <span>Subscriptions</span>
              </NavLink>
            </div>
          </div>

          {/* Module 4 - Academic Oversight */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsAcademicMenuExpanded(true);
                } else {
                  setIsAcademicMenuExpanded(!isAcademicMenuExpanded);
                }
              }}
              className={`w-full flex items-center py-3 text-sm font-bold rounded-2xl transition-all duration-200 ${
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? 'lg:justify-center h-12 lg:w-12 mx-auto px-0 justify-between px-4' 
                  : 'justify-between px-5'
              } ${
                isAcademicMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'bg-white/15 text-white shadow-inner border border-white/5' 
                  : isSidebarCollapsed && (isActive('/admin/courses') || isActive('/admin/plagiarism')) ? 'lg:bg-white lg:text-[#1d4ed8] lg:shadow-md text-white/80' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className={`flex items-center ${isSidebarCollapsed && !isMobileSidebarOpen ? 'lg:justify-center lg:w-full' : 'space-x-4'}`}>
                <div className={`p-1.5 rounded-xl transition-colors ${isAcademicMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen) ? 'bg-white/10' : ''}`}>
                  <svg className="w-5 h-5 fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <line x1="8" y1="7" x2="16" y2="7" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="tracking-wide text-[14px]">Academic Oversight</span>}
              </div>
              
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <svg 
                  className={`w-4 h-4 transform transition-transform duration-200 text-white/60 ${isAcademicMenuExpanded ? 'rotate-180' : 'rotate-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden relative space-y-1.5 ${
                isAcademicMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'max-h-72 opacity-100 mt-3 pb-2 ml-2 pl-3 border-l border-white/20' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <NavLink
                to="/admin/courses"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <span>Course Library</span>
              </NavLink>

              <NavLink
                to="/admin/plagiarism"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <span>Plagiarism Reports</span>
              </NavLink>
            </div>
          </div>

          {/* Module 5 - Career Marketplace */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsCareerMenuExpanded(true);
                } else {
                  setIsCareerMenuExpanded(!isCareerMenuExpanded);
                }
              }}
              className={`w-full flex items-center py-3 text-sm font-bold rounded-2xl transition-all duration-200 ${
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? 'lg:justify-center h-12 lg:w-12 mx-auto px-0 justify-between px-4' 
                  : 'justify-between px-5'
              } ${
                isCareerMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'bg-white/15 text-white shadow-inner border border-white/5' 
                  : isSidebarCollapsed && (isActive('/admin/employers') || isActive('/admin/jobs') || isActive('/admin/placements')) ? 'lg:bg-white lg:text-[#1d4ed8] lg:shadow-md text-white/80' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className={`flex items-center ${isSidebarCollapsed && !isMobileSidebarOpen ? 'lg:justify-center lg:w-full' : 'space-x-4'}`}>
                <div className={`p-1.5 rounded-xl transition-colors ${isCareerMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen) ? 'bg-white/10' : ''}`}>
                  <svg className="w-5 h-5 fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="tracking-wide text-[14px]">Career Marketplace</span>}
              </div>
              
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <svg 
                  className={`w-4 h-4 transform transition-transform duration-200 text-white/60 ${isCareerMenuExpanded ? 'rotate-180' : 'rotate-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden relative space-y-1.5 ${
                isCareerMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'max-h-72 opacity-100 mt-3 pb-2 ml-2 pl-3 border-l border-white/20' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <NavLink
                to="/admin/employers"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <span>Employers</span>
              </NavLink>

              <NavLink
                to="/admin/jobs"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <span>Job Board</span>
              </NavLink>

              <NavLink
                to="/admin/placements"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span>Placement Tracking</span>
              </NavLink>
            </div>
          </div>

          {/* Module 6 - Financials */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsFinancialsMenuExpanded(true);
                } else {
                  setIsFinancialsMenuExpanded(!isFinancialsMenuExpanded);
                }
              }}
              className={`w-full flex items-center py-3 text-sm font-bold rounded-2xl transition-all duration-200 ${
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? 'lg:justify-center h-12 lg:w-12 mx-auto px-0 justify-between px-4' 
                  : 'justify-between px-5'
              } ${
                isFinancialsMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'bg-white/15 text-white shadow-inner border border-white/5' 
                  : isSidebarCollapsed && (isActive('/admin/revenue') || isActive('/admin/invoices') || isActive('/admin/payouts')) ? 'lg:bg-white lg:text-[#1d4ed8] lg:shadow-md text-white/80' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className={`flex items-center ${isSidebarCollapsed && !isMobileSidebarOpen ? 'lg:justify-center lg:w-full' : 'space-x-4'}`}>
                <div className={`p-1.5 rounded-xl transition-colors ${isFinancialsMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen) ? 'bg-white/10' : ''}`}>
                  <svg className="w-5 h-5 fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="tracking-wide text-[14px]">Financials</span>}
              </div>
              
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <svg 
                  className={`w-4 h-4 transform transition-transform duration-200 text-white/60 ${isFinancialsMenuExpanded ? 'rotate-180' : 'rotate-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden relative space-y-1.5 ${
                isFinancialsMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'max-h-72 opacity-100 mt-3 pb-2 ml-2 pl-3 border-l border-white/20' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <NavLink
                to="/admin/revenue"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <span>Revenue</span>
              </NavLink>

              <NavLink
                to="/admin/invoices"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <span>Invoices</span>
              </NavLink>

              <NavLink
                to="/admin/payouts"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
                  </svg>
                </div>
                <span>Payouts</span>
              </NavLink>
            </div>
          </div>

          {/* Module 7 - Communication */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsCommsMenuExpanded(true);
                } else {
                  setIsCommsMenuExpanded(!isCommsMenuExpanded);
                }
              }}
              className={`w-full flex items-center py-3 text-sm font-bold rounded-2xl transition-all duration-200 ${
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? 'lg:justify-center h-12 lg:w-12 mx-auto px-0 justify-between px-4' 
                  : 'justify-between px-5'
              } ${
                isCommsMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'bg-white/15 text-white shadow-inner border border-white/5' 
                  : isSidebarCollapsed && (isActive('/admin/notifications')) ? 'lg:bg-white lg:text-[#1d4ed8] lg:shadow-md text-white/80' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className={`flex items-center ${isSidebarCollapsed && !isMobileSidebarOpen ? 'lg:justify-center lg:w-full' : 'space-x-4'}`}>
                <div className={`p-1.5 rounded-xl transition-colors ${isCommsMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen) ? 'bg-white/10' : ''}`}>
                  <svg className="w-5 h-5 fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="tracking-wide text-[14px]">Communication</span>}
              </div>
              
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <svg 
                  className={`w-4 h-4 transform transition-transform duration-200 text-white/60 ${isCommsMenuExpanded ? 'rotate-180' : 'rotate-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden relative space-y-1.5 ${
                isCommsMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'max-h-72 opacity-100 mt-3 pb-2 ml-2 pl-3 border-l border-white/20' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <NavLink
                to="/admin/notifications"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <span>Notifications</span>
              </NavLink>
            </div>
          </div>

          {/* Module 8 - Settings */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsSettingsMenuExpanded(true);
                } else {
                  setIsSettingsMenuExpanded(!isSettingsMenuExpanded);
                }
              }}
              className={`w-full flex items-center py-3 text-sm font-bold rounded-2xl transition-all duration-200 ${
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? 'lg:justify-center h-12 lg:w-12 mx-auto px-0 justify-between px-4' 
                  : 'justify-between px-5'
              } ${
                isSettingsMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'bg-white/15 text-white shadow-inner border border-white/5' 
                  : isSidebarCollapsed && (isActive('/admin/ai-tuning')) ? 'lg:bg-white lg:text-[#1d4ed8] lg:shadow-md text-white/80' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className={`flex items-center ${isSidebarCollapsed && !isMobileSidebarOpen ? 'lg:justify-center lg:w-full' : 'space-x-4'}`}>
                <div className={`p-1.5 rounded-xl transition-colors ${isSettingsMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen) ? 'bg-white/10' : ''}`}>
                  <svg className="w-5 h-5 fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="tracking-wide text-[14px]">Settings</span>}
              </div>
              
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <svg 
                  className={`w-4 h-4 transform transition-transform duration-200 text-white/60 ${isSettingsMenuExpanded ? 'rotate-180' : 'rotate-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            <div 

              className={`transition-all duration-300 ease-in-out overflow-hidden relative space-y-1.5 ${
                isSettingsMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'max-h-72 opacity-100 mt-3 pb-2 ml-2 pl-3 border-l border-white/20' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <NavLink
                to="/admin/ai-tuning"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  isActive ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                    <rect x="9" y="9" width="6" height="6" />
                    <line x1="9" y1="1" x2="9" y2="4" />
                    <line x1="15" y1="1" x2="15" y2="4" />
                    <line x1="9" y1="20" x2="9" y2="23" />
                    <line x1="15" y1="20" x2="15" y2="23" />
                    <line x1="20" y1="9" x2="23" y2="9" />
                    <line x1="20" y1="14" x2="23" y2="14" />
                    <line x1="1" y1="9" x2="4" y2="9" />
                    <line x1="1" y1="14" x2="4" y2="14" />
                  </svg>
                </div>
                <span>AI Tuning</span>
              </NavLink>
            </div>
          </div>
        </nav>

        {/* System Storage Context Box - Pinned to bottom */}
        {(!isSidebarCollapsed || isMobileSidebarOpen) && (
          <div className="mt-auto p-4 mx-4 mb-4 bg-white/5 border-t border-white/10 text-left relative z-10 backdrop-blur-md rounded-2xl shadow-inner animate-fade-in">
            <div className="flex items-center space-x-2 text-white/90 font-bold text-xs mb-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-slate-300">Security Integrity System</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full w-[85%] rounded-full" />
            </div>
            <span className="text-[10px] text-white/50 block mt-1.5 font-medium tracking-wide">Environment Context: RWANDA</span>
          </div>
        )}
      </aside>

      {/* RIGHT SIDE DATA VIEWPORT WRAPPER */}
      <div className="flex-1 flex flex-col h-full w-full lg:px-4">

        
        {/* TOP NAVBAR HEADER BOX */}
        <header className="w-full bg-transparent h-20 flex items-center justify-between px-4 sm:px-6 mb-4 select-none flex-shrink-0">

          
          {/* Collapse Controller & Localized System Title Context */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <button 
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:block text-slate-500 hover:text-slate-800 transition-colors focus:outline-none p-2 rounded-xl bg-white shadow-sm border border-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <button 
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors focus:outline-none p-2 rounded-xl bg-white shadow-sm border border-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div className="flex flex-col text-left leading-tight">
              <span className="text-[11px] text-[#1d4ed8] font-extrabold tracking-wider uppercase">RWANDA</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 capitalize tracking-tight mt-0.5">
                {location.pathname === '/admin/dashboard' ? 'Overview' :
                 location.pathname === '/admin/system-health' ? 'System Health' :
                 location.pathname === '/admin/users' ? 'User Management' :
                 location.pathname === '/admin/roles' ? 'Roles' :
                 location.pathname === '/admin/permissions' ? 'Permissions' :
                 location.pathname === '/admin/audit-logs' ? 'Audit Logs' :
                  location.pathname === '/admin/approvals' ? 'Schools & Universities' :
                 location.pathname === '/admin/subscriptions' ? 'Subscriptions' :
                 location.pathname === '/admin/courses' ? 'Course Library' :
                 location.pathname === '/admin/plagiarism' ? 'Plagiarism Reports' :
                 location.pathname === '/admin/employers' ? 'Employers' :
                 location.pathname === '/admin/jobs' ? 'Job Board' :
                 location.pathname === '/admin/placements' ? 'Placement Tracking' :
                 location.pathname === '/admin/revenue' ? 'Revenue' :
                 location.pathname === '/admin/invoices' ? 'Invoices' :
                 location.pathname === '/admin/payouts' ? 'Payouts' :
                 location.pathname === '/admin/notifications' ? 'Notifications' :
                 location.pathname === '/admin/ai-tuning' ? 'AI Tuning' : 'Dashboard'}
              </h2>
            </div>
          </div>

          {/* User Anchor Dropdown Interface Hub & Universal Utilities */}
          <div className="flex items-center space-x-4">
            
            <div className="hidden md:flex items-center bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 shadow-sm w-64 focus-within:border-blue-500 transition-all">
              <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.602z" />
              </svg>
              <input 
                type="text" 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search global operations..." 
                className="bg-transparent text-xs text-slate-700 outline-none w-full font-medium placeholder-slate-400"
              />
            </div>

            <NavLink
              to="/admin/notifications"
              className="relative p-2 rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-all"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </NavLink>

            <div className="relative">
              <div 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group p-1.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 shadow-sm transition-all duration-150"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1d4ed8] to-[#1e40af] flex items-center justify-center text-xs font-black text-white shadow-md transition-transform duration-150 group-hover:scale-105">
                  {user?.name?.charAt(0) || 'G'}{user?.name?.split(' ')[1]?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline text-sm font-bold text-slate-700 tracking-tight transition-colors group-hover:text-[#1d4ed8]">
                  {user?.name || 'Guest User'}
                </span>
                <svg 
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 mr-1 ${isProfileMenuOpen ? 'rotate-180 text-[#1d4ed8]' : ''}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* FLOATING ACTION POPOVER CARD */}
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-[24px] shadow-2xl border border-slate-100 py-3.5 z-50 transform origin-top-right transition-all duration-200 animate-fade-in mx-2 sm:mx-0">
                    <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45 hidden sm:block" />

                    <div className="px-5 py-3.5 flex items-center space-x-3.5 border-b border-slate-100/80 mb-2.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-sm font-black text-white shadow-sm">
                        {user?.name?.charAt(0) || 'G'}{user?.name?.split(' ')[1]?.charAt(0) || 'U'}
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-sm font-black text-slate-800 leading-tight">{user?.name || 'Guest User'}</span>
                        <span className="text-xs text-slate-400 font-semibold truncate max-w-[160px] mt-0.5">{user?.email || 'guest@somaconnect.com'}</span>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => { setActiveModal('profile'); setIsProfileMenuOpen(false); }}
                      className="w-full px-5 py-3 flex items-center space-x-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left font-bold text-sm"
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1d4ed8]">
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
                      onClick={logout} 
                      className="w-full px-5 mt-2.5 py-3 flex items-center space-x-3.5 text-red-600 hover:bg-red-50/60 transition-colors text-left font-extrabold text-sm"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        </header>

        {/* Dynamic Inner Workspace Context Router Portal */}
        <main className="flex-1 bg-white rounded-[32px] border border-slate-200/60 p-5 sm:p-6 lg:p-8 shadow-sm overflow-y-auto min-h-0 transition-all duration-300">

          <Outlet />
        </main>
      </div>

      {/* ========================================================= */}
      {/* 1. PERSONAL INFORMATION MODAL PANEL                       */}
      {/* ========================================================= */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-[520px] overflow-hidden border border-slate-100 p-7 relative">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute top-5 right-6 text-slate-400 hover:text-slate-600 text-2xl focus:outline-none">&times;</button>
            <div className="text-left mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Personal Information</h3>
              <p className="text-xs text-slate-400 mt-1">View your current system operational directory identity properties.</p>
            </div>
            <div className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Name</label>
                  <input type="text" readOnly value={user?.name || 'Guest User'} className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Phone Number</label>
                  <input type="text" readOnly value="N/A" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 italic font-medium focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Email Address</label>
                <input type="text" readOnly value={user?.email || 'guest@somaconnect.com'} className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">User Type</label>
                <input type="text" readOnly value="Admin" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Assigned Security Roles</label>
                <div className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-extrabold bg-blue-50 text-[#0062ff] border border-blue-100 tracking-wider">
                    {user?.roles?.[0] || 'SUPER_ADMIN'}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-end">
              <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-200 shadow-sm">Close View</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CHANGE PASSWORD MODAL PANEL                            */}
      {/* ========================================================= */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-[520px] overflow-hidden border border-slate-100 p-7 relative">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute top-5 right-6 text-slate-400 hover:text-slate-600 text-2xl focus:outline-none">&times;</button>
            <div className="text-left mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Change Password</h3>
              <p className="text-xs text-slate-400 mt-1">Modify authentication rules credentials container key tokens.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); }} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Current Password</label>
                <div className="relative">
                  <input type={showCurrentPass ? 'text' : 'password'} placeholder="••••••••••••" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-300 font-semibold" />
                  <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">New Password</label>
                <div className="relative">
                  <input type={showNewPass ? 'text' : 'password'} placeholder="••••••••••••" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-300 font-semibold" />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirmPass ? 'text' : 'password'} placeholder="••••••••••••" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-300 font-semibold" />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm">Cancel</button>
                <button type="submit" className="px-5 py-3 bg-[#1d4ed8] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md">Update Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};