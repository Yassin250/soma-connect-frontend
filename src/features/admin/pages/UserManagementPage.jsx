import React, { useState } from 'react';
import { AdminLayout } from '../layouts/AdminLayout';
import { AddUserModal } from '../components/AddUserModal';
import { adminService } from '../../../services/api';

export const UserManagementPage = () => {
  const [currentView, setCurrentView] = useState('users'); // 'users' | 'roles' | 'permissions'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');

  const loadUsers = React.useCallback(async () => {
    setIsLoadingUsers(true);
    setUsersError('');
    try {
      const response = await adminService.getUsers();
      setUsers(Array.isArray(response) ? response : []);
    } catch (error) {
      setUsersError(error?.message || 'Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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
            <div className="flex items-center gap-2">
              <button
                onClick={loadUsers}
                className="bg-white text-gray-700 text-xs font-medium px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#1064ff] text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
              >
                + Add New User
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            {isLoadingUsers && <p className="text-xs text-gray-500">Loading users...</p>}

            {!isLoadingUsers && usersError && (
              <p className="text-xs text-red-500">{usersError}</p>
            )}

            {!isLoadingUsers && !usersError && users.length === 0 && (
              <p className="text-xs text-gray-500">No users found.</p>
            )}

            {!isLoadingUsers && !usersError && users.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Name</th>
                      <th className="py-2 pr-3 font-semibold">Username</th>
                      <th className="py-2 pr-3 font-semibold">Email</th>
                      <th className="py-2 pr-3 font-semibold">Active</th>
                      <th className="py-2 pr-3 font-semibold">Enabled</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100">
                        <td className="py-2 pr-3">{user.name || '-'}</td>
                        <td className="py-2 pr-3">{user.username || '-'}</td>
                        <td className="py-2 pr-3">{user.email || '-'}</td>
                        <td className="py-2 pr-3">{user.active ? 'Yes' : 'No'}</td>
                        <td className="py-2 pr-3">{user.enabled ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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