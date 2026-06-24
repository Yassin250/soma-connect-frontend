import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { AddUserModal } from '../components/AddUserModal';
import { AddRoleModal } from '../components/AddRoleModal';
import { useAuth } from '../../../context/AuthContext';

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
      className="absolute w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-[9999] py-1 text-left"
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
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState('10');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null); 

  const [dropdownConfig, setDropdownConfig] = useState({ visible: false, type: null, id: null, coords: { top: 0, left: 0 } });

  // --- DATA STATES ---
  const [users, setUsers] = useState([
    { id: 1, name: "Confiance Ufitamahoro", username: "brazo", email: "c.ufitamahoro@soma.ac.rw", userType: "Internal", roles: "System Admin", status: "Active", lockStatus: "Unlocked", createdAt: "2026-04-12" },
    { id: 2, name: "Ganza Kenny", username: "kennyg", email: "g.kenny@soma.ac.rw", userType: "Internal", roles: "Mentor", status: "Active", lockStatus: "Unlocked", createdAt: "2026-04-15" },
    { id: 3, name: "Nziza Keneth", username: "keneth_n", email: "k.nziza@soma.ac.rw", userType: "Internal", roles: "Mentee", status: "Inactive", lockStatus: "Locked", createdAt: "2026-05-02" }
  ]);

  const [roles, setRoles] = useState([
    { id: 1, name: "System Admin", description: "Full operational override access across all platform configurations.", permissions: "ALL_PRIVILEGES", type: "System Defined", status: "Active", createdAt: "2026-01-10" },
    { id: 2, name: "Mentor", description: "Manage localized training groups.", permissions: "READ_WRITE_SESSIONS", type: "Custom", status: "Active", createdAt: "2026-04-01" },
    { id: 3, name: "Mentee", description: "Enroll in designated workspace tracks.", permissions: "READ_TRACKS", type: "Custom", status: "Active", createdAt: "2026-04-01" }
  ]);

  const [permissions] = useState([
    { id: 1, name: "ALL_PRIVILEGES", description: "Grants absolute write, edit, delete capabilities over entire directories.", category: "System Control", createdAt: "2026-01-01" },
    { id: 2, name: "READ_WRITE_SESSIONS", description: "Allows editing of program scheduling calendars and assigning benchmarks.", category: "Mentorship", createdAt: "2026-04-01" },
    { id: 3, name: "READ_TRACKS", description: "Enables viewing system dashboard feeds and public directory structures.", category: "General Access", createdAt: "2026-04-01" }
  ]);

  const handleActionClick = (e, type, id) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownConfig({
      visible: true,
      type,
      id,
      coords: {
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      }
    });
  };

  const closeDropdown = () => setDropdownConfig({ visible: false, type: null, id: null, coords: { top: 0, left: 0 } });

  const handleAddOrUpdateUser = (userData) => {
    if (editingEntity) {
      setUsers(users.map(u => u.id === editingEntity.id ? { ...u, ...userData } : u));
    } else {
      setUsers([...users, {
        id: users.length + 1,
        name: userData.name,
        username: userData.name.toLowerCase().replace(/\s+/g, ''),
        email: userData.email,
        userType: "Internal",
        roles: "Mentee",
        status: userData.status,
        lockStatus: "Unlocked",
        createdAt: new Date().toISOString().split('T')[0]
      }]);
    }
    setIsModalOpen(false);
    setEditingEntity(null);
  };

  const handleAddOrUpdateRole = (roleData) => {
    if (editingEntity) {
      setRoles(roles.map(r => r.id === editingEntity.id ? { ...r, ...roleData } : r));
    } else {
      setRoles([...roles, {
        id: roles.length + 1,
        name: roleData.name,
        description: roleData.description,
        permissions: "CUSTOM_" + roleData.name.replace(/\s+/g, '_').toUpperCase(),
        type: roleData.type,
        status: "Active",
        createdAt: new Date().toISOString().split('T')[0]
      }]);
    }
    setIsRoleModalOpen(false);
    setEditingEntity(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AdminLayout currentSubPage={currentView} onSubPageChange={setCurrentView} onLogout={handleLogout}>
      
      {/* -------------------- USERS SUB-VIEW -------------------- */}
      {currentView === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Users</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage system users</p>
            </div>
            <button 
              onClick={() => { setEditingEntity(null); setIsModalOpen(true); }}
              className="bg-[#1064ff] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-600 flex items-center space-x-1.5"
            >
              <span>+ New User</span>
            </button>
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
                    <th className="p-3.5">Roles</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 pl-5">
                        <button onClick={(e) => handleActionClick(e, 'user', user.id)} className="text-gray-400 hover:text-blue-600 p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                          </svg>
                        </button>
                      </td>
                      <td className="p-3.5 font-semibold text-gray-900">{user.name}</td>
                      <td className="p-3.5 text-gray-500">{user.username}</td>
                      <td className="p-3.5 text-gray-500">{user.email}</td>
                      <td className="p-3.5 text-blue-600">{user.roles}</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${user.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                          <span className={`w-1 h-1 rounded-full mr-1.5 ${user.status === 'Active' ? 'bg-green-500' : 'bg-rose-500'}`} />
                          {user.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-gray-400 font-normal">{user.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- ROLES SUB-VIEW -------------------- */}
      {currentView === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Roles</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage system roles</p>
            </div>
            <button 
              onClick={() => { setEditingEntity(null); setIsRoleModalOpen(true); }}
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
                    <th className="p-3.5 pr-5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 pl-5">
                        <button onClick={(e) => handleActionClick(e, 'role', role.id)} className="text-gray-400 hover:text-blue-600 p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
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
                      <td className="p-3.5 pr-5 text-gray-400 font-normal">{role.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- PERMISSIONS SUB-VIEW -------------------- */}
      {currentView === 'permissions' && (
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Permissions</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage system Permissions</p>
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
                      <td className="p-3.5 pl-5 font-mono text-[11px] text-blue-600 font-bold">{perm.name}</td>
                      <td className="p-3.5 text-gray-500 max-w-sm">{perm.description}</td>
                      <td className="p-3.5"><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">{perm.category}</span></td>
                      <td className="p-3.5 pr-5 text-gray-400 font-normal">{perm.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING ACTIONS PORTAL CONTEXT MENU --- */}
      {dropdownConfig.visible && (
        <FloatingMenu coords={dropdownConfig.coords} onClose={closeDropdown}>
          <button
            onClick={() => {
              if (dropdownConfig.type === 'user') {
                const match = users.find(u => u.id === dropdownConfig.id);
                setEditingEntity(match);
                setIsModalOpen(true);
              } else {
                const match = roles.find(r => r.id === dropdownConfig.id);
                setEditingEntity(match);
                setIsRoleModalOpen(true);
              }
              closeDropdown();
            }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
          >
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>

          <button
            onClick={() => {
              if (dropdownConfig.type === 'user') {
                setUsers(users.map(u => u.id === dropdownConfig.id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
              } else {
                setRoles(roles.map(r => r.id === dropdownConfig.id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r));
              }
              closeDropdown();
            }}
            className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>
              {dropdownConfig.type === 'user' 
                ? (users.find(u => u.id === dropdownConfig.id)?.status === 'Active' ? 'Make Inactive' : 'Make Active')
                : (roles.find(r => r.id === dropdownConfig.id)?.status === 'Active' ? 'Make Inactive' : 'Make Active')}
            </span>
          </button>

          {dropdownConfig.type === 'user' && (
            <button
              onClick={() => {
                setUsers(users.map(u => u.id === dropdownConfig.id ? { ...u, lockStatus: 'Unlocked' } : u));
                closeDropdown();
              }}
              disabled={users.find(u => u.id === dropdownConfig.id)?.lockStatus === 'Unlocked'}
              className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center space-x-2 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-slate-50 text-gray-700"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Unlock</span>
            </button>
          )}

          <div className="border-t border-gray-100 my-1"></div>

          <button
            onClick={() => {
              if (dropdownConfig.type === 'user') {
                setUsers(users.filter(u => u.id !== dropdownConfig.id));
              } else {
                setRoles(roles.filter(r => r.id !== dropdownConfig.id));
              }
              closeDropdown();
            }}
            className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </FloatingMenu>
      )}

      {/* --- MODALS --- */}
      <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddUser={handleAddOrUpdateUser} editData={editingEntity} />
      <AddRoleModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} onAddRole={handleAddOrUpdateRole} editData={editingEntity} />
    </AdminLayout>
  );
};