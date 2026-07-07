import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext';

export const AddUserModal = ({ isOpen, onClose, onSubmit, editingUser }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Active');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState([]);
  const { token } = useAuth();

  // Determine mode
  const isEditMode = !!editingUser;

  // Resolves which role id should be preselected for an editingUser, no
  // matter which shape the backend returned the role in. `roleList` is the
  // freshly-fetched roles array, used as a fallback to resolve a bare
  // `roleName` string to its id.
  const resolveRoleId = (user, roleList) => {
    if (!user) return '';
    if (user.roleId != null) return user.roleId.toString();
    if (user.role && typeof user.role === 'object' && user.role.id) {
      return user.role.id.toString();
    }
    if (user.role != null && (typeof user.role === 'number' || typeof user.role === 'string')) {
      return user.role.toString();
    }
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      const firstRole = user.roles[0];
      if (firstRole?.id != null) return firstRole.id.toString();
      if (typeof firstRole === 'string') {
        const matched = roleList.find((r) => r.name === firstRole);
        if (matched) return matched.id.toString();
      }
      return (firstRole || '').toString();
    }
    if (user.roleName) {
      const matched = roleList.find((r) => r.name === user.roleName);
      if (matched) return matched.id.toString();
    }
    return '';
  };

  // Fetch roles when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        try {
          const response = await fetch('http://localhost:5050/api/admin/roles', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch roles: ${response.status} ${errorText}`);
          }
          const data = await response.json();
          const roleList = Array.isArray(data) ? data : (data?.data || []);
          setRoles(roleList);

          // If editing, preselect the role robustly (now that we have the
          // full roles list to resolve a bare roleName against, if needed).
          if (editingUser) {
            setRoleId(resolveRoleId(editingUser, roleList));
          }
        } catch (err) {
          console.error('Error fetching roles:', err);
        }
      };
      fetchRoles();
    }
  }, [isOpen, editingUser, token]);

  // Populate fields when opening or editingUser changes
  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        setName(editingUser.name || '');
        setUsername(editingUser.username || '');
        setEmail(editingUser.email || '');
        setStatus(editingUser.status || 'Active');
        // password not filled for security
        setPassword('');
        setRoleId(resolveRoleId(editingUser, roles));
      } else {
        // Reset for add
        setName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setStatus('Active');
        setRoleId('');
      }
    }
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 w-full h-full min-h-screen bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[50]">
      <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[480px] overflow-hidden border border-gray-200 p-6 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-lg"
        >
          &times;
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            {isEditMode ? 'Update User Profile' : 'Add New User'}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {isEditMode
              ? 'Modify existing system account properties and profile data.'
              : 'Create a system directory identity profile container.'}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ name, username, email, password, status, roleId });
          }}
          className="space-y-5"
        >
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ganza Kenny"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. gkenny"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. g.kenny@somaconnect.rw"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
            />
          </div>

          {/* Password (only for add, not shown in edit for security) */}
          {!isEditMode && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
              />
            </div>
          )}

          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Account Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs bg-white focus:outline-none text-gray-800 font-medium"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Role dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Role
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs bg-white focus:outline-none text-gray-800 font-medium"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1064ff] text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm"
            >
              {isEditMode ? 'Update Profile' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};