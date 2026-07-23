import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { logicalRect, logicalViewport } from '../../utils/rootZoom';

/**
 * Row action dock — a compact strip of icon buttons for table rows.
 * Each button shows an ink tooltip below it on hover (named group so it
 * doesn't collide with the row's own `group` hover styles).
 */
const ACTION_TONES = {
  ink: 'hover:text-[#1b1e26] hover:bg-[#d0f24a]/40',
  amber: 'hover:text-amber-600 hover:bg-amber-50',
  emerald: 'hover:text-emerald-600 hover:bg-emerald-50',
  gray: 'hover:text-[#1b1e26]/70 hover:bg-[#1b1e26]/[0.06]',
  rose: 'hover:text-rose-600 hover:bg-rose-50',
};

export const ActionButton = ({ label, tone = 'ink', onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`group/act relative w-8 h-8 rounded-lg flex items-center justify-center text-[#1b1e26]/40 transition-all duration-150 active:scale-90 ${ACTION_TONES[tone]}`}
  >
    {children}
    <span className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-md bg-[#1b1e26] px-2 py-1 text-[10px] font-semibold text-white opacity-0 group-hover/act:opacity-100 group-hover/act:translate-y-0 transition-all duration-150 z-20 shadow-lg">
      {label}
    </span>
  </button>
);

export const ActionDock = ({ children }) => (
  <div className="inline-flex items-center gap-0.5 rounded-xl border border-[#1b1e26]/[0.06] bg-white shadow-sm p-0.5">
    {children}
  </div>
);

export const ActionDivider = () => <span className="w-px h-4 bg-[#1b1e26]/10 mx-0.5" />;

/**
 * Split action button — the primary action stays one click away, everything
 * else lives in a dropdown behind the chevron segment.
 *
 *   <RowActionMenu
 *     primary={{ label: 'Edit', icon: DockIcons.edit, onClick }}
 *     items={[
 *       { label: 'Lock', icon: DockIcons.lock, iconTone: 'text-amber-500', onClick },
 *       'divider',
 *       { label: 'Delete', icon: DockIcons.trash, danger: true, onClick },
 *     ]}
 *   />
 *
 * The menu portals to <body> (so table overflow never clips it), closes on
 * outside click, Escape, scroll, and after any item runs.
 */
export const RowActionMenu = ({ primary, items = [] }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const controlRef = useRef(null);
  const menuRef = useRef(null);
  const MENU_WIDTH = 220;

  const close = () => setOpen(false);

  const updateMenuPosition = () => {
    if (!controlRef.current) return;
    // Measured rects are physical px, portal coordinates are logical (zoomed)
    // px — convert both the rect and the viewport into logical space.
    const rect = logicalRect(controlRef.current);
    const viewportPadding = 8;
    const viewportWidth = logicalViewport().width;
    const minLeft = window.scrollX + viewportPadding;
    const maxLeft = window.scrollX + viewportWidth - MENU_WIDTH - viewportPadding;
    const desiredLeft = rect.left + window.scrollX;
    setCoords({
      top: rect.bottom + window.scrollY + 8,
      left: Math.min(Math.max(desiredLeft, minLeft), Math.max(minLeft, maxLeft)),
    });
  };

  const toggle = () => {
    if (!open) updateMenuPosition();
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (controlRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    // Table/page scroll would desync the anchored menu — just close it.
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  const normalizedItems = (() => {
    const list = [...items];
    if (!primary) return list;
    const alreadyHasPrimary = list.some(
      (item) => item !== 'divider' && item.label?.toLowerCase() === primary.label?.toLowerCase()
    );
    if (alreadyHasPrimary) return list;
    return [{ label: primary.label, icon: primary.icon, onClick: primary.onClick }, ...list];
  })();

  return (
    <>
      <div
        ref={controlRef}
        className="inline-flex items-stretch rounded-lg shadow-sm overflow-hidden"
      >
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className={`inline-flex items-center gap-2 pl-3.5 pr-3 h-8 text-[13px] font-semibold rounded-lg transition-colors ${
            open
              ? 'bg-[#c4e83a] text-[#1b1e26]'
              : 'bg-[#d0f24a] text-[#1b1e26] hover:bg-[#c4e83a]'
          }`}
        >
          <span>Actions</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180 text-[#1b1e26]' : 'text-[#1b1e26]/70'}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ top: coords.top, left: coords.left, position: 'absolute' }}
          className="w-[220px] bg-white border border-[#1b1e26]/[0.08] rounded-xl shadow-[0_14px_34px_rgba(27,30,38,0.16)] py-1.5 z-[9999] animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-150"
        >
          {normalizedItems.map((item, i) =>
            item === 'divider' ? (
              <div key={`div-${i}`} className="my-1 border-t border-[#1b1e26]/[0.06]" />
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => { close(); item.onClick(); }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  item.danger
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-[#1b1e26]/75 hover:bg-[#f7f8fa] hover:text-[#1b1e26]'
                }`}
              >
                <span className={`[&>svg]:w-4 [&>svg]:h-4 ${item.danger ? 'text-rose-500' : item.iconTone || 'text-[#1b1e26]/45'}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            )
          )}
        </div>,
        document.body
      )}
    </>
  );
};

// 16px stroke icons for the dock
export const DockIcons = {
  edit: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  lock: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  unlock: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  power: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  ),
  shield: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
};
