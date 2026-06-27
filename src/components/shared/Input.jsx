import React from 'react';

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-600 tracking-wide">
          {label}
        </label>
      )}
      <input 
        className={`px-3 py-2 border rounded-lg text-sm outline-none transition-all 
          ${error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'} 
          bg-white text-slate-900 placeholder-slate-400`} 
        {...props} 
      />
      {error && (
        <span className="text-[10px] text-red-500 font-medium">
          {error}
        </span>
      )}
    </div>
  );
};
