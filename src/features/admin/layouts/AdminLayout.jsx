import React, { useState } from 'react';
import logo from '../../../assets/2.png'; // Reverted to asset 2 per your configuration layout

// Added onLogout directly into the accepted object arguments mapping block
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

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-gray-800 font-sans antialiased flex overflow-x-hidden">
      
      {/* MOBILE BREAKPOINT DRAWER OVERLAY BACKDROP */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION DRAWER */}
      <aside 
        className={`bg-[#112541] text-white flex flex-col fixed inset-y-0 left-0 z-40 lg:z-30 shadow-xl border-r border-slate-800 select-none transition-transform duration-300 ease-in-out lg:transition-all ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72`}
      >
        
        {/* Brand Header Identity Frame */}
        <div className={`h-16 flex items-center justify-between lg:justify-start border-b border-slate-800 px-6 ${isSidebarCollapsed ? 'lg:justify-center lg:px-0' : 'lg:space-x-3'}`}>
          <div className="flex items-center space-x-3 lg:space-x-0 lg:mx-auto lg:flex-row">
            
            {/* LOGO REPLACEMENT APPLIED HERE */}
            {(!isSidebarCollapsed || isMobileSidebarOpen) && (
              <div className="lg:animate-fade-in ml-3 flex-shrink-0 flex items-center">
                <img 
                  src={logo} 
                  alt="SomaConnect Logo" 
                  className="h-10 w-auto object-contain" 
                />
              </div>
            )}
          </div>
          

          {/* Close mobile nav drawer handle explicitly */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800/40"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Link Element Hierarchy */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto no-scrollbar">
          
          {/* Main User Control Drawer Hub Node */}
          <div>
            <button
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsUserMenuExpanded(true);
                } else {
                  setIsUserMenuExpanded(!isUserMenuExpanded);
                }
              }}
              className={`w-full flex items-center py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isSidebarCollapsed 
                  ? 'lg:justify-center h-12 lg:w-12 mx-auto px-0 justify-between px-4' 
                  : 'justify-between px-4'
              } ${
                isUserMenuExpanded && !isSidebarCollapsed
                  ? 'bg-[#1064ff] text-white shadow-md' 
                  : isSidebarCollapsed && currentSubPage ? 'lg:bg-[#1064ff] lg:text-white lg:shadow-md text-slate-300 hover:bg-slate-800/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'lg:justify-center lg:w-full' : 'space-x-3'}`}>
                <svg className="w-5 h-5 fill-none stroke-current flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                </svg>
                {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="tracking-wide whitespace-nowrap">User Management</span>}
              </div>
              
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <svg 
                  className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isUserMenuExpanded ? 'rotate-0' : 'rotate-180'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              )}
            </button>

            {/* Nested Subcategory Navigation Track */}
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden relative space-y-1.5 ${
                isUserMenuExpanded && (!isSidebarCollapsed || isMobileSidebarOpen)
                  ? 'max-h-56 opacity-100 mt-2.5 pb-1 ml-4 pl-4 border-l-2 border-slate-800/60' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              
              {/* Route Button: Users */}
              <button
                onClick={() => { onSubPageChange('users'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all text-left group ${
                  currentSubPage === 'users' 
                    ? 'bg-gradient-to-r from-[#1064ff]/25 via-[#1064ff]/10 to-transparent text-white border-l-2 border-[#1064ff] shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <svg className={`w-4 h-4 fill-none stroke-current transition-colors ${currentSubPage === 'users' ? 'text-[#1064ff]' : 'text-slate-400 group-hover:text-slate-200'}`} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                <span>Users</span>
              </button>

              {/* Route Button: Roles */}
              <button
                onClick={() => { onSubPageChange('roles'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all text-left group ${
                  currentSubPage === 'roles' 
                    ? 'bg-gradient-to-r from-[#1064ff]/25 via-[#1064ff]/10 to-transparent text-white border-l-2 border-[#1064ff] shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <svg className={`w-4 h-4 fill-none stroke-current transition-colors ${currentSubPage === 'roles' ? 'text-[#1064ff]' : 'text-slate-400 group-hover:text-slate-200'}`} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-1a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v1" />
                  <circle cx="11" cy="7" r="4" />
                </svg>
                <span>Roles</span>
              </button>

              {/* Route Button: Permissions */}
              <button
                onClick={() => { onSubPageChange('permissions'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all text-left group ${
                  currentSubPage === 'permissions' 
                    ? 'bg-gradient-to-r from-[#1064ff]/25 via-[#1064ff]/10 to-transparent text-white border-l-2 border-[#1064ff] shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <svg className={`w-4 h-4 fill-none stroke-current transition-colors ${currentSubPage === 'permissions' ? 'text-[#1064ff]' : 'text-slate-400 group-hover:text-slate-200'}`} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <circle cx="12" cy="11" r="2.5" />
                  <path d="M12 13.5v3" />
                </svg>
                <span>Permissions</span>
              </button>

            </div>
          </div>
        </nav>
      </aside>

      {/* RIGHT SIDE DATA VIEWPORT WRAPPER */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        } pl-0`}
      >
        
        {/* TOP NAVBAR HEADER BOX */}
        <header className="w-full bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 select-none">
          
          {/* Collapse Controller & Localized System Title Context */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Desktop-only toggle slider controls */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:block text-slate-600 hover:text-slate-900 transition-colors focus:outline-none p-1 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.25">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Smartphone view mobile absolute drawer action handle */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 transition-colors focus:outline-none p-1.5 rounded-xl hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.25">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex flex-col text-left leading-tight">
              <span className="text-[14px] sm:text-[15px] font-bold text-[#112541] tracking-wide uppercase">RWANDA</span>
              <span className="text-[10px] sm:text-[11px] text-[#1064ff] font-bold tracking-tight">SomaConnect</span>
            </div>
          </div>

          {/* User Anchor Dropdown Interface Hub */}
          <div className="flex items-center">
            
            {/* Clickable Profile Anchor Row */}
            <div className="relative">
              <div 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1064ff] flex items-center justify-center text-xs font-bold text-white shadow-sm transition-transform duration-150 group-hover:scale-105">
                  GU
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-slate-700 tracking-tight transition-colors group-hover:text-[#1064ff]">
                  Guest User
                </span>
                <svg 
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180 text-[#1064ff]' : ''}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* FLOATING ACTION POPOVER CARD */}
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 transform origin-top-right transition-all duration-200 animate-fade-in mx-2 sm:mx-0">
                    <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45 hidden sm:block" />

                    <div className="px-4 py-3 flex items-center space-x-3 border-b border-slate-100/80 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#112541] flex items-center justify-center text-sm font-bold text-white">
                        GU
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-slate-800 leading-tight">Guest User</span>
                        <span className="text-xs text-slate-400 font-medium truncate max-w-[150px]">guest@somaconnect.com</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => { setActiveModal('profile'); setIsProfileMenuOpen(false); }}
                      className="w-full px-4 py-2.5 flex items-center space-x-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left font-medium text-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#1064ff]">
                        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <span>My Profile</span>
                    </button>

                    <button 
                      onClick={() => { setActiveModal('password'); setIsProfileMenuOpen(false); }}
                      className="w-full px-4 py-2.5 flex items-center space-x-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left font-medium text-sm border-b border-slate-100/80 pb-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#1064ff]">
                        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <span>Change Password</span>
                    </button>

                    <button 
                      onClick={onLogout} 
                      className="w-full px-4 mt-2 py-2.5 flex items-center space-x-3 text-red-600 hover:bg-red-50/60 transition-colors text-left font-semibold text-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                      </div>
                      <span>Logout</span>
                    </button>

                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Dynamic Inner Workspace Context Router Portal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* ========================================================= */}
      {/* 1. PERSONAL INFORMATION MODAL PANEL                       */}
      {/* ========================================================= */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[480px] overflow-hidden border border-slate-100 p-6 relative">
            
            {/* Upper Right Dismiss Cross Marker */}
            <button 
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors text-lg"
            >
              &times;
            </button>

            {/* Header Identity Block */}
            <div className="text-left mb-6">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Personal Information</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">View your current system operational directory identity properties.</p>
            </div>

            {/* Layout Attribute Grid */}
            <div className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value="Guest User" 
                    className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-slate-50 text-gray-500 font-medium focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Phone Number</label>
                  <input 
                    type="text" 
                    readOnly 
                    value="N/A" 
                    className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-slate-50 text-gray-400 italic font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Email Address</label>
                <input 
                  type="text" 
                  readOnly 
                  value="guest@somaconnect.com" 
                  className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-slate-50 text-gray-500 font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">User Type</label>
                <input 
                  type="text" 
                  readOnly 
                  value="Admin" 
                  className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-slate-50 text-gray-500 font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Assigned Security Roles</label>
                <div className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-slate-50 flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0062ff] border border-blue-100">
                    SUPER_ADMIN
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Segment */}
            <div className="border-t border-gray-100 pt-4 mt-6 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-[#f8fafc] hover:bg-slate-100 text-gray-700 font-bold text-xs rounded-xl transition-colors border border-gray-200 shadow-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CHANGE PASSWORD MODAL PANEL                            */}
      {/* ========================================================= */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[480px] overflow-hidden border border-slate-100 p-6 relative">
            
            {/* Upper Right Dismiss Cross Marker */}
            <button 
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors text-lg"
            >
              &times;
            </button>

            {/* Header Identity Block */}
            <div className="text-left mb-6">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Change Password</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Modify authentication rules credentials container key tokens.</p>
            </div>

            {/* Submission Configuration Area */}
            <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); }} className="space-y-5 text-left">
              
              {/* Current Pass Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrentPass ? 'text' : 'password'} 
                    placeholder="••••••••••••"
                    className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-300 font-medium"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* New Pass Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPass ? 'text' : 'password'} 
                    placeholder="••••••••••••"
                    className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-300 font-medium"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Confirm New Pass Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPass ? 'text' : 'password'} 
                    placeholder="••••••••••••"
                    className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-300 font-medium"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Actions Segment */}
              <div className="border-t border-gray-100 pt-4 mt-6 flex items-center justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 bg-[#f8fafc] hover:bg-slate-100 text-gray-700 font-bold text-xs rounded-xl transition-colors border border-gray-200 shadow-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-[#0062ff] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Update Credentials
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};