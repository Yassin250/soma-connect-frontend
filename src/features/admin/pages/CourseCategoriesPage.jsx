import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { courseCategoryService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/shared/DataTable';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { ConfirmDeleteModal } from '../components/CurriculumModals';

const inputClass =
  'w-full rounded-xl bg-[#f7f8fa] border border-[#120E1A]/10 px-3.5 py-2.5 text-sm text-[#120E1A] placeholder-gray-400 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/20 focus:outline-none transition-all';
const labelClass = 'block text-[10px] font-bold text-[#120E1A]/45 uppercase tracking-[0.14em] mb-1.5';

const StatusPill = ({ active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all hover:scale-[1.03] active:scale-[0.97] ${
      active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-[#120E1A]/[0.05] text-[#120E1A]/45 hover:bg-[#120E1A]/10'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-[#120E1A]/30'}`} />
    {active ? 'Active' : 'Inactive'}
  </button>
);

// Confirm dialog for flipping a category's active state — a labelled toggle
// switch plus the standard Cancel/Confirm pair, on the ink/lime palette.
const StatusToggleModal = ({ category, onClose, onConfirm }) => {
  const [saving, setSaving] = useState(false);
  if (!category) return null;
  const willActivate = !category.active;

  const confirm = async () => {
    setSaving(true);
    try {
      await onConfirm(category);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#120E1A]/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} role="presentation">
      <div
        className="relative w-full max-w-[420px] bg-white rounded-3xl border border-[#120E1A]/[0.06] shadow-[0_20px_60px_rgba(18,14,26,0.25)] animate-in zoom-in-95 fade-in duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#120E1A] tracking-tight">{willActivate ? 'Activate' : 'Deactivate'}</h3>
            <span className="block w-8 h-[3px] rounded-full bg-[#8B5CF6] mt-1.5" />
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 border-t border-b border-[#120E1A]/[0.06] bg-[#f9fbf3]">
          <p className="text-[14px] text-[#120E1A]/70 text-center leading-relaxed">
            Are you sure you want to {willActivate ? 'activate' : 'deactivate'}{' '}
            <span className="font-bold text-[#120E1A]">"{category.name}"</span>?
          </p>

          <div className="flex items-center justify-center gap-3 mt-5">
            <span className={`text-[13px] font-semibold ${!willActivate ? 'text-[#120E1A]' : 'text-[#120E1A]/35'}`}>Inactive</span>
            <button
              type="button"
              onClick={confirm}
              disabled={saving}
              aria-label={willActivate ? 'Activate' : 'Deactivate'}
              className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-60 ${willActivate ? 'bg-[#120E1A]/15' : 'bg-[#8B5CF6]'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${willActivate ? 'left-1' : 'left-6'}`} />
            </button>
            <span className={`text-[13px] font-semibold ${willActivate ? 'text-[#120E1A]' : 'text-[#120E1A]/35'}`}>Active</span>
          </div>
        </div>

        <div className="flex justify-center gap-2.5 px-6 py-4">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-[13px] font-semibold text-[#120E1A]/70 border border-[#120E1A]/10 hover:bg-[#f3f4f6] transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={saving}
            className="px-6 py-2 rounded-xl text-[13px] font-bold bg-[#120E1A] text-white hover:bg-black transition-colors active:scale-[0.98] shadow-sm disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const CategoryModal = ({ open, editing, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(editing?.name || '');
    setDescription(editing?.description || '');
    setSortOrder(editing?.sortOrder != null ? String(editing.sortOrder) : '');
    setError('');
  }, [open, editing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        sortOrder: sortOrder === '' ? null : Number(sortOrder),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#120E1A]/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} role="presentation">
      <div
        className="relative w-full max-w-[480px] bg-white rounded-3xl border border-[#120E1A]/[0.06] shadow-[0_20px_60px_rgba(18,14,26,0.25)] p-6 sm:p-8 animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-[#120E1A]/40 hover:text-[#120E1A] hover:bg-[#f3f4f6] transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
        </button>

        <div className="mb-6 pr-8">
          <span className="w-11 h-11 rounded-2xl bg-[#8B5CF6]/25 text-[#120E1A] flex items-center justify-center mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 011.4.6l7 7a2 2 0 010 2.8l-5.6 5.6a2 2 0 01-2.8 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
          </span>
          <h3 className="text-xl font-semibold text-[#120E1A] tracking-tight">{editing ? 'Update category' : 'New category'}</h3>
          <p className="text-sm text-gray-500 mt-1">Categories group courses across every institution (e.g. PMP, AI Development).</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AI Development" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional — what belongs in this category" className={`${inputClass} resize-none`} />
          </div>
          <div className="w-[140px]">
            <label className={labelClass}>Sort order</label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder="0" className={inputClass} />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}

          <div className="pt-2 flex justify-end gap-2.5">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#120E1A]/70 border border-[#120E1A]/10 hover:bg-[#f3f4f6] transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#8B5CF6] text-white hover:bg-[#C4B5FD] transition-colors active:scale-[0.98] shadow-sm disabled:opacity-60">
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export const CourseCategoriesPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusModalCategory, setStatusModalCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseCategoryService.listAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (payload) => {
    if (editing) {
      await courseCategoryService.update(editing.id, payload);
      toast.success('Category updated');
    } else {
      await courseCategoryService.create(payload);
      toast.success('Category created');
    }
    setModalOpen(false);
    setEditing(null);
    await load();
  };

  const toggleStatus = async (c) => {
    try {
      await courseCategoryService.setStatus(c.id, !c.active);
      toast.success('Category status updated');
      setStatusModalCategory(null);
      await load();
    } catch (err) { toast.error(err.message); }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await courseCategoryService.remove(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      await load();
    } catch (err) { toast.error(err.message); }
  };

  const columns = [
    {
      key: 'name', header: 'Name', sortable: true, sortValue: (c) => c.name || '',
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-[#8B5CF6]/25 text-[#120E1A] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 011.4.6l7 7a2 2 0 010 2.8l-5.6 5.6a2 2 0 01-2.8 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
          </span>
          <span className="font-medium text-[#120E1A]">{c.name}</span>
        </div>
      ),
    },
    {
      key: 'description', header: 'Description', sortable: true, sortValue: (c) => c.description || '',
      render: (c) => <span className="text-gray-500 max-w-md truncate block">{c.description || '—'}</span>,
    },
    {
      key: 'courseCount', header: 'Courses', sortable: true, sortValue: (c) => c.courseCount,
      render: (c) => (
        c.courseCount > 0 ? (
          <button
            onClick={() => navigate(`/admin/courses?category=${encodeURIComponent(c.name)}`)}
            title={`View the ${c.courseCount} course${c.courseCount === 1 ? '' : 's'} in ${c.name}`}
            className="inline-flex items-center gap-1.5 min-w-[1.75rem] h-7 pl-2.5 pr-2 rounded-full bg-[#8B5CF6] text-white text-[11px] font-bold shadow-sm hover:bg-[#C4B5FD] transition-all group"
          >
            {c.courseCount}
            <svg className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        ) : (
          <span className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full bg-[#120E1A]/[0.06] text-[#120E1A]/40 text-[11px] font-bold">0</span>
        )
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true, sortValue: (c) => (c.active ? 1 : 0),
      render: (c) => <StatusPill active={c.active} onClick={() => setStatusModalCategory(c)} />,
    },
    {
      key: 'actions', header: 'Actions', width: '120px',
      render: (c) => (
        <div className="flex justify-end">
          <RowActionMenu
            primary={{ label: 'Edit', icon: DockIcons.edit, onClick: () => { setEditing(c); setModalOpen(true); } }}
            items={[
              c.active
                ? { label: 'Deactivate', icon: DockIcons.power, onClick: () => toggleStatus(c) }
                : { label: 'Activate', icon: DockIcons.power, iconTone: 'text-emerald-500', onClick: () => toggleStatus(c) },
              'divider',
              { label: 'Delete', icon: DockIcons.trash, danger: true, onClick: () => setDeleteTarget(c) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Academic Oversight</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1 text-[#120E1A]">Course Categories</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">The shared taxonomy institutions pick from when creating courses.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="bg-[#120E1A] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-black transition-colors inline-flex items-center gap-2 shadow-sm active:scale-[0.98] shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
          Add Category
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-[#120E1A]/[0.06] shadow-sm px-3 py-2.5 flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="w-[240px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">Search</label>
          <div className="relative">
            <svg className="w-4 h-4 text-[#120E1A]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Name or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-[13px] px-3 py-2 pl-9 rounded-lg border border-[#120E1A]/10 bg-[#f7f8fa] text-[#120E1A] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="w-[130px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">Status</label>
          <select
            className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#120E1A]/10 bg-[#f7f8fa] text-[#120E1A] cursor-pointer focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] focus:outline-none transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Date From */}
        <div className="w-[180px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">From</label>
          <div className="relative">
            <svg className="w-4 h-4 text-[#120E1A]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full text-[13px] px-3 py-2 pl-9 rounded-lg border border-[#120E1A]/10 bg-[#f7f8fa] text-[#120E1A] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Date To */}
        <div className="w-[180px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">To</label>
          <div className="relative">
            <svg className="w-4 h-4 text-[#120E1A]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full text-[13px] px-3 py-2 pl-9 rounded-lg border border-[#120E1A]/10 bg-[#f7f8fa] text-[#120E1A] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setSearch('');
            setStatusFilter('ALL');
            setDateFrom('');
            setDateTo('');
          }}
          className="text-[#120E1A]/60 text-[13px] font-semibold px-4 py-2 rounded-lg border border-[#120E1A]/10 hover:bg-[#f7f8fa] transition-colors"
        >
          Reset
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={categories.filter((c) => {
          const q = search.trim().toLowerCase();
          const statusMatch = statusFilter === 'ALL' || (statusFilter === 'Active' ? c.active : !c.active);

          // Date filtering: created date within range
          let dateMatch = true;
          if (dateFrom || dateTo) {
            const created = c.createdAt ? c.createdAt.slice(0, 10) : '';
            if (dateFrom && created < dateFrom) dateMatch = false;
            if (dateTo && created > dateTo) dateMatch = false;
          }

          if (!statusMatch || !dateMatch) return false;
          if (!q) return true;
          return (c.name || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
        })}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={760}
        skeletonRows={8}
        pageSize={15}
        rowLabel="categories"
        emptyTitle="No categories yet"
        emptyMessage="Create your first category to organize courses across institutions."
      />

      <CategoryModal open={modalOpen} editing={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSubmit={save} />
      <StatusToggleModal category={statusModalCategory} onClose={() => setStatusModalCategory(null)} onConfirm={toggleStatus} />

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete category"
        message={deleteTarget?.courseCount > 0
          ? `Delete "${deleteTarget.name}"? ${deleteTarget.courseCount} course${deleteTarget.courseCount === 1 ? '' : 's'} will become uncategorized.`
          : `Delete "${deleteTarget?.name || ''}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </div>
  );
};

export default CourseCategoriesPage;
