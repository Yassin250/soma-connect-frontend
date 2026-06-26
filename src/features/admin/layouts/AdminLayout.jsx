import React, { useState } from 'react';
import logo from '../../../assets/2.png';         
import miniLogo from '../../../assets/1.png';      



export const AdminLayout = ({ children, currentSubPage, onSubPageChange, onLogout }) => {

  // Layout navigation drawer control states
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(true);
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

  // Structural tracking variables for complex dashboard flows
  const activeNavigationClass = "bg-white text-[#1d4ed8] shadow-md font-bold scale-[1.02] border-r-4 border-amber-400";
  const inactiveNavigationClass = "text-white/80 hover:text-white hover:bg-white/10 font-medium hover:translate-x-1";

  return (
    <div className="min-h-screen w-full bg-[#f4f7fe] text-gray-800 font-sans antialiased flex overflow-x-hidden p-0 sm:p-3 md:p-4 lg:p-5">
      
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar relative z-10">
          
          {/* Main User Control Drawer Hub Node */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsUserMenuExpanded(true);
                } else {
                  setIsUserMenuExpanded(!isUserMenuExpanded);
                }
              }}
              className={`w-full flex items-center py-3 text-sm font-bold rounded-2xl transition-all duration-200 ${
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? 'lg:justify-center h-12 lg:w-12 mx-auto px-0 justify-between px-4' 
                  : 'justify-between px-5'
              } ${
                isUserMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'bg-white/15 text-white shadow-inner border border-white/5' 
                  : isSidebarCollapsed && currentSubPage ? 'lg:bg-white lg:text-[#1d4ed8] lg:shadow-md text-white/80' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className={`flex items-center ${isSidebarCollapsed && !isMobileSidebarOpen ? 'lg:justify-center lg:w-full' : 'space-x-4'}`}>
                <div className={`p-1.5 rounded-xl transition-colors ${isUserMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen) ? 'bg-white/10' : ''}`}>
                  <svg className="w-5 h-5 fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  </svg>
                </div>
                {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="tracking-wide text-[14px]">User Management</span>}
              </div>
              
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <svg 
                  className={`w-4 h-4 transform transition-transform duration-200 text-white/60 ${isUserMenuExpanded ? 'rotate-180' : 'rotate-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {/* Nested Subcategory Navigation Track */}
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden relative space-y-1.5 ${
                isUserMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'max-h-72 opacity-100 mt-3 pb-2 ml-2 pl-3 border-l border-white/20' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              
              {/* Route Button: Users */}
              <button
                type="button"
                onClick={() => { onSubPageChange('users'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  currentSubPage === 'users' ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${currentSubPage === 'users' ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <span>Users</span>
              </button>

              {/* Route Button: Roles */}
              <button
                type="button"
                onClick={() => { onSubPageChange('roles'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  currentSubPage === 'roles' ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${currentSubPage === 'roles' ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <span>Roles</span>
              </button>

              {/* Route Button: Permissions */}
              <button
                type="button"
                onClick={() => { onSubPageChange('permissions'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all text-left tracking-wide uppercase ${
                  currentSubPage === 'permissions' ? activeNavigationClass : inactiveNavigationClass
                }`}
              >
                <div className={`p-1 rounded-lg ${currentSubPage === 'permissions' ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/10 text-white'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <circle cx="12" cy="11" r="2.5" />
                    <path d="M12 13.5v3" />
                  </svg>
                </div>
                <span>Permissions</span>
              </button>

            </div>
          </div>
        </nav>

        {/* System Storage Context Box */}
        {(!isSidebarCollapsed || isMobileSidebarOpen) && (
          <div className="p-4 mx-4 mb-6 bg-white/5 border border-white/10 text-left relative z-10 backdrop-blur-md rounded-2xl shadow-inner animate-fade-in">
            <div className="flex items-center space-x-2 text-white/90 font-bold text-xs mb-1">
              <svg className="w-4 h-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>Security Integrity System</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full w-[85%] rounded-full" />
            </div>
            <span className="text-[10px] text-white/60 block mt-1.5 font-medium">Environment Context: RWANDA</span>
          </div>
        )}
      </aside>

      {/* RIGHT SIDE DATA VIEWPORT WRAPPER */}
      <div className="flex-1 flex flex-col min-h-screen w-full lg:px-4">
        
        {/* TOP NAVBAR HEADER BOX */}
        <header className="w-full bg-transparent h-20 flex items-center justify-between px-4 sm:px-6 mb-4 select-none">
          
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
                {currentSubPage ? currentSubPage : "Dashboard View"}
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
                placeholder="Search global operations..." 
                className="bg-transparent text-xs text-slate-700 outline-none w-full font-medium placeholder-slate-400"
                readOnly
              />
            </div>

            <div className="relative">
              <div 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group p-1.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 shadow-sm transition-all duration-150"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1d4ed8] to-[#1e40af] flex items-center justify-center text-xs font-black text-white shadow-md transition-transform duration-150 group-hover:scale-105">
                  GU
                </div>
                <span className="hidden sm:inline text-sm font-bold text-slate-700 tracking-tight transition-colors group-hover:text-[#1d4ed8]">
                  Guest User
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
                        GU
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-sm font-black text-slate-800 leading-tight">Guest User</span>
                        <span className="text-xs text-slate-400 font-semibold truncate max-w-[160px] mt-0.5">guest@somaconnect.com</span>
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
                      onClick={onLogout} 
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
        <main className="flex-1 bg-white rounded-[32px] border border-slate-200/60 p-5 sm:p-6 lg:p-8 shadow-sm min-h-[calc(100vh-140px)] transition-all duration-300">
          {children}
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
                  <input type="text" readOnly value="Guest User" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Phone Number</label>
                  <input type="text" readOnly value="N/A" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 italic font-medium focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Email Address</label>
                <input type="text" readOnly value="guest@somaconnect.com" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">User Type</label>
                <input type="text" readOnly value="Admin" className="w-full text-xs px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Assigned Security Roles</label>
                <div className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-extrabold bg-blue-50 text-[#0062ff] border border-blue-100 tracking-wider">SUPER_ADMIN</span>
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