import React, { useState, useEffect, useMemo, useRef } from 'react';
import { adminService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/shared/DataTable';

const columns = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    sortValue: (p) => p.name || '',
    render: (p) => (
      <span className="text-[13px] font-medium text-[#0A0A0A]">{p.name}</span>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    sortable: true,
    sortValue: (p) => p.description || '',
    render: (p) => <span className="text-gray-500 max-w-sm block">{p.description || '—'}</span>,
  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    sortValue: (p) => p.category || '',
    render: (p) => (
      <span className="px-2.5 py-1 bg-[#3D7FFF]/25 text-white rounded-full text-[11px] font-semibold">
        {p.category || 'General'}
      </span>
    ),
  },
  {
    key: 'active',
    header: 'Status',
    sortable: true,
    sortValue: (p) => (p.active ? 'Active' : 'Inactive'),
    render: (p) => (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
        p.active
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-gray-100 text-gray-500 border border-gray-200'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        {p.active ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Created At',
    sortable: true,
    sortValue: (p) => (p.createdAt ? new Date(p.createdAt).getTime() : 0),
    render: (p) => (
      <span className="text-gray-400">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</span>
    ),
  },
];

export const PermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await adminService.getPermissions();
        if (!cancelled) setPermissions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load permissions');
          toastRef.current.error(err.message || 'Failed to load permissions');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(
    () => [...new Set(permissions.map((p) => p.category).filter(Boolean))],
    [permissions]
  );

  const filteredPermissions = useMemo(
    () => permissions.filter((p) => {
      if (filterCategory !== 'All' && p.category !== filterCategory) return false;
      if (filterStatus !== 'All') {
        const active = filterStatus === 'Active';
        if (p.active !== active) return false;
      }
      if (filterDateFrom || filterDateTo) {
        const created = p.createdAt ? p.createdAt.slice(0, 10) : '';
        if (!created) return false;
        if (filterDateFrom && created < filterDateFrom) return false;
        if (filterDateTo && created > filterDateTo) return false;
      }
      return true;
    }),
    [permissions, filterCategory, filterStatus, filterDateFrom, filterDateTo]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[19px] font-medium text-[#0A0A0A] tracking-tight">Permissions</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">Fine-grained privileges that power every role.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#0A0A0A]/[0.06] shadow-sm p-4 w-fit max-w-full">
        <div className="flex flex-wrap items-end gap-3.5">
          <div className="w-[160px] flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#0A0A0A]/45 uppercase tracking-[0.12em]">Category</label>
            <select
              className="w-full text-[13px] px-3.5 py-2.5 rounded-xl border border-[#0A0A0A]/10 bg-[#f7f8fa] text-[#0A0A0A] hover:border-[#0A0A0A]/20 focus:bg-white focus:ring-4 focus:ring-[#3D7FFF]/20 focus:border-[#3D7FFF] focus:outline-none transition-all cursor-pointer"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="w-[160px] flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#0A0A0A]/45 uppercase tracking-[0.12em]">Status</label>
            <select
              className="w-full text-[13px] px-3.5 py-2.5 rounded-xl border border-[#0A0A0A]/10 bg-[#f7f8fa] text-[#0A0A0A] hover:border-[#0A0A0A]/20 focus:bg-white focus:ring-4 focus:ring-[#3D7FFF]/20 focus:border-[#3D7FFF] focus:outline-none transition-all cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="w-[180px] flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#0A0A0A]/45 uppercase tracking-[0.12em]">From</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#0A0A0A]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                aria-label="Created from"
                className="w-full text-[13px] pl-9 pr-3 py-2.5 rounded-xl border border-[#0A0A0A]/10 bg-[#f7f8fa] text-[#0A0A0A] hover:border-[#0A0A0A]/20 focus:bg-white focus:ring-4 focus:ring-[#3D7FFF]/20 focus:border-[#3D7FFF] focus:outline-none transition-all"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
          </div>
          <div className="w-[180px] flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#0A0A0A]/45 uppercase tracking-[0.12em]">To</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#0A0A0A]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                aria-label="Created to"
                className="w-full text-[13px] pl-9 pr-3 py-2.5 rounded-xl border border-[#0A0A0A]/10 bg-[#f7f8fa] text-[#0A0A0A] hover:border-[#0A0A0A]/20 focus:bg-white focus:ring-4 focus:ring-[#3D7FFF]/20 focus:border-[#3D7FFF] focus:outline-none transition-all"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>

          <span className="hidden sm:block w-px h-10 bg-[#0A0A0A]/[0.07] mx-0.5" />

          <button
            className="shrink-0 h-10 px-5 rounded-full bg-[#3D7FFF] text-white text-[13px] font-semibold hover:bg-[#63C7FF] shadow-sm transition-colors active:scale-[0.98]"
          >
            Apply
          </button>
          <button
            onClick={() => { setFilterCategory('All'); setFilterStatus('All'); setFilterDateFrom(''); setFilterDateTo(''); }}
            className="shrink-0 h-10 px-4 rounded-full border border-red-200 text-red-500 text-[13px] font-semibold hover:bg-red-50 hover:border-red-300 inline-flex items-center gap-1.5 transition-colors active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Clear All
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredPermissions}
        loading={isLoading}
        error={error}
        minWidth={780}
        skeletonRows={10}
        pageSize={10}
        rowLabel="permissions"
        emptyTitle="No permissions yet"
        emptyMessage="Permissions will appear here once configured on the server."
      />
    </div>
  );
};

export default PermissionsPage;