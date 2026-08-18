import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { platformEntityService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/shared/DataTable';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { createPortal } from 'react-dom';

const filterFieldClass =
  'w-full text-[12.5px] px-3 py-1.5 rounded-lg border border-[#120E1A]/10 bg-[#f7f8fa] text-[#120E1A] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] focus:outline-none transition-all';

// Clickable status pill — green when active, neutral when suspended. Toggles on click.
const StatusPill = ({ active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all hover:scale-[1.03] active:scale-[0.97] ${
      active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-[#120E1A]/[0.05] text-[#120E1A]/45 hover:bg-[#120E1A]/10'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-[#120E1A]/30'}`} />
    {active ? 'Active' : 'Suspended'}
  </button>
);

/** Platform-wide institution directory — mirrors the Courses page design. */
export const EntitiesPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'UNIVERSITY', name: '', code: '', address: '', contactPersonPhone: '', contactPersonEmail: '', website: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch a wide page so the table can sort / filter / paginate client-side.
      const result = await platformEntityService.list({ page: 0, size: 500 });
      const list = Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : [];
      setEntities(list);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (entity) => {
    const next = !entity.active;
    if (!window.confirm(`${next ? 'Activate' : 'Suspend'} "${entity.name}"?`)) return;
    try {
      await platformEntityService.setStatus(entity.id, next);
      toast.success(`Entity ${next ? 'activated' : 'suspended'}`);
      await load();
    } catch (err) { toast.error(err.message); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await platformEntityService.create(form);
      toast.success('Entity created successfully');
      setShowModal(false);
      setForm({ type: 'UNIVERSITY', name: '', code: '', address: '', contactPersonPhone: '', contactPersonEmail: '', website: '' });
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const typeOptions = useMemo(
    () => [...new Set(entities.map((e) => e.type).filter(Boolean))].sort((a, b) => a.localeCompare(b)).map((t) => ({ value: t, label: t })),
    [entities]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entities.filter((e) => {
      if (typeFilter !== 'ALL' && e.type !== typeFilter) return false;
      if (statusFilter === 'ACTIVE' && !e.active) return false;
      if (statusFilter === 'SUSPENDED' && e.active) return false;
      if (!q) return true;
      return (e.name || '').toLowerCase().includes(q) || (e.code || '').toLowerCase().includes(q);
    });
  }, [entities, search, typeFilter, statusFilter]);

  const columns = [
    {
      key: 'name', header: 'Entity', sortable: true, sortValue: (e) => e.name || '',
      render: (e) => (
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#120E1A] to-[#1a1025] text-[#8B5CF6] text-[13px] font-semibold flex items-center justify-center shrink-0">
            {(e.name || '?').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[#120E1A]/90 truncate max-w-[240px]">{e.name}</p>
            <p className="text-[11px] text-gray-400 font-mono truncate">{e.code || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type', header: 'Type', sortable: true, sortValue: (e) => e.type || '',
      render: (e) => <span className="text-[13px] text-[#120E1A]/70">{e.type || '—'}</span>,
    },
    {
      key: 'contact', header: 'Contact', sortable: false,
      render: (e) => (
        <div className="min-w-0">
          <p className="text-[13px] text-[#120E1A]/80 truncate max-w-[220px]">{e.contactPersonEmail || '—'}</p>
          <p className="text-[11px] text-gray-400 truncate">{e.contactPersonPhone || '—'}</p>
        </div>
      ),
    },
    {
      key: 'users', header: 'Users', sortable: true, sortValue: (e) => e.userCount ?? 0,
      render: (e) => (
        <button
          onClick={() => navigate(`/admin/entities/${e.id}/users`)}
          title={`View the ${e.userCount ?? 0} user${(e.userCount ?? 0) === 1 ? '' : 's'} in ${e.name}`}
          className="inline-flex items-center gap-1.5 min-w-[1.75rem] h-7 pl-2.5 pr-2 rounded-full bg-[#8B5CF6] text-white text-[11px] font-bold shadow-sm hover:bg-[#C4B5FD] transition-all group"
        >
          {e.userCount ?? 0}
          <svg className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true, sortValue: (e) => (e.active ? 1 : 0),
      render: (e) => <StatusPill active={e.active} onClick={() => toggleStatus(e)} />,
    },
    {
      key: 'actions', header: 'Actions', width: '120px',
      render: (e) => (
        <div className="flex justify-end">
          <RowActionMenu
            primary={
              e.active
                ? { label: 'Suspend', icon: DockIcons.power, onClick: () => toggleStatus(e) }
                : { label: 'Activate', icon: DockIcons.power, iconTone: 'text-emerald-500', onClick: () => toggleStatus(e) }
            }
            items={[]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Institutions</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1 text-[#120E1A]">Registered Entities</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Every school and institution registered on the platform{entities.length ? ` — ${entities.length} total` : ''}.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="shrink-0 px-4 py-2 rounded-xl bg-[#120E1A] text-white text-sm font-semibold hover:bg-black transition-colors"
        >
          Create Entity
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-[#120E1A]/[0.06] shadow-sm px-3 py-2.5 flex flex-wrap items-end gap-x-2.5 gap-y-2">
        {/* Search */}
        <div className="w-[260px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">Search</label>
          <div className="relative">
            <svg className="w-4 h-4 text-[#120E1A]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${filterFieldClass} pl-9`}
            />
          </div>
        </div>

        {/* Type */}
        <div className="w-[170px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">Type</label>
          <select className={`${filterFieldClass} cursor-pointer`} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">All types</option>
            {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Status */}
        <div className="w-[140px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">Status</label>
          <select className={`${filterFieldClass} cursor-pointer`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {/* Spacer + Reset */}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => { setSearch(''); setTypeFilter('ALL'); setStatusFilter('ALL'); }}
          className="text-[#120E1A]/60 text-[12.5px] font-medium px-4 py-1.5 rounded-lg border border-[#120E1A]/10 hover:bg-[#f7f8fa] transition-colors"
        >
          Reset
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={visible}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={860}
        skeletonRows={10}
        pageSize={10}
        rowLabel="entities"
        emptyTitle={entities.length === 0 ? 'No entities yet' : 'No matches'}
        emptyMessage={
          entities.length === 0
            ? 'Institutions appear here as they register on the platform.'
            : 'No entities match the current filters.'
        }
      />

      {/* Create Entity Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#120E1A]">Create Entity</h2>
              <button onClick={() => !submitting && setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#120E1A] flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#120E1A]/60 uppercase tracking-[0.1em]">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#120E1A] focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all"
                    required
                  >
                    <option value="PRIMARY" className="text-[#120E1A]">Primary</option>
                    <option value="SECONDARY" className="text-[#120E1A]">Secondary</option>
                    <option value="UNIVERSITY" className="text-[#120E1A]">University</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#120E1A]/60 uppercase tracking-[0.1em]">Code</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#120E1A] focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all"
                    placeholder="e.g. SOMA-U"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#120E1A]/60 uppercase tracking-[0.1em]">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#120E1A] focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all"
                  placeholder="Institution name"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#120E1A]/60 uppercase tracking-[0.1em]">Contact Person Email</label>
                <input
                  type="email"
                  value={form.contactPersonEmail}
                  onChange={(e) => setForm((p) => ({ ...p, contactPersonEmail: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#120E1A] focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all"
                  placeholder="admin@institution.edu"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#120E1A]/60 uppercase tracking-[0.1em]">Contact Person Phone</label>
                <input
                  type="text"
                  value={form.contactPersonPhone}
                  onChange={(e) => setForm((p) => ({ ...p, contactPersonPhone: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#120E1A] focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all"
                  placeholder="+1234567890"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#120E1A]/60 uppercase tracking-[0.1em]">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#120E1A] focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all"
                  placeholder="Street, city, country"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#120E1A]/60 uppercase tracking-[0.1em]">Website</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#120E1A] focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all"
                  placeholder="https://institution.edu"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#120E1A] text-white text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating…' : 'Create Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EntitiesPage;
