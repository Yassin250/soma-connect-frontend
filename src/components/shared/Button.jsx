import React from 'react';

// Design-system button — ink primary, lime accent, quiet neutrals.
// Kept intentionally compact: no oversized paddings, 13px max label.
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-[#1b1e26] text-white hover:bg-black shadow-sm',
    accent: 'bg-accent text-[#1b1e26] hover:bg-accent-hover shadow-sm',
    secondary: 'bg-[#1b1e26]/[0.06] text-[#1b1e26] hover:bg-[#1b1e26]/10',
    outline: 'bg-transparent border border-[#1b1e26]/15 text-[#1b1e26]/80 hover:bg-[#f7f8fa]',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'bg-transparent text-[#1b1e26]/60 hover:bg-[#1b1e26]/[0.06] hover:text-[#1b1e26]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[12px]',
    md: 'px-4 py-2 text-[13px]',
    lg: 'px-5 py-2 text-[13px]',
  };

  const selectedVariant = variants[variant] || variants.primary;
  const selectedSize = sizes[size] || sizes.md;

  return (
    <button
      className={`inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none ${selectedVariant} ${selectedSize} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
