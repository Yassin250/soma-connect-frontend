import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { AddUserModal } from '../components/AddUserModal';
import { AddRoleModal } from '../components/AddRoleModal';
import { useAuth } from '../../../context/AuthContext';

/**
 * FloatingMenu Component
 * Handles the contextual dropdown menu for table actions.
 */
const FloatingMenu = ({ coords, onClose, children }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      style={{ top: coords.top, left: coords.left }}
      className="absolute w-44 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] py-1.5"
    >
      {children}
    </div>,
    document.body
  );
};

/**
 * UserManagementPage Component
 * Main entry point for managing system users, roles, and permissions.
 * Includes full CRUD operations and filter/search capabilities.
 */
export const UserManagementPage = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  // --- UI STATES ---
  const [currentView, setCurrentView] = useState('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [dropdownConfig, setDropdownConfig] = useState({
    visible: false,
    type: null,
    id: null,
    coords: { top: 0, left: 0 },
  });

  // --- FILTER STATES (Users) ---
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterLock, setFilterLock] = useState('All');
  const [filterDate, setFilterDate] = useState('');

  // --- FILTER STATES (Roles) ---
  const [filterRoleStatus, setFilterRoleStatus] = useState('All');
  const [filterRoleDate, setFilterRoleDate] = useState('');

  // --- DATA STATES ---
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // --- LOADING & ERROR STATES ---
  const [isLoading, setIsLoading] = useState({
    users: false,
    roles: false,
    permissions: false,
  });
  const [error, setError] = useState({
    users: null,
    roles: null,
    permissions: null,
  });

  // --- API CONFIG ---
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  /**
   * Generates Authorization headers for API calls.
   */
  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  // ==========================================
  // MEMOIZED FILTERING
  // ==========================================

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole =
        filterRole === 'All' ||
        (Array.isArray(u.roles)
          ? u.roles.some((r) => (r?.name || r) === filterRole)
          : u.roles === filterRole);
      const matchStatus = filterStatus === 'All' || u.status === filterStatus;
      const matchLock = filterLock === 'All' || u.lockStatus === filterLock;
      const matchDate = !filterDate || u.createdAt?.startsWith(filterDate);
      return matchRole && matchStatus && matchLock && matchDate;
    });
  }, [users, filterRole, filterStatus, filterLock, filterDate]);

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const matchStatus = filterRoleStatus === 'All' || r.status === filterRoleStatus;
      const matchDate = !filterRoleDate || r.createdAt?.startsWith(filterRoleDate);
      return matchStatus && matchDate;
    });
  }, [roles, filterRoleStatus, filterRoleDate]);

  const resetUserFilters = () => {
    setFilterRole('All');
    setFilterStatus('All');
    setFilterLock('All');
    setFilterDate('');
  };

  const resetRoleFilters = () => {
    setFilterRoleStatus('All');
    setFilterRoleDate('');
  };

  // ==========================================
  // DATA FETCHING LOGIC
  // ==========================================

  const fetchUsers = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, users: true }));
    setError((prev) => ({ ...prev, users: null }));
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch users: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError((prev) => ({ ...prev, users: err.message }));
      setUsers([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, users: false }));
    }
  }, [getHeaders]);

  const fetchRoles = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, roles: true }));
    setError((prev) => ({ ...prev, roles: null }));
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch roles: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setRoles(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError((prev) => ({ ...prev, roles: err.message }));
      setRoles([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, roles: false }));
    }
  }, [getHeaders]);

  const fetchPermissions = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, permissions: true }));
    setError((prev) => ({ ...prev, permissions: null }));
    try {
      const response = await fetch(`${API_BASE_URL}/permissions`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch permissions: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setPermissions(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError((prev) => ({ ...prev, permissions: err.message }));
      setPermissions([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, permissions: false }));
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, [fetchUsers, fetchRoles, fetchPermissions]);

  // ==========================================
  // CREATE / UPDATE OPERATIONS
  // ==========================================

  const handleAddOrUpdateUser = async (userData) => {
    try {
      if (editingEntity) {
        const updateData = {
          ...userData,
          ...(userData.password ? { password: userData.password } : {}),
        };
        const response = await fetch(`${API_BASE_URL}/users/${editingEntity.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(updateData),
        });
        if (!response.ok) throw new Error('Failed to update user');
        await fetchUsers();
      } else {
        const payload = {
          ...userData,
          username: userData.name.toLowerCase().replace(/\s+/g, ''),
          userType: 'Internal',
          status: userData.status || 'Active',
          lockStatus: 'Unlocked',
        };
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to create user');
        await fetchUsers();
      }
      setIsModalOpen(false);
      setEditingEntity(null);
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Failed to save user. Check console for details.');
    }
  };

  const handleAddOrUpdateRole = async (roleData) => {
    try {
      if (editingEntity) {
        const response = await fetch(`${API_BASE_URL}/roles/${editingEntity.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(roleData),
        });
        if (!response.ok) throw new Error('Failed to update role');
        await fetchRoles();
      } else {
        const payload = {
          ...roleData,
          permissions: 'CUSTOM_' + roleData.name.replace(/\s+/g, '_').toUpperCase(),
          status: 'Active',
        };
        const response = await fetch(`${API_BASE_URL}/roles`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to create role');
        await fetchRoles();
      }
      setIsRoleModalOpen(false);
      setEditingEntity(null);
    } catch (err) {
      console.error('Error saving role:', err);
      alert('Failed to save role. Check console for details.');
    }
  };

  // ==========================================
  // QUICK ACTIONS
  // ==========================================

  const toggleUserStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update user status');
      await fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
    closeDropdown();
  };

  const toggleRoleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update role status');
      await fetchRoles();
    } catch (err) {
      console.error('Error toggling role status:', err);
    }
    closeDropdown();
  };

  const unlockUser = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/unlock`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to unlock user');
      await fetchUsers();
    } catch (err) {
      console.error('Error unlocking user:', err);
    }
    closeDropdown();
  };

  const deleteEntity = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      closeDropdown();
      return;
    }
    try {
      const endpoint = type === 'user' ? `/users/${id}` : `/roles/${id}`;
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`Failed to delete ${type}`);
      if (type === 'user') await fetchUsers();
      if (type === 'role') await fetchRoles();
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      alert(`Failed to delete ${type}. It might be tied to existing records.`);
    }
    closeDropdown();
  };

  // ==========================================
  // UI HANDLERS
  // ==========================================

  const handleActionClick = (e, type, id) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownConfig({
      visible: true,
      type,
      id,
      coords: {
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      },
    });
  };

  const closeDropdown = () =>
    setDropdownConfig({
      visible: false,
      type: null,
      id: null,
      coords: { top: 0, left: 0 },
    });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // --- UI RENDER HELPERS ---

  const renderLoadingOrError = (type) => {
    if (isLoading[type]) {
      return (
        <div className="p-8 text-center text-sm text-gray-500">
          Loading {type} data from server...
        </div>
      );
    }
    if (error[type]) {
      return (
        <div className="p-8 text-center text-sm text-red-500 bg-red-50 rounded-b-xl">
          Error loading data: {error[type]}
        </div>
      );
    }
    return null;
  };

  const getStatusBadgeClasses = (status) =>
    status === 'Active'
      ? 'bg-green-50 text-green-700'
      : 'bg-rose-50 text-rose-700';

  const getStatusDotClasses = (status) =>
    status === 'Active' ? 'bg-green-500' : 'bg-rose-500';

  // ==========================================
  // MAIN RETURN
  // ==========================================

  return (
    <AdminLayout
      currentSubPage={currentView}
      onSubPageChange={setCurrentView}
      onLogout={handleLogout}
    >
      {/* -------------------- USERS VIEW -------------------- */}
      {currentView === 'users' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">
                Users
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage system users</p>
            </div>
            <button
              onClick={() => {
                setEditingEntity(null);
                setIsModalOpen(true);
              }}
              className="bg-[#1064ff] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-600 flex items-center space-x-1.5"
            >
              <span>+ New User</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Role
              </label>
              <select
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option>All</option>
                {roles.map((r) => (
                  <option key={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Account Status
              </label>
              <select
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Lock Status
              </label>
              <select
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={filterLock}
                onChange={(e) => setFilterLock(e.target.value)}
              >
                <option>All</option>
                <option>Unlocked</option>
                <option>Locked</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Date Joined
              </label>
              <input
                type="date"
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <button
              onClick={resetUserFilters}
              className="h-[42px] px-4 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafafa] border-b border-gray-200 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                    <th className="p-3.5 pl-5 w-20">Actions</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Username</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Roles</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 pl-5">
                        <button
                          onClick={(e) => handleActionClick(e, 'user', user.id)}
                          className="text-gray-400 hover:text-blue-600 p-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="p-3.5 font-semibold text-gray-900">
                        {user.name}
                      </td>
                      <td className="p-3.5 text-gray-500">{user.username}</td>
                      <td className="p-3.5 text-gray-500">{user.email}</td>
                      <td className="p-3.5 text-blue-600">
                        {Array.isArray(user.roles) && user.roles.length > 0
                          ? user.roles.map((r) => r?.name || r).join(', ')
                          : user.roles || 'None'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadgeClasses(user.status)}`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full mr-1.5 ${getStatusDotClasses(user.status)}`}
                          />
                          {user.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-gray-400 font-normal">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderLoadingOrError('users')}
              {!isLoading.users && !error.users && filteredUsers.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">
                  {users.length === 0
                    ? 'No users found.'
                    : 'No users match the current filters.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- ROLES VIEW -------------------- */}
      {currentView === 'roles' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">
                Roles
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage system roles</p>
            </div>
            <button
              onClick={() => {
                setEditingEntity(null);
                setIsRoleModalOpen(true);
              }}
              className="bg-[#1064ff] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-600"
            >
              + New Role
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Status
              </label>
              <select
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={filterRoleStatus}
                onChange={(e) => setFilterRoleStatus(e.target.value)}
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Date Created
              </label>
              <input
                type="date"
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={filterRoleDate}
                onChange={(e) => setFilterRoleDate(e.target.value)}
              />
            </div>

            <button
              onClick={resetRoleFilters}
              className="h-[42px] px-4 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors col-start-1 md:col-start-auto"
            >
              Reset Filters
            </button>
          </div>

          {/* Roles Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafafa] border-b border-gray-200 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                    <th className="p-3.5 pl-5 w-20">Actions</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {filteredRoles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 pl-5">
                        <button
                          onClick={(e) => handleActionClick(e, 'role', role.id)}
                          className="text-gray-400 hover:text-blue-600 p-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="p-3.5 font-semibold text-gray-900">
                        {role.name}
                      </td>
                      <td className="p-3.5 text-gray-500 max-w-xs truncate">
                        {role.description}
                      </td>
                      <td className="p-3.5 text-gray-500">{role.type}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadgeClasses(role.status)}`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full mr-1.5 ${getStatusDotClasses(role.status)}`}
                          />
                          {role.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-gray-400 font-normal">
                        {role.createdAt
                          ? new Date(role.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderLoadingOrError('roles')}
              {!isLoading.roles && !error.roles && filteredRoles.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">
                  {roles.length === 0
                    ? 'No roles found.'
                    : 'No roles match the current filters.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- PERMISSIONS VIEW -------------------- */}
      {currentView === 'permissions' && (
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">
              Permissions
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage system Permissions
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafafa] border-b border-gray-200 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Name</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 pr-5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {permissions.map((perm) => (
                    <tr key={perm.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 pl-5 font-mono text-[11px] text-blue-600 font-bold">
                        {perm.name}
                      </td>
                      <td className="p-3.5 text-gray-500 max-w-sm">
                        {perm.description}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">
                          {perm.category}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-gray-400 font-normal">
                        {perm.createdAt
                          ? new Date(perm.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderLoadingOrError('permissions')}
              {!isLoading.permissions &&
                !error.permissions &&
                permissions.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500">
                    No permissions found.
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- FLOATING ACTIONS MENU -------------------- */}
      {dropdownConfig.visible && (
        <FloatingMenu coords={dropdownConfig.coords} onClose={closeDropdown}>
          <button
            onClick={() => {
              if (dropdownConfig.type === 'user') {
                const match = users.find((u) => u.id === dropdownConfig.id);
                setEditingEntity(match);
                setIsModalOpen(true);
              } else {
                const match = roles.find((r) => r.id === dropdownConfig.id);
                setEditingEntity(match);
                setIsRoleModalOpen(true);
              }
              closeDropdown();
            }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
          >
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              if (dropdownConfig.type === 'user') {
                const user = users.find((u) => u.id === dropdownConfig.id);
                if (user) toggleUserStatus(user.id, user.status);
              } else {
                const role = roles.find((r) => r.id === dropdownConfig.id);
                if (role) toggleRoleStatus(role.id, role.status);
              }
            }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
          >
            <span>Toggle Status</span>
          </button>
          {dropdownConfig.type === 'user' && (
            <>
              <button
                onClick={() => {
                  const user = users.find((u) => u.id === dropdownConfig.id);
                  if (user) unlockUser(user.id);
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
              >
                <span>Unlock User</span>
              </button>
              <button
                onClick={() => {
                  const user = users.find((u) => u.id === dropdownConfig.id);
                  if (user) deleteEntity('user', user.id);
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-2"
              >
                <span>Delete User</span>
              </button>
            </>
          )}
          {dropdownConfig.type === 'role' && (
            <button
              onClick={() => {
                const role = roles.find((r) => r.id === dropdownConfig.id);
                if (role) deleteEntity('role', role.id);
              }}
              className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-2"
            >
              <span>Delete Role</span>
            </button>
          )}
        </FloatingMenu>
      )}

      {/* --- MODALS --- */}
      {isModalOpen && (
        <AddUserModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEntity(null);
          }}
          onSubmit={handleAddOrUpdateUser}
          editingUser={editingEntity}
        />
      )}
      {isRoleModalOpen && (
        <AddRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false);
            setEditingEntity(null);
          }}
          onSubmit={handleAddOrUpdateRole}
          editingRole={editingEntity}
        />
      )}
    </AdminLayout>
  );
};