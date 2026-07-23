import React from 'react';

/**
 * Minimal ring spinner for inline button loading states.
 * Inherits `currentColor` so it works on lime, dark, and white surfaces.
 */
export const ButtonLoader = ({ size = 18, className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeOpacity="0.22"
    />
    <path
      d="M12 3a9 9 0 0 1 9 9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export default ButtonLoader;
