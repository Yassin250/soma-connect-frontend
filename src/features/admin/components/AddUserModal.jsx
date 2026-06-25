import React from 'react';
import { useForm } from 'react-hook-form';

export const AddUserModal = ({ isOpen, onClose, onAddUser, schools = [] }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onAddUser({
      name: data.name,
      email: data.email,
      role: data.role,
      schoolId: data.role !== 'ADMIN' ? data.schoolId : undefined,
      status: 'Active',
    });
    reset();
    onClose();
  };

    const ROLES = [
    { value: 'SCHOOL_ADMIN', label: 'School Admin' },
    { value: 'LECTURER', label: 'Lecturer' },
    { value: 'STUDENT', label: 'Student' },
  ];




  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 mx-4 border border-gray-100 z-10">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">Add New User</h3>
            <p className="text-[11px] text-gray-500">Create a new account in the user directory.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
            <input
              {...register('name', { required: 'Full name is required' })}
              type="text"
              placeholder="e.g. Ganza Kenny"
              className="w-full bg-white border border-gray-300 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-[#1064ff] text-gray-800 placeholder-gray-400"
            />
            {errors.name && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
            <input
              {...register('email', {
                required: 'Email address is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
              })}
              type="email"
              placeholder="e.g. g.kenny@ur.ac.rw"
              className="w-full bg-white border border-gray-300 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-[#1064ff] text-gray-800 placeholder-gray-400"
            />
            {errors.email && <p className="text-[10px] text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Role</label>
            <select
              {...register('role', { required: 'Role is required' })}
              className="w-full bg-white border border-gray-300 rounded-lg text-xs px-2 py-2.5 focus:outline-none focus:border-[#1064ff] text-gray-700"
            >
              <option value="">Select role...</option>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.role && <p className="text-[10px] text-red-500">{errors.role.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">School</label>
            <select
              {...register('schoolId', { required: 'School is required' })}
              className="w-full bg-white border border-gray-300 rounded-lg text-xs px-2 py-2.5 focus:outline-none focus:border-[#1064ff] text-gray-700"
            >
              <option value="">Select school...</option>
              {schools.filter(s => s.status === 'ACTIVE' || s.status === 'APPROVED').map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.schoolId && <p className="text-[10px] text-red-500">{errors.schoolId.message}</p>}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-200">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-[#1064ff] hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-sm">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
