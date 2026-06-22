import React, { useState } from 'react';

export const AdminLayout = ({ children, currentSubPage, onSubPageChange }) => {
  // Expansion state for the User Management navigation block
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(true);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-gray-800 font-sans antialiased flex">
      
      {/* LEFT SIDEBAR NAVIGATION DRAWER */}
      <aside className="w-72 bg-[#112541] text-white flex flex-col fixed inset-y-0 left-0 z-30 shadow-xl border-r border-slate-800 select-none">
        
        {/* Brand Header */}
        <div className="h-16 flex items-center space-x-3 px-6 border-b border-slate-800">
          <svg className="w-5 h-7 text-[#1064ff] fill-current" viewBox="0 0 24 24">
            <path d="M4 2h3v12a5 5 0 0 0 10 0V2h3v12a8 8 0 0 1-16 0V2z" />
          </svg>
          <span className="text-lg font-bold tracking-tight text-white">SomaConnect</span>
        </div>

        {/* Navigation Item Tree */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto no-scrollbar">
          
          {/* Collapsible Category Parent */}
          <div>
            <button
              onClick={() => setIsUserMenuExpanded(!isUserMenuExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isUserMenuExpanded 
                  ? 'bg-[#1064ff] text-white shadow-md' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* User Management Parent Icon */}
                <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                </svg>
                <span className="tracking-wide">User Management</span>
              </div>
              
              {/* Expand Chevron */}
              <svg 
                className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isUserMenuExpanded ? 'rotate-0' : 'rotate-180'}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>

            {/* Nested Child Access Route Nodes - With Smooth CSS Dropdown Animation */}
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden relative ml-4 pl-4 border-l-2 border-slate-800/60 space-y-1.5 ${
                isUserMenuExpanded 
                  ? 'max-h-48 opacity-100 mt-2.5 pb-1' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              
              {/* Sub-item: Users */}
              <button
                onClick={() => onSubPageChange('users')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all text-left group ${
                  currentSubPage === 'users' 
                    ? 'bg-gradient-to-r from-[#1064ff]/25 via-[#1064ff]/10 to-transparent text-white border-l-2 border-[#1064ff] shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <svg className={`w-4 h-4 fill-none stroke-current transition-colors ${currentSubPage === 'users' ? 'text-[#1064ff]' : 'text-slate-400 group-hover:text-slate-200'}`} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Users</span>
              </button>

              {/* Sub-item: Roles */}
              <button
                onClick={() => onSubPageChange('roles')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all text-left group ${
                  currentSubPage === 'roles' 
                    ? 'bg-gradient-to-r from-[#1064ff]/25 via-[#1064ff]/10 to-transparent text-white border-l-2 border-[#1064ff] shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <svg className={`w-4 h-4 fill-none stroke-current transition-colors ${currentSubPage === 'roles' ? 'text-[#1064ff]' : 'text-slate-400 group-hover:text-slate-200'}`} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-1a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v1" />
                  <circle cx="11" cy="7" r="4" />
                  <path d="M11 15H6a4 4 0 0 0-4 4v2h9" />
                  <rect x="15" y="11" width="6" height="5" rx="1" />
                  <path d="M18 11V9a2 2 0 1 0-4 0v2" />
                </svg>
                <span>Roles</span>
              </button>

              {/* Sub-item: Permissions */}
              <button
                onClick={() => onSubPageChange('permissions')}
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
      <div className="flex-1 pl-72 flex flex-col min-h-screen">
        
        {/* Top Navbar Header Box */}
        <header className="w-full bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20 select-none">
          <div className="text-xs text-gray-400 font-semibold tracking-wider uppercase">
            Directory Space / <span className="text-gray-700 font-bold capitalize">{currentSubPage}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900">Confiance U.</p>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide">System Administrator</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-[#1064ff] shadow-sm">
              CU
            </div>
          </div>
        </header>

        {/* Dynamic Inner Workspace Context */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

    </div>
  );
};