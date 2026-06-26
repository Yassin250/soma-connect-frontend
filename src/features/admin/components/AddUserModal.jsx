import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const AddUserModal = ({ isOpen, onClose, onAddUser, editData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Active');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState([]);
  const { token } = useAuth();

  // Determine mode
  const isEditMode = !!editData;

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
          if (!response.ok) throw new Error('Failed to fetch roles');
          const data = await response.json();
          const roleList = Array.isArray(data) ? data : (data?.data || []);
          setRoles(roleList);
          // If editing, preselect the role
          if (editData && editData.roleId) {
            setRoleId(editData.roleId.toString());
          }
        } catch (err) {
          console.error('Error fetching roles:', err);
        }
      };
      fetchRoles();
    }
  }, [isOpen, editData, token]);

  // Populate fields when opening or editData changes
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setName(editData.name || '');
        setEmail(editData.email || '');
        setStatus(editData.status || 'Active');
        // password not filled for security
        setPassword('');
        setRoleId(editData.roleId ? editData.roleId.toString() : '');
      } else {
        // Reset for add
        setName('');
        setEmail('');
        setPassword('');
        setStatus('Active');
        setRoleId('');
      }
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
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
            onAddUser({ name, email, password, status, roleId });
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
    </div>
  );
};