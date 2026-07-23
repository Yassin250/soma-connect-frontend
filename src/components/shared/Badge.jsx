import React from 'react';

// Status badge — semantic tones on the ink/lime system (no blue).
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-[#1b1e26]/[0.05] text-[#1b1e26]/70 border-[#1b1e26]/10',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-[#d0f24a]/20 text-[#5b6b12] border-[#d0f24a]/40',
    outline: 'bg-transparent text-[#1b1e26]/60 border-[#1b1e26]/15',
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
};
