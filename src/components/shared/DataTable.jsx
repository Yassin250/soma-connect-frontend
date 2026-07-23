import React, { useState, useEffect, useMemo, useRef } from 'react';

const alignClass = (a) =>
  a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

// Build a compact page-number list with ellipses: 1 … 4 5 6 … 25
const pageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out = [1];
  if (current > 3) out.push('…');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) out.push(i);
  if (current < total - 2) out.push('…');
  out.push(total);
  return out;
};

// Type-aware comparator: numbers numerically, everything else natural (numeric) locale sort.
const compare = (a, b) => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

// "SELF_PACED" → "Self Paced" — fallback label for auto-derived filter options.
const humanizeValue = (v) =>
  String(v).replace(/[_-]+/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Stacked up/down chevrons; the active direction is inked, the other faint.
const SortIcon = ({ state }) => (
  <span className="inline-flex flex-col -space-y-[3px] leading-none">
    <svg className={`w-2.5 h-2.5 ${state === 'asc' ? 'text-[#1b1e26]' : 'text-[#1b1e26]/25'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l5 6H7z" /></svg>
    <svg className={`w-2.5 h-2.5 ${state === 'desc' ? 'text-[#1b1e26]' : 'text-[#1b1e26]/25'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-5-6h10z" /></svg>
  </span>
);

/**
 * Enterprise-grade data table — sticky header, click-to-sort columns, shimmer
 * skeletons, lime accents, client-side pagination, and an optional toolbar slot.
 *
 * columns: [{ key, header, render?, width?, align?, sortable?, sortValue?, ... }]
 *  - sortable: true          → header becomes clickable
 *  - sortValue: (row)=>value → what to sort on (defaults to row[key])
 */
export const DataTable = ({
  columns,
  rows = [],
  keyField = 'id',
  loading = false,
  error = '',
  emptyTitle = 'Nothing here yet',
  emptyMessage = 'No records found.',
  minWidth = 960,
  title,
  subtitle,
  toolbar,
  footer,
  stickyHeader = true,
  skeletonRows = 8,
  showRowCount = true,
  pageSize = 0,
  rowLabel = 'records',
  dense = false,
  filters = [],
  className = '',
}) => {
  const cellPad = dense ? 'px-3.5 py-2' : 'px-4 py-2.5';
  const headPad = dense ? 'px-3.5 py-2' : 'px-4 py-2.5';
  const orderedColumns = useMemo(() => {
    const actionColumns = [];
    const nonActionColumns = [];
    columns.forEach((column) => {
      if (String(column.key || '').toLowerCase() === 'actions') actionColumns.push(column);
      else nonActionColumns.push(column);
    });
    return [...actionColumns, ...nonActionColumns];
  }, [columns]);

  // ── Filters — collapsible facet dock (no modal) ─────────────
  // filters: [{ key, label?, getValue?, options?: [{value,label}|string] }]
  // Options are auto-derived from the data when omitted. Selections within a
  // group are OR'd; groups are AND'd together.
  const hasFilters = Array.isArray(filters) && filters.length > 0;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterSel, setFilterSel] = useState({}); // { key: Set<string> }

  const normFilters = useMemo(() => {
    if (!hasFilters) return [];
    return filters.map((f) => {
      const getValue = f.getValue || ((row) => row[f.key]);
      let options = f.options;
      if (!options || options.length === 0) {
        const seen = new Map();
        rows.forEach((row) => {
          const v = getValue(row);
          if (v === null || v === undefined || v === '') return;
          const s = String(v);
          if (!seen.has(s)) seen.set(s, { value: s, label: humanizeValue(s) });
        });
        options = [...seen.values()].sort((a, b) => a.label.localeCompare(b.label)).slice(0, 12);
      } else {
        options = options.map((o) => (typeof o === 'object' ? { ...o, value: String(o.value) } : { value: String(o), label: humanizeValue(o) }));
      }
      return { key: f.key, label: f.label || humanizeValue(f.key), getValue, options };
    });
  }, [filters, rows, hasFilters]);

  const toggleFilterValue = (key, value) =>
    setFilterSel((prev) => {
      const set = new Set(prev[key] || []);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...prev, [key]: set };
    });
  const clearFilters = () => setFilterSel({});
  const activeCount = useMemo(
    () => Object.values(filterSel).reduce((n, s) => n + (s?.size || 0), 0),
    [filterSel]
  );

  const filteredRows = useMemo(() => {
    if (!hasFilters || activeCount === 0) return rows;
    return rows.filter((row) =>
      normFilters.every((f) => {
        const sel = filterSel[f.key];
        if (!sel || sel.size === 0) return true;
        return sel.has(String(f.getValue(row)));
      })
    );
  }, [rows, normFilters, filterSel, hasFilters, activeCount]);

  // Live facet count: how many rows an option would surface, honouring every
  // OTHER group's selection (classic faceted-search behaviour).
  const facetCount = (f, opt) =>
    rows.reduce((n, row) => {
      if (String(f.getValue(row)) !== opt.value) return n;
      const passesOthers = normFilters.every((g) => {
        if (g.key === f.key) return true;
        const sel = filterSel[g.key];
        if (!sel || sel.size === 0) return true;
        return sel.has(String(g.getValue(row)));
      });
      return passesOthers ? n + 1 : n;
    }, 0);

  // ── Sorting ─────────────────────────────────────────────────
  const [sort, setSort] = useState({ key: null, dir: null });
  const toggleSort = (col) => {
    if (!col.sortable) return;
    setSort((s) =>
      s.key !== col.key ? { key: col.key, dir: 'asc' } : s.dir === 'asc' ? { key: col.key, dir: 'desc' } : { key: null, dir: null }
    );
  };
  const sortedRows = useMemo(() => {
    if (!sort.key) return filteredRows;
    const col = orderedColumns.find((c) => c.key === sort.key);
    if (!col) return filteredRows;
    const getVal = col.sortValue || ((r) => r[col.key]);
    const arr = [...filteredRows].sort((a, b) => compare(getVal(a), getVal(b)));
    return sort.dir === 'desc' ? arr.reverse() : arr;
  }, [filteredRows, sort, orderedColumns]);

  // ── Pagination ──────────────────────────────────────────────
  const paginate = pageSize > 0;
  const total = sortedRows.length;
  const totalPages = paginate ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const [page, setPage] = useState(1);
  const current = Math.min(Math.max(1, page), totalPages);
  // Snap back to the first page whenever the underlying set changes (e.g. filters)
  useEffect(() => { setPage(1); }, [total]);
  const go = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  const startIdx = paginate ? (current - 1) * pageSize : 0;
  const visibleRows = paginate ? sortedRows.slice(startIdx, startIdx + pageSize) : sortedRows;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = paginate ? Math.min(startIdx + pageSize, total) : total;

  const hasFooter = error || footer || (paginate && total > 0) || (showRowCount && !loading && total > 0);

  // ── Horizontal scroll cues ──────────────────────────────────
  // Fade the edges when the table is wider than its container, so the overflow
  // reads as "scroll for more" instead of a broken cut-off.
  const scrollRef = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const updateEdges = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ left: el.scrollLeft > 1, right: max > 1 && el.scrollLeft < max - 1 });
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateEdges();
    // Re-measure after layout settles (fonts/reflow), on scroll, and on resize.
    const raf = requestAnimationFrame(updateEdges);
    const ro = 'ResizeObserver' in window ? new ResizeObserver(updateEdges) : null;
    if (ro) ro.observe(el);
    el.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      el.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, visibleRows.length, orderedColumns.length, loading]);

  return (
    <div
      className={`bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-[0_1px_3px_rgba(27,30,38,0.04),0_8px_24px_rgba(27,30,38,0.04)] overflow-hidden ${className}`}
    >
      {(title || subtitle || toolbar || hasFilters) && (
        <div className="border-b border-[#1b1e26]/[0.05] bg-gradient-to-r from-white to-[#f9fbf3]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              {title && <h3 className="text-sm font-semibold text-[#1b1e26] tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              {/* Collapsed recap — active selections stay visible and removable */}
              {hasFilters && !filtersOpen && activeCount > 0 && (
                <div className="hidden md:flex items-center gap-1 flex-wrap max-w-[360px]">
                  {normFilters.flatMap((f) =>
                    [...(filterSel[f.key] || [])].map((v) => {
                      const opt = f.options.find((o) => o.value === v);
                      return (
                        <button
                          key={`${f.key}:${v}`}
                          type="button"
                          onClick={() => toggleFilterValue(f.key, v)}
                          title={`Remove ${f.label}: ${opt?.label ?? v}`}
                          className="group/chip inline-flex items-center gap-1 h-6 pl-2 pr-1.5 rounded-full bg-[#d0f24a]/25 text-[#1b1e26] text-[11px] font-semibold hover:bg-[#d0f24a]/45 transition-colors"
                        >
                          {opt?.label ?? v}
                          <svg className="w-2.5 h-2.5 opacity-40 group-hover/chip:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => setFiltersOpen((o) => !o)}
                  aria-expanded={filtersOpen}
                  className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold border transition-all duration-200 ${
                    filtersOpen
                      ? 'bg-[#1b1e26] text-white border-[#1b1e26] shadow-sm'
                      : activeCount > 0
                        ? 'bg-white text-[#1b1e26] border-[#d0f24a] ring-2 ring-[#d0f24a]/20'
                        : 'bg-white text-[#1b1e26]/70 border-[#1b1e26]/10 hover:text-[#1b1e26] hover:bg-[#f7f8fa]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 6h16M7 12h10M10 18h4" />
                  </svg>
                  Filters
                  {activeCount > 0 && (
                    <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums ${filtersOpen ? 'bg-[#d0f24a] text-[#1b1e26]' : 'bg-[#1b1e26] text-[#d0f24a]'}`}>
                      {activeCount}
                    </span>
                  )}
                  <svg className={`w-3 h-3 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              )}
              {toolbar && <div className="shrink-0">{toolbar}</div>}
            </div>
          </div>

          {/* Filter dock — accordion, expands in place like an FAQ entry */}
          {hasFilters && (
            <div className={`grid transition-all duration-300 ease-in-out ${filtersOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden min-h-0">
                <div className="mx-4 mb-3 rounded-xl border border-[#1b1e26]/[0.06] bg-white/70 px-4 py-3 flex flex-wrap items-start gap-x-8 gap-y-3">
                  {normFilters.filter((f) => f.options.length > 0).map((f) => (
                    <div key={f.key} className="min-w-[150px]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1b1e26]/40 mb-1.5">{f.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.options.map((opt) => {
                          const on = !!filterSel[f.key]?.has(opt.value);
                          const n = facetCount(f, opt);
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => toggleFilterValue(f.key, opt.value)}
                              className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-semibold border transition-all duration-150 ${
                                on
                                  ? 'bg-[#d0f24a] border-[#d0f24a] text-[#1b1e26] shadow-sm'
                                  : 'bg-white border-[#1b1e26]/10 text-[#1b1e26]/60 hover:border-[#d0f24a] hover:text-[#1b1e26]'
                              }`}
                            >
                              {on && (
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              )}
                              {opt.label}
                              <span className={`text-[10px] tabular-nums ${on ? 'text-[#1b1e26]/50' : 'text-[#1b1e26]/30'}`}>{n}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {activeCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="ml-auto self-start inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[12px] font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
                      Reset all
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <div ref={scrollRef} className="overflow-x-auto overscroll-x-contain">
          <table className="w-full border-collapse" style={{ minWidth }}>
          <thead className={stickyHeader ? 'sticky top-0 z-10' : undefined}>
            <tr className="bg-[#f4f6f8] border-b border-[#1b1e26]/[0.06]">
              {orderedColumns.map((c) => {
                const isSorted = sort.key === c.key;
                return (
                  <th
                    key={c.key}
                    style={c.width ? { width: c.width } : undefined}
                    onClick={() => toggleSort(c)}
                    className={`${headPad} text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap ${alignClass(c.align)} ${
                      isSorted ? 'text-[#1b1e26]/70' : 'text-[#1b1e26]/45'
                    } ${c.sortable ? 'cursor-pointer select-none hover:text-[#1b1e26]/70 transition-colors' : ''} ${c.headerClass || ''}`}
                  >
                    <span className={`inline-flex items-center gap-1.5 ${c.align === 'right' ? 'flex-row-reverse' : ''}`}>
                      {c.header}
                      {c.sortable && <SortIcon state={isSorted ? sort.dir : null} />}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b1e26]/[0.04]">
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="bg-white">
                  {orderedColumns.map((c) => (
                    <td key={c.key} className={cellPad}>
                      <div
                        className="h-3 rounded-full skeleton-shimmer"
                        style={{ width: `${38 + ((i * 11 + c.key.length * 5) % 42)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : total === 0 ? (
              <tr>
                <td colSpan={orderedColumns.length} className="px-5 py-14">
                  <div className="flex flex-col items-center text-center max-w-sm mx-auto">
                    <span className="w-12 h-12 rounded-2xl bg-[#d0f24a]/20 text-[#1b1e26]/70 flex items-center justify-center mb-3 ring-1 ring-[#d0f24a]/30">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        {activeCount > 0 ? (
                          <><path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" /><circle cx="18" cy="17" r="4" /><path d="M16.5 15.5l3 3M19.5 15.5l-3 3" strokeLinecap="round" /></>
                        ) : (
                          <><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 10h18M9 4v16" strokeLinecap="round" /></>
                        )}
                      </svg>
                    </span>
                    <p className="text-sm font-semibold text-[#1b1e26]">{activeCount > 0 ? 'No matches for these filters' : emptyTitle}</p>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                      {activeCount > 0 ? 'Loosen or reset the active filters to see more records.' : emptyMessage}
                    </p>
                    {activeCount > 0 && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-3 inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-semibold bg-[#1b1e26] text-[#d0f24a] hover:bg-black transition-colors"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              visibleRows.map((row, rowIndex) => (
                <tr
                  key={row[keyField]}
                  className="group bg-white transition-colors duration-150 hover:bg-[#d0f24a]/[0.08]"
                >
                  {orderedColumns.map((c) => (
                    <td
                      key={c.key}
                      className={`${cellPad} text-[13px] text-[#1b1e26]/80 align-middle ${alignClass(c.align)} ${c.cellClass || ''}`}
                    >
                      {c.render ? c.render(row) : (row[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
        {/* Edge fades — only visible while there is more to scroll toward */}
        <div className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#1b1e26]/[0.07] to-transparent transition-opacity duration-200 ${edges.left ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#1b1e26]/[0.07] to-transparent transition-opacity duration-200 ${edges.right ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {hasFooter ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-2.5 border-t border-[#1b1e26]/[0.06] bg-[#f4f5f7]">
          {error ? (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          ) : (
            <p className="text-xs text-gray-500">
              Showing <span className="font-semibold text-[#1b1e26] tabular-nums">{showingFrom}</span>
              {paginate && <> to <span className="font-semibold text-[#1b1e26] tabular-nums">{showingTo}</span></>}{' '}
              of <span className="font-semibold text-[#1b1e26] tabular-nums">{total}</span>{' '}
              {total === 1 ? rowLabel.replace(/s$/, '') : rowLabel}
              {activeCount > 0 && rows.length !== total && (
                <> · filtered from <span className="font-semibold text-[#1b1e26] tabular-nums">{rows.length}</span></>
              )}
            </p>
          )}

          {paginate && totalPages > 1 && !error && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => go(current - 1)}
                disabled={current === 1}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#1b1e26]/45 hover:text-[#1b1e26]/70 disabled:opacity-25 disabled:hover:text-[#1b1e26]/45 transition-colors"
                aria-label="Previous page"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>

              {pageList(current, totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-[#1b1e26]/25 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => go(p)}
                    className={`min-w-7 h-7 px-2 rounded-full text-[13px] font-semibold tabular-nums transition-colors ${
                      p === current ? 'bg-[#1b1e26] text-white shadow-md' : 'text-[#1b1e26]/65 hover:text-[#1b1e26]'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => go(current + 1)}
                disabled={current === totalPages}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#1b1e26]/45 hover:text-[#1b1e26]/70 disabled:opacity-25 disabled:hover:text-[#1b1e26]/45 transition-colors"
                aria-label="Next page"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          )}

          {footer && <div className="text-xs text-gray-500">{footer}</div>}
        </div>
      ) : null}
    </div>
  );
};

export default DataTable;
