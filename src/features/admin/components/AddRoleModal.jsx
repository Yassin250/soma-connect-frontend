import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Same field recipe as AddUserModal so both modals read as one system.
const inputClass =
  'w-full rounded-xl bg-[#f7f8fa] border border-[#120E1A]/10 px-3.5 py-2.5 text-sm text-[#120E1A] placeholder-gray-400 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/20 focus:outline-none transition-all';
const labelClass = 'block text-[10px] font-bold text-[#120E1A]/45 uppercase tracking-[0.14em] mb-1.5';

export const AddRoleModal = ({ isOpen, onClose, onSubmit, editingRole }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const isEditMode = !!editingRole;

  // Populate / reset fields when opening.
  useEffect(() => {
    if (!isOpen) return;
    if (editingRole) {
      setName(editingRole.name || '');
      setDescription(editingRole.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [editingRole, isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  return createPortal(
    // Backdrop — clicking outside the card closes the modal.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#120E1A]/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[520px] max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-[#120E1A]/[0.06] shadow-[0_20px_60px_rgba(27,30,38,0.25)] p-6 sm:p-8 animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-[#120E1A]/40 hover:text-[#120E1A] hover:bg-[#f3f4f6] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
        </button>

        {/* Header */}
        <div className="mb-6 pr-8">
          <span className="w-11 h-11 rounded-2xl bg-[#8B5CF6]/25 text-[#120E1A] flex items-center justify-center mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v6M9 11h6" />
            </svg>
          </span>
          <h3 className="text-xl font-semibold text-[#120E1A] tracking-tight">
            {isEditMode ? 'Update role' : 'Add new role'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode
              ? 'Rename this role or refine what it is for.'
              : 'Create a role, then attach permissions from the table.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Role Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Content Moderator"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What can people with this role do?"
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#120E1A]/70 border border-[#120E1A]/10 hover:bg-[#f3f4f6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#8B5CF6] text-white hover:bg-[#C4B5FD] transition-colors active:scale-[0.98] shadow-sm"
            >
              {isEditMode ? 'Save changes' : 'Create role'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddRoleModal;
