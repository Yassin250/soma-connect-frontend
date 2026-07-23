import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LearningLayout = () => {
  const { user, logout } = useAuth();

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
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-gray-900">{user?.name}</p>
                <p className="text-[10px] text-gray-500 font-mono uppercase">{user?.roles?.[0] || 'user'}</p>
              </div>
              <button 
                onClick={logout}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};