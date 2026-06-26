import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { AddRoleModal } from '../components/AddRoleModal';
import { AddUserModal } from '../components/AddUserModal';
import { Badge } from '../../../components/shared/Badge';
import { useAuth } from '../../../context/AuthContext';
import { mockDb } from '../../../services/mockDb';

const ROLE_VARIANT = {
  ADMIN: 'purple',
  SCHOOL_ADMIN: 'info',
  LECTURER: 'warning',
  STUDENT: 'success',
};

const ROLE_LABEL = {
  ADMIN: 'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  LECTURER: 'Lecturer',
  STUDENT: 'Student',
};

const DEFAULT_ROLES = [
  {
    id: 'role-admin',
    name: 'Super Admin',
    code: 'ADMIN',
    description: 'Full system access for school approvals, users, roles, and platform configuration.',
    permissions: 'ALL_PRIVILEGES',
    type: 'System Defined',
    status: 'Active',
    createdAt: '2026-01-10',
  },
  {
    id: 'role-school-admin',
    name: 'School Admin',
    code: 'SCHOOL_ADMIN',
    description: 'Manages school setup, lecturers, students, courses, and school reporting.',
    permissions: 'MANAGE_SCHOOL',
    type: 'System Defined',
    status: 'Active',
    createdAt: '2026-01-10',
  },
  {
    id: 'role-lecturer',
    name: 'Lecturer',
    code: 'LECTURER',
    description: 'Creates learning content, quizzes, assignments, and grades submissions.',
    permissions: 'MANAGE_COURSES',
    type: 'System Defined',
    status: 'Active',
    createdAt: '2026-01-10',
  },
  {
    id: 'role-student',
    name: 'Student',
    code: 'STUDENT',
    description: 'Accesses modules, attempts quizzes, submits assignments, and tracks progress.',
    permissions: 'LEARNER_ACCESS',
    type: 'System Defined',
    status: 'Active',
    createdAt: '2026-01-10',
  },
];

const PERMISSIONS = [
  { id: 1, name: 'ALL_PRIVILEGES', description: 'Full read and write access across the platform.', category: 'System Control', roles: ['ADMIN'] },
  { id: 2, name: 'APPROVE_SCHOOLS', description: 'Review, approve, and reject school onboarding requests.', category: 'School Registry', roles: ['ADMIN'] },
  { id: 3, name: 'MANAGE_SCHOOL', description: 'Configure departments, academic year, staff, students, and courses.', category: 'School Operations', roles: ['ADMIN', 'SCHOOL_ADMIN'] },
  { id: 4, name: 'MANAGE_COURSES', description: 'Create modules, quizzes, assignments, and grade student submissions.', category: 'Learning', roles: ['SCHOOL_ADMIN', 'LECTURER'] },
  { id: 5, name: 'LEARNER_ACCESS', description: 'View modules, take quizzes, submit assignments, and track performance.', category: 'Learning', roles: ['STUDENT'] },
];

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

export const UserManagementPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('users');
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [schoolFilter, setSchoolFilter] = useState('ALL');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [dropdownConfig, setDropdownConfig] = useState({ visible: false, type: null, id: null, coords: { top: 0, left: 0 } });

  const loadDirectory = useCallback(() => {
    setUsers(mockDb.getUsers());
    setSchools(mockDb.getSchools());
  }, []);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const closeDropdown = () => {
    setDropdownConfig({ visible: false, type: null, id: null, coords: { top: 0, left: 0 } });
  };

  const handleActionClick = (event, type, id) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
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

  const getSchoolName = (schoolId) => {
    const school = schools.find((item) => item.id === schoolId);
    return school?.name || 'Platform';
  };

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query);
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesSchool = schoolFilter === 'ALL' || user.schoolId === schoolFilter;

      return matchesSearch && matchesRole && matchesSchool;
    });
  }, [roleFilter, schoolFilter, searchQuery, users]);

  const handleAddOrUpdateUser = (userData) => {
    try {
      if (editingUser) {
        mockDb.updateUser(editingUser.id, userData);
      } else {
        mockDb.addUser(userData);
      }
      setEditingUser(null);
      loadDirectory();
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleAddOrUpdateRole = (roleData) => {
    if (editingRole) {
      setRoles((current) =>
        current.map((role) => role.id === editingRole.id ? { ...role, ...roleData } : role)
      );
    } else {
      setRoles((current) => [
        ...current,
        {
          id: `role-${Date.now()}`,
          name: roleData.name,
          code: roleData.name.replace(/\s+/g, '_').toUpperCase(),
          description: roleData.description,
          permissions: `CUSTOM_${roleData.name.replace(/\s+/g, '_').toUpperCase()}`,
          type: 'Custom',
          status: roleData.status || 'Active',
          createdAt: new Date().toISOString().split('T')[0],
        },
      ]);
    }

    setEditingRole(null);
    setIsRoleModalOpen(false);
  };

  const handleDeleteUser = (userId) => {
    const user = users.find((item) => item.id === userId);
    if (user?.role === 'ADMIN') return;
    mockDb.removeUser(userId);
    loadDirectory();
  };

  const handleToggleUserStatus = (userId) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;
    mockDb.updateUser(userId, { status: user.status === 'Active' ? 'Inactive' : 'Active' });
    loadDirectory();
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AdminLayout currentSubPage={currentView} onSubPageChange={setCurrentView} onLogout={handleLogout}>
      {currentView === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Users Directory</h1>
              <p className="text-xs text-gray-500 mt-0.5">{users.length} total users across {schools.length} schools</p>
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
              className="bg-[#1064ff] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-1.5"
            >
              <span>+ New User</span>
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="bg-white border border-gray-300 rounded-lg text-xs px-3 py-2 w-full sm:w-72 focus:outline-none focus:border-[#1064ff]"
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="bg-white border border-gray-300 rounded-lg text-xs px-2 py-2 focus:outline-none focus:border-[#1064ff]"
            >
              <option value="ALL">All Roles</option>
              {Object.entries(ROLE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={schoolFilter}
              onChange={(event) => setSchoolFilter(event.target.value)}
              className="bg-white border border-gray-300 rounded-lg text-xs px-2 py-2 focus:outline-none focus:border-[#1064ff]"
            >
              <option value="ALL">All Schools</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>{school.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafafa] border-b border-gray-200 text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                    <th className="p-3.5 pl-5 w-20">Actions</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Username</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">School</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 pl-5">
                        <button onClick={(event) => handleActionClick(event, 'user', user.id)} className="text-gray-400 hover:text-blue-600 p-1" aria-label={`Open actions for ${user.name}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5h.01M12 12h.01M12 19h.01" />
                          </svg>
                        </button>
                      </td>
                      <td className="p-3.5 font-semibold text-gray-900">{user.name}</td>
                      <td className="p-3.5 text-gray-500">{user.username || user.email?.split('@')[0]}</td>
                      <td className="p-3.5 text-gray-500">{user.email}</td>
                      <td className="p-3.5">
                        <Badge variant={ROLE_VARIANT[user.role] || 'default'}>{ROLE_LABEL[user.role] || user.role}</Badge>
                      </td>
                      <td className="p-3.5 text-gray-500 max-w-[220px] truncate">{getSchoolName(user.schoolId)}</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${user.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                          <span className={`w-1 h-1 rounded-full mr-1.5 ${user.status === 'Active' ? 'bg-green-500' : 'bg-rose-500'}`} />
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No users match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
              onClick={() => {
                setEditingRole(null);
                setIsRoleModalOpen(true);
              }}
              className="bg-[#1064ff] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-600"
            >
              + New Role
            </button>
          </div>

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
                    <th className="p-3.5 pr-5">Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 pl-5">
                        <button onClick={(event) => handleActionClick(event, 'role', role.id)} className="text-gray-400 hover:text-blue-600 p-1" aria-label={`Open actions for ${role.name}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5h.01M12 12h.01M12 19h.01" />
                          </svg>
                        </button>
                      </td>
                      <td className="p-3.5 font-semibold text-gray-900">{role.name}</td>
                      <td className="p-3.5 text-gray-500 max-w-xs truncate">{role.description}</td>
                      <td className="p-3.5 text-gray-500">{role.type}</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${role.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                          <span className={`w-1 h-1 rounded-full mr-1.5 ${role.status === 'Active' ? 'bg-green-500' : 'bg-rose-500'}`} />
                          {role.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-gray-400 font-normal">
                        {role.code ? users.filter((user) => user.role === role.code).length : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <th className="p-3.5 pl-5">Name</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 pr-5">Roles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {PERMISSIONS.map((permission) => (
                    <tr key={permission.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 pl-5 font-mono text-[11px] text-blue-600 font-bold">{permission.name}</td>
                      <td className="p-3.5 text-gray-500 max-w-sm">{permission.description}</td>
                      <td className="p-3.5"><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">{permission.category}</span></td>
                      <td className="p-3.5 pr-5 text-gray-500">
                        {permission.roles.map((role) => ROLE_LABEL[role] || role).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {dropdownConfig.visible && (
        <FloatingMenu coords={dropdownConfig.coords} onClose={closeDropdown}>
          <button
            onClick={() => {
              if (dropdownConfig.type === 'user') {
                setEditingUser(users.find((user) => user.id === dropdownConfig.id));
                setIsUserModalOpen(true);
              } else {
                setEditingRole(roles.find((role) => role.id === dropdownConfig.id));
                setIsRoleModalOpen(true);
              }
              closeDropdown();
            }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors"
          >
            Edit
          </button>

          <button
            onClick={() => {
              if (dropdownConfig.type === 'user') {
                handleToggleUserStatus(dropdownConfig.id);
              } else {
                setRoles((current) => current.map((role) => role.id === dropdownConfig.id ? { ...role, status: role.status === 'Active' ? 'Inactive' : 'Active' } : role));
              }
              closeDropdown();
            }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors"
          >
            Toggle Status
          </button>

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={() => {
              if (dropdownConfig.type === 'user') {
                handleDeleteUser(dropdownConfig.id);
              } else {
                setRoles((current) => current.filter((role) => role.id !== dropdownConfig.id || role.type === 'System Defined'));
              }
              closeDropdown();
            }}
            className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </FloatingMenu>
      )}

      <AddUserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onAddUser={handleAddOrUpdateUser}
        editData={editingUser}
        schools={schools}
      />
      <AddRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setEditingRole(null);
        }}
        onAddRole={handleAddOrUpdateRole}
        editData={editingRole}
      />
    </AdminLayout>
  );
};
