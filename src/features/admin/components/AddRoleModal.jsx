import React, { useState, useEffect } from 'react';

export const AddRoleModal = ({ isOpen, onClose, onSubmit, editingRole }) => {
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleType, setNewRoleType] = useState('Active');

  // Determine mode based on presence of editingRole
  const isEditMode = !!editingRole;

  useEffect(() => {
    if (isOpen) {
      if (editingRole) {
        // Pre-populate fields with existing data when editing
        setNewRoleName(editingRole.name || '');
        setNewRoleDesc(editingRole.description || '');
        setNewRoleType(editingRole.status || 'Active');
      } else {
        // Reset fields completely when adding a new role
        setNewRoleName('');
        setNewRoleDesc('');
        setNewRoleType('Active');
      }
    }
  }, [editingRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleDesc.trim()) return;

    onSubmit({
      name: newRoleName,
      description: newRoleDesc,
      status: newRoleType,
    });

    // Reset fields & Close
    setNewRoleName('');
    setNewRoleDesc('');
    setNewRoleType('Active');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[480px] overflow-hidden border border-slate-100 p-6 relative">
        
        {/* Upper Right Dismiss Cross Marker */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors text-lg"
        >
          &times;
        </button>

        {/* Header Identity Block */}
        <div className="text-left mb-6">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            {isEditMode ? 'Update System Role' : 'Add New Role'}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {isEditMode ? 'Modify existing configuration privileges and role parameters.' : 'Create a system directory identity profile container.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          
          {/* Input 1: Role Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Role Name</label>
            <input 
              type="text"
              required
              placeholder="e.g. Moderator Track Leader"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-300 font-medium"
            />
          </div>

          {/* Input 2: Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Description</label>
            <input 
              type="text"
              required
              placeholder="e.g. Access operational monitoring logs"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-300 font-medium"
            />
          </div>

          {/* Input 3: Account Initialization Status */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Account Initialization Status</label>
            <div className="relative">
              <select
                value={newRoleType}
                onChange={(e) => setNewRoleType(e.target.value)}
                className="w-full text-xs px-3.5 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 transition-colors text-gray-800 font-medium appearance-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Actions Segment */}
          <div className="border-t border-gray-100 pt-4 mt-6 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#f8fafc] hover:bg-slate-100 text-gray-700 font-bold text-xs rounded-xl transition-colors border border-gray-200 shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0062ff] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              {isEditMode ? 'Update Role' : 'Save Profile'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};