import React from 'react';

// Shared filter toolbar for the admin curriculum pages — labelled dropdowns in a
// white card, matching the Courses / Categories pages. Keeps every list page's
// filter UI identical.

export const FilterSelect = ({ label, value, onChange, options, width = 'w-[150px]', allLabel = 'All' }) => (
  <div className={`${width} flex flex-col gap-1`}>
    <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#120E1A]/10 bg-[#f7f8fa] text-[#120E1A] cursor-pointer focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] focus:outline-none transition-all"
    >
      <option value="ALL">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

export const SearchField = ({ value, onChange, placeholder = 'Search…', width = 'w-[240px]' }) => (
  <div className={`${width} flex flex-col gap-1`}>
    <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">Search</label>
    <div className="relative">
      <svg className="w-4 h-4 text-[#120E1A]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[13px] px-3 py-2 pl-9 rounded-lg border border-[#120E1A]/10 bg-[#f7f8fa] text-[#120E1A] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] focus:outline-none transition-all"
      />
    </div>
  </div>
);

export const FilterToolbar = ({ children, onReset, showReset = false }) => (
  <div className="bg-white rounded-2xl border border-[#120E1A]/[0.06] shadow-sm p-3 flex flex-wrap items-end gap-3">
    {children}
    {showReset && (
      <>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onReset}
          className="text-[#120E1A]/60 text-[13px] font-semibold px-4 py-2 rounded-lg border border-[#120E1A]/10 hover:bg-[#f7f8fa] transition-colors"
        >
          Reset
        </button>
      </>
    )}
  </div>
);
