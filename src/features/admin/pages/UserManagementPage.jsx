import React, { useState } from 'react';
import { AdminLayout } from '../layouts/AdminLayout';
import { AddUserModal } from '../components/AddUserModal';

export const UserManagementPage = () => {
  const [currentView, setCurrentView] = useState('users'); // 'users' | 'roles' | 'permissions'
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AdminLayout currentSubPage={currentView} onSubPageChange={setCurrentView}>
      
      {/* CONDITIONAL SUB-VIEW: USERS MANAGEMENT PAGE */}
      {currentView === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users Directory</h1>
              <p className="text-xs text-gray-500">Review system workspace profile registrations.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1064ff] text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              + Add New User
            </button>
          </div>
          
          {/* Main User Grid Table Code Goes Directly Here */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-xs text-gray-400">
            [Insert Structured User Directory Grid Data Here]
          </div>
        </div>
      )}

      {/* CONDITIONAL SUB-VIEW: ROLES ASSIGNMENT PAGE */}
      {currentView === 'roles' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Roles Configuration</h1>
            <p className="text-xs text-gray-500">Map system access identities directly to clearance permissions.</p>
          </div>
          
          {/* Main Roles Configuration Selectors Form Code Goes Here */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-xs text-gray-400">
            [Insert Access Tiers & Roles Configuration Matrix Here]
          </div>
        </div>
      )}

      {/* CONDITIONAL SUB-VIEW: PERMISSIONS INHERITANCE MAP */}
      {currentView === 'permissions' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Permissions Matrix</h1>
            <p className="text-xs text-gray-500">Immutable automated validation operational paths tracking map.</p>
          </div>
          
          {/* Main Permissions Shield Matrix Content Goes Here */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-xs text-gray-400">
            [Insert Automated Policy Rules Context Matrix Here]
          </div>
        </div>
      )}

      {/* Shared Portal Account Creation Overlay Layout */}
      <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddUser={(u) => console.log(u)} />
      
    </AdminLayout>
  );
};