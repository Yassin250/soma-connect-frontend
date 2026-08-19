import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const inputClass =
  'w-full rounded-xl bg-[#f7f8fa] border border-[#0A0A0A]/10 px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder-gray-400 focus:bg-white focus:border-[#3D7FFF] focus:ring-4 focus:ring-[#3D7FFF]/20 focus:outline-none transition-all';
const labelClass = 'block text-[10px] font-bold text-[#0A0A0A]/45 uppercase tracking-[0.14em] mb-1.5';

export const AddSystemParameterModal = ({ isOpen, onClose, onSubmit, editingParameter }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');

  const isEditMode = !!editingParameter;

  useEffect(() => {
    if (!isOpen) return;
    if (editingParameter) {
      setName(editingParameter.name || '');
      setValue(editingParameter.value || '');
      setDescription(editingParameter.description || '');
      setStatus(editingParameter.active === false ? 'Inactive' : 'Active');
    } else {
      setName('');
      setValue('');
      setDescription('');
      setStatus('Active');
    }
  }, [editingParameter, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[620px] max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-[#0A0A0A]/[0.06] shadow-[0_20px_60px_rgba(27,30,38,0.25)] p-6 sm:p-8 animate-in zoom-in-95 fade-in duration-200"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-[#0A0A0A]/40 hover:text-[#0A0A0A] hover:bg-[#f3f4f6] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mb-6 pr-8">
          <span className="w-11 h-11 rounded-2xl bg-[#3D7FFF]/25 text-[#0A0A0A] flex items-center justify-center mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4m0 16v-4M4 12h4m12 0h-4M6.34 6.34l2.83 2.83m5.66 5.66 2.83 2.83m0-11.32-2.83 2.83m-5.66 5.66-2.83 2.83" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
          <h3 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">
            {isEditMode ? 'Update system parameter' : 'Add system parameter'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode
              ? 'Update configuration values used by platform services.'
              : 'Create a new platform-wide configuration parameter.'}
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({
              name,
              value,
              description,
              active: status === 'Active',
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. PASSWORD_EXPIRY_DAYS"
              className={inputClass}
              disabled={isEditMode}
            />
          </div>

          <div>
            <label className={labelClass}>Value</label>
            <textarea
              rows={4}
              required
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="e.g. 90"
              className={`${inputClass} resize-y`}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this parameter controls."
              className={`${inputClass} resize-y`}
            />
          </div>

          {isEditMode && (
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#0A0A0A]/70 border border-[#0A0A0A]/10 hover:bg-[#f3f4f6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#3D7FFF] text-white hover:bg-[#63C7FF] transition-colors active:scale-[0.98] shadow-sm"
            >
              {isEditMode ? 'Save changes' : 'Create parameter'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddSystemParameterModal;
