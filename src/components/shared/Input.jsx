import React from 'react';

// Design-system field — matches the course-builder scale: 13px text,
// soft #f7f8fa surface, lime focus ring, 10px uppercase label.
export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label className="block text-[10px] font-bold text-[#1b1e26]/45 uppercase tracking-[0.12em] mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg px-3 py-2 text-[13px] outline-none transition-all bg-[#f7f8fa] text-[#1b1e26] placeholder-gray-400 border ${
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200'
            : 'border-[#1b1e26]/10 focus:bg-white focus:border-[#d0f24a] focus:ring-2 focus:ring-[#d0f24a]/25'
        }`}
        {...props}
      />
      {error && (
        <span className="mt-1 text-[10px] text-red-500 font-medium">
          {error}
        </span>
      )}
    </div>
  );
};
