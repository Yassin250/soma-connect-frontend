import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { AddRoleModal } from '../components/AddRoleModal';
import { AddUserModal } from '../components/AddUserModal';
import { useAuth } from '../../../context/AuthContext';
import { adminService } from '../../../services/api';

const FloatingMenu = ({ coords, onClose, children }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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
      className="absolute w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-[9999] py-1 text-left"
    >
      {children}
    </div>,
    document.body
  );
};

const TableSpinner = ({ label }) => (
  <div className="p-10 flex flex-col items-center justify-center gap-3 text-gray-400">
    <svg className="w-6 h-6 animate-spin text-[#1064ff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <span className="text-xs font-medium">Loading {label}…</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const isActive = status === 'Active';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${isActive ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
      <span className={`w-1 h-1 rounded-full mr-1.5 ${isActive ? 'bg-green-500' : 'bg-rose-500'}`} />
      {status}
    </span>
  );
};

const PaginationBar = ({ currentPage, totalPages, onPageChange, from, to, total }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white text-xs text-gray-500">
      <span>
        Showing <span className="font-semibold text-gray-700">{from}–{to}</span> of{' '}
        <span className="font-semibold text-gray-700">{total}</span> results
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors">
          ‹ Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button key={page} onClick={() => onPageChange(page)} className={`w-8 h-8 rounded-lg font-semibold transition-colors ${page === currentPage ? 'bg-[#1064ff] text-white shadow-sm' : 'border border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
            {page}
          </button>
        ))}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors">
          Next ›
        </button>
      </div>
    </div>
  );
};

export const UserManagementPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [itemsPerPage, setItemsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  const [dropdownConfig, setDropdownConfig] = useState({
    visible: false,
    type: null,
    id: null,
    coords: { top: 0, left: 0 },
  });

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [isLoading, setIsLoading] = useState({ users: false, roles: false, permissions: false });
  const [error, setError] = useState({ users: null, roles: null, permissions: null });

  const fetchUsers = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, users: true }));
    setError((prev) => ({ ...prev, users: null }));
    try {
      const data = await adminService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((prev) => ({ ...prev, users: err.message }));
      setUsers([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, users: false }));
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, roles: true }));
    setError((prev) => ({ ...prev, roles: null }));
    try {
      const data = await adminService.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((prev) => ({ ...prev, roles: err.message }));
      setRoles([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, roles: false }));
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, permissions: true }));
    setError((prev) => ({ ...prev, permissions: null }));
    try {
      const data = await adminService.getPermissions();
      setPermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((prev) => ({ ...prev, permissions: err.message }));
      setPermissions([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, permissions: false }));
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, [fetchUsers, fetchRoles, fetchPermissions]);

  const handleAddOrUpdateUser = async (userData) => {
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, userData);
      } else {
        const payload = {
          ...userData,
          username: userData.name.toLowerCase().replace(/\s+/g, ''),
          userType: 'Internal',
          status: userData.status || 'Active',
          lockStatus: 'Unlocked',
        };
        await adminService.createUser(payload);
      }
      await fetchUsers();
      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Error saving user:', err);
      alert(err.message || 'Failed to save user.');
    }
  };

  const handleAddOrUpdateRole = async (roleData) => {
    try {
      if (editingRole) {
        await adminService.updateRole(editingRole.id, roleData);
      } else {
        const payload = {
          ...roleData,
          permissions: 'CUSTOM_' + roleData.name.replace(/\s+/g, '_').toUpperCase(),
          status: 'Active',
        };
        await adminService.createRole(payload);
      }
      await fetchRoles();
      setIsRoleModalOpen(false);
      setEditingRole(null);
    } catch (err) {
      console.error('Error saving role:', err);
      alert(err.message || 'Failed to save role.');
    }
  };

  const handleToggleUserStatus = async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await adminService.toggleUserStatus(id, newStatus);
      await fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
    closeDropdown();
  };

  const handleToggleRoleStatus = async (id) => {
    const role = roles.find(r => r.id === id);
    if (!role) return;
    const newStatus = role.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await adminService.toggleRoleStatus(id, newStatus);
      await fetchRoles();
    } catch (err) {
      console.error('Error toggling role status:', err);
    }
    closeDropdown();
  };

  const handleUnlockUser = async (id) => {
    try {
      await adminService.unlockUser(id);
      await fetchUsers();
    } catch (err) {
      console.error('Error unlocking user:', err);
    }
    closeDropdown();
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      closeDropdown();
      return;
    }
    try {
      await adminService.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user. It might be tied to existing records.');
    }
    closeDropdown();
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      closeDropdown();
      return;
    }
    try {
      await adminService.deleteRole(id);
      await fetchRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
      alert('Failed to delete role. It might be tied to existing records.');
    }
    closeDropdown();
  };

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

  const closeDropdown = () => setDropdownConfig({ visible: false, type: null, id: null, coords: { top: 0, left: 0 } });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuUser = dropdownConfig.type === 'user' ? users.find((u) => u.id === dropdownConfig.id) : null;
  const menuRole = dropdownConfig.type === 'role' ? roles.find((r) => r.id === dropdownConfig.id) : null;

  const renderTableState = (type) => {
    if (isLoading[type]) return <TableSpinner label={type} />;
    if (error[type]) {
      return (
        <div className="p-8 text-center text-xs text-red-500 bg-red-50">
          <p className="font-semibold mb-1">Failed to load {type} from server</p>
          <p className="text-red-400 font-normal">{error[type]}</p>
        </div>
      );
    }
    return null;
  };

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || user.name?.toLowerCase().includes(q) || user.username?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'ALL' || (Array.isArray(user.roles) && user.roles.some(r => (r?.name || r) === roleFilter));
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / parseInt(itemsPerPage, 10)) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * parseInt(itemsPerPage, 10), currentPage * parseInt(itemsPerPage, 10));

  const countUsersForRole = (role) => {
    const roleName = role.name;
    return users.filter((u) => Array.isArray(u.roles) && u.roles.some((r) => (r?.name || r) === roleName)).length;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <AdminLayout currentSubPage={currentView} onSubPageChange={setCurrentView} onLogout={handleLogout}>

      {currentView === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Users Directory</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {filteredUsers.length < users.length
                  ? <>Showing <span className="font-semibold text-[#1064ff]">{filteredUsers.length}</span> of {users.length} users</>
                  : <>{users.length} total users</>
                }
              </p>
            </div>
            <button
              onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
              className="bg-[#1064ff] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-600 flex items-center space-x-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>New User</span>
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px] sm:max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, username, or email…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-white border border-gray-300 rounded-lg text-xs pl-8 pr-3 py-2 w-full focus:outline-none focus:border-[#1064ff] focus:ring-1 focus:ring-[#1064ff]/20 transition-all"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-gray-300 rounded-lg text-xs px-2.5 py-2 focus:outline-none focus:border-[#1064ff] cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>{role.name}</option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-xs text-gray-400 whitespace-nowrap">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(e.target.value); setCurrentPage(1); }}
                className="bg-white border border-gray-300 rounded-lg text-xs px-2 py-2 focus:outline-none focus:border-[#1064ff] cursor-pointer"
              >
                {['10', '25', '50', '100'].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-xs text-gray-400">per page</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafafa] border-b border-gray-200 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                    <th className="p-3.5 pl-5 w-16">Actions</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Username</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Roles</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {!isLoading.users && paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pl-5">
                        <button
                          onClick={(e) => handleActionClick(e, 'user', user.id)}
                          className="text-gray-400 hover:text-[#1064ff] p-1 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                      </td>
                      <td className="p-3.5 font-semibold text-gray-900">{user.name}</td>
                      <td className="p-3.5 text-gray-500">{user.username || user.email?.split('@')[0]}</td>
                      <td className="p-3.5 text-gray-500">{user.email}</td>
                      <td className="p-3.5 text-blue-600">
                        {Array.isArray(user.roles) && user.roles.length > 0
                          ? user.roles.map(r => r?.name || r).join(', ')
                          : user.roles || 'None'}
                      </td>
                      <td className="p-3.5"><StatusBadge status={user.status} /></td>
                      <td className="p-3.5 pr-5 text-gray-400 font-normal">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                  {!isLoading.users && !error.users && paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-xs text-gray-400">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {renderTableState('users')}
            </div>

            {!isLoading.users && !error.users && filteredUsers.length > 0 && (
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                from={filteredUsers.length === 0 ? 0 : (currentPage - 1) * parseInt(itemsPerPage, 10) + 1}
                to={Math.min(currentPage * parseInt(itemsPerPage, 10), filteredUsers.length)}
                total={filteredUsers.length}
              />
            )}
          </div>
        </div>
      )}

      {currentView === 'roles' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Roles</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage system roles and custom access groups.</p>
            </div>
            <button
              onClick={() => { setEditingRole(null); setIsRoleModalOpen(true); }}
              className="bg-[#1064ff] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-600 flex items-center space-x-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Role</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafafa] border-b border-gray-200 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                    <th className="p-3.5 pl-5 w-16">Actions</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Users</th>
                    <th className="p-3.5 pr-5">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {!isLoading.roles && roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pl-5">
                        <button
                          onClick={(e) => handleActionClick(e, 'role', role.id)}
                          className="text-gray-400 hover:text-[#1064ff] p-1 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                      </td>
                      <td className="p-3.5 font-semibold text-gray-900">{role.name}</td>
                      <td className="p-3.5 text-gray-500 max-w-xs truncate">{role.description}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${role.type === 'System Defined' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {role.type || 'Custom'}
                        </span>
                      </td>
                      <td className="p-3.5"><StatusBadge status={role.status} /></td>
                      <td className="p-3.5 text-gray-400 font-normal">
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                          </svg>
                          {countUsersForRole(role)}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-gray-400 font-normal">{formatDate(role.createdAt)}</td>
                    </tr>
                  ))}
                  {!isLoading.roles && !error.roles && roles.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-xs text-gray-400">No roles found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {renderTableState('roles')}
            </div>
          </div>
        </div>
      )}

      {currentView === 'permissions' && (
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Permissions</h1>
            <p className="text-xs text-gray-500 mt-0.5">Access control coverage across platform resources.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafafa] border-b border-gray-200 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Permission</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 pr-5">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {!isLoading.permissions && permissions.map((perm) => (
                    <tr key={perm.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pl-5 font-mono text-[11px] text-[#1064ff] font-bold">{perm.name}</td>
                      <td className="p-3.5 text-gray-500 max-w-sm">{perm.description}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">{perm.category}</span>
                      </td>
                      <td className="p-3.5 pr-5 text-gray-400 font-normal">{formatDate(perm.createdAt)}</td>
                    </tr>
                  ))}
                  {!isLoading.permissions && !error.permissions && permissions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-xs text-gray-400">No permissions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {renderTableState('permissions')}
            </div>
          </div>
        </div>
      )}

      {dropdownConfig.visible && (
        <FloatingMenu coords={dropdownConfig.coords} onClose={closeDropdown}>
          <button
            onClick={() => {
              if (dropdownConfig.type === 'user') {
                setEditingUser(menuUser);
                setIsUserModalOpen(true);
              } else {
                setEditingRole(menuRole);
                setIsRoleModalOpen(true);
              }
              closeDropdown();
            }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors flex items-center space-x-2.5"
          >
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>

          <button
            onClick={() => {
              if (dropdownConfig.type === 'user') {
                handleToggleUserStatus(dropdownConfig.id);
              } else {
                handleToggleRoleStatus(dropdownConfig.id);
              }
            }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors flex items-center space-x-2.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>
              {dropdownConfig.type === 'user'
                ? (menuUser?.status === 'Active' ? 'Make Inactive' : 'Make Active')
                : (menuRole?.status === 'Active' ? 'Make Inactive' : 'Make Active')}
            </span>
          </button>

          {dropdownConfig.type === 'user' && (
            <button
              onClick={() => handleUnlockUser(dropdownConfig.id)}
              disabled={menuUser?.lockStatus === 'Unlocked' || !menuUser?.lockStatus}
              className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center space-x-2.5 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-slate-50 text-gray-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 019.9-1" />
              </svg>
              <span>Unlock</span>
            </button>
          )}

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={() => {
              if (dropdownConfig.type === 'user') {
                handleDeleteUser(dropdownConfig.id);
              } else {
                handleDeleteRole(dropdownConfig.id);
              }
            }}
            className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2.5"
          >
            <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </FloatingMenu>
      )}

      <AddUserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onAddUser={handleAddOrUpdateUser} editData={editingUser} />
      <AddRoleModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} onAddRole={handleAddOrUpdateRole} editData={editingRole} />
    </AdminLayout>
  );
};
