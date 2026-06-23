import React, { useState, useEffect } from 'react';

export const AddUserModal = ({ isOpen, onClose, onAddUser, editData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Active');
  
  // Determine mode cleanly
  const isEditMode = !!editData;

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Pre-populate fields with existing data when editing
        setName(editData.name || '');
        setEmail(editData.email || '');
        setStatus(editData.status || 'Active');
      } else {
        // Reset fields when adding a new user
        setName('');
        setEmail('');
        setStatus('Active');
      }
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden text-left border border-gray-100">
        
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {isEditMode ? 'Update User Profile' : 'Add New User'}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {isEditMode ? 'Modify existing system account properties and profile data.' : 'Create a system directory identity profile container.'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
        </div>

        {/* Form Content */}
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            onAddUser({ name, email, status }); 
          }} 
          className="p-6 space-y-4"
        >
          {/* Full Name Field */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
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

          {/* Email Field */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
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

          {/* Account Status Selection */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Account Initialization Status
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

          {/* Action Buttons */}
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