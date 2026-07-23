import React from 'react';
import logoWide from '../../assets/2.png';

// The brand assets bundle the icon + "Soma Connect" wordmark in one image, so
// we crop to just the icon glyph. Its exact bounds in the wide logo
// (2.png, 1388×302) are x:[31,252], y:[47,254] — the text only begins at x:302.
// A uniform mask-size of 600% maps a ~231px window onto the chip and, positioned
// at 2%/center, lands the glyph dead-centre with ~4% padding and no text. The
// values are percentages relative to the box, so the crop is size-independent.
const ICON_MASK = {
  maskImage: `url(${logoWide})`,
  WebkitMaskImage: `url(${logoWide})`,
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskSize: '600% auto',
  WebkitMaskSize: '600% auto',
  maskPosition: '2% center',
  WebkitMaskPosition: '2% center',
};

/**
 * The lime chip containing ONLY the brand icon (no wordmark text).
 * @param {number} size  chip size in px
 * @param {string} iconColor  tailwind bg-* class for the tinted glyph (default dark ink)
 */
export const BrandMark = ({ size = 40, iconColor = 'bg-[#1b1e26]', className = '' }) => (
  <span
    className={`rounded-xl bg-[#d0f24a] flex items-center justify-center shrink-0 shadow-sm ${className}`}
    style={{ width: size, height: size }}
  >
    <span
      className={iconColor}
      style={{ width: Math.round(size * 0.7), height: Math.round(size * 0.7), ...ICON_MASK }}
      role="img"
      aria-label="Soma Connect"
    />
  </span>
);

/**
 * Icon chip + optional "Soma Connect" wordmark text beside it.
 * @param {boolean} dark  render the wordmark in ink (for light backgrounds)
 * @param {boolean} hideText  show only the icon chip
 */
export const BrandLockup = ({ dark = false, hideText = false, size = 40 }) => (
  <div className="flex items-center gap-2.5">
    <BrandMark size={size} />
    {!hideText && (
      <span className={`text-lg font-semibold tracking-tight whitespace-nowrap ${dark ? 'text-[#1b1e26]' : 'text-white'}`}>
        Soma Connect
      </span>
    )}
  </div>
);

export default BrandLockup;
