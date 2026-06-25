import React from 'react';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-black text-blue-500 tracking-wider">SomaConnect</span>
              {user && user.schoolId && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-zinc-800 text-zinc-300 rounded border border-zinc-700 uppercase">
                  {user.schoolId}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-white">{user?.name}</p>
                <p className="text-[10px] text-zinc-400 font-mono uppercase">{user?.role}</p>
              </div>
              <button 
                onClick={logout}
                className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};