import React, { useEffect, useState } from 'react';

const ROLES = [
  { value: 'ADMIN', label: 'Super Admin' },
  { value: 'SCHOOL_ADMIN', label: 'School Admin' },
  { value: 'LECTURER', label: 'Lecturer' },
  { value: 'STUDENT', label: 'Student' },
];

export const AddUserModal = ({ isOpen, onClose, onAddUser, editData, schools = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STUDENT',
    schoolId: '',
    status: 'Active',
  });

  const isEditMode = Boolean(editData);
  const requiresSchool = formData.role !== 'ADMIN';

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      name: editData?.name || '',
      email: editData?.email || '',
      role: editData?.role || editData?.roles?.[0] || 'STUDENT',
      schoolId: editData?.schoolId || '',
      status: editData?.status || 'Active',
    });
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
      ...(field === 'role' && value === 'ADMIN' ? { schoolId: '' } : {}),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onAddUser({
      ...formData,
      schoolId: requiresSchool ? formData.schoolId : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden text-left border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {isEditMode ? 'Update User Profile' : 'Add New User'}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {isEditMode ? 'Modify an existing account.' : 'Create a new account in the user directory.'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="e.g. Ganza Kenny"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="e.g. g.kenny@ur.ac.rw"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Role
            </label>
            <select
              required
              value={formData.role}
              onChange={(event) => updateField('role', event.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          {requiresSchool && (
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                School
              </label>
              <select
                required
                value={formData.schoolId}
                onChange={(event) => updateField('schoolId', event.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
              >
                <option value="">Select school...</option>
                {schools
                  .filter((school) => school.status === 'ACTIVE' || school.status === 'APPROVED')
                  .map((school) => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Account Status
            </label>
            <select
              value={formData.status}
              onChange={(event) => updateField('status', event.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs bg-white focus:outline-none text-gray-800 font-medium"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

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
