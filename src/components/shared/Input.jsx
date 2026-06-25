import React from 'react';

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[9px] text-red-400">{error}</p>}
    </div>
  );
};
