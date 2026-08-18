import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { platformCourseService, platformEntityService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/shared/DataTable';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { ConfirmDeleteModal } from '../components/CurriculumModals';
import { CourseStatusPill, humanize } from '../../courses/CourseDetailView';

const filterFieldClass =
  'w-full text-[12.5px] px-3 py-1.5 rounded-lg border border-[#120E1A]/10 bg-[#f7f8fa] text-[#120E1A] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] focus:outline-none transition-all';

// Row-action icons (RowActionMenu expects a JSX node like DockIcons.*)
const MODULES_ICON = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const EDIT_ICON = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

/** Platform-wide, read-only course oversight across every institution. */
export const CoursesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Category filter is URL-driven so the Categories page can deep-link into a
  // pre-filtered view (…/admin/courses?category=AI%20Development).
  const categoryFilter = searchParams.get('category') || '';
  const clearCategory = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    setSearchParams(next, { replace: true });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await platformCourseService.list();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeleteCourse = async () => {
    if (!deleteTarget) return;
    try {
      await platformCourseService.deleteCourse(deleteTarget.id);
      toast.success('Course deleted');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Institution dropdown options — the entity directory (paged endpoint).
  useEffect(() => {
    platformEntityService.list({ page: 0, size: 200 })
      .then((data) => setEntities(Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // All filters now handled by toolbar dropdowns.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cat = categoryFilter.trim().toLowerCase();
    return courses.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (entityFilter !== 'ALL' && c.entityId !== entityFilter) return false;
      if (cat && (c.category || '').toLowerCase() !== cat) return false;
      if (dateFrom || dateTo) {
        const created = c.createdAt ? c.createdAt.slice(0, 10) : '';
        if (dateFrom && created < dateFrom) return false;
        if (dateTo && created > dateTo) return false;
      }
      if (!q) return true;
      return (
        (c.title || '').toLowerCase().includes(q) ||
        (c.code || '').toLowerCase().includes(q) ||
        (c.entityName || '').toLowerCase().includes(q)
      );
    });
  }, [courses, search, statusFilter, entityFilter, categoryFilter, dateFrom, dateTo]);

  const columns = [
    {
      key: 'title', header: 'Course', sortable: true, sortValue: (c) => c.title || '',
      render: (c) => (
        <div className="flex items-center gap-3 min-w-0">
          {c.coverImageUrl ? (
            <img src={c.coverImageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
          ) : (
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#120E1A] to-[#1a1025] text-[#8B5CF6] text-[13px] font-semibold flex items-center justify-center shrink-0">
              {(c.title || '?').charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[#120E1A]/90 truncate max-w-[280px]">{c.title}</p>
            <p className="text-[11px] text-gray-400 truncate">{[c.code, c.category].filter(Boolean).join(' · ') || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'entity', header: 'Institution', sortable: true, sortValue: (c) => c.entityName || '',
      render: (c) => <span className="text-[13px] text-[#120E1A]/70">{c.entityName || '—'}</span>,
    },
    {
      key: 'modules', header: 'Modules', sortable: true, sortValue: (c) => c.moduleCount,
      render: (c) => (
        <button
          onClick={() => navigate(`/admin/courses/${c.id}/modules`)}
          title={`View ${c.moduleCount} module${c.moduleCount === 1 ? '' : 's'}`}
          className="inline-flex items-center gap-1.5 min-w-[1.75rem] h-7 pl-2.5 pr-2 rounded-full bg-[#8B5CF6] text-white text-[11px] font-bold shadow-sm hover:bg-[#C4B5FD] transition-all group"
        >
          {c.moduleCount}
          <svg className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      ),
    },
    {
      key: 'delivery', header: 'Delivery', sortable: true, sortValue: (c) => c.deliveryMode || '',
      render: (c) => <span className="text-[13px] text-[#120E1A]/60">{humanize(c.deliveryMode)}</span>,
    },
    {
      key: 'status', header: 'Status', sortable: true, sortValue: (c) => c.status,
      render: (c) => (
        <select
          value={c.status || 'DRAFT'}
          disabled
          className="px-2.5 py-1 text-[12px] font-medium rounded-lg border border-[#120E1A]/10 bg-[#f7f8fa] text-[#120E1A]/80 cursor-default"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      ),
    },
    {
      key: 'createdAt', header: 'Created At', sortable: true,
      sortValue: (c) => (c.createdAt ? new Date(c.createdAt).getTime() : 0),
      render: (c) => (
        <span className="text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</span>
      ),
    },
    {
      key: 'actions', header: 'Actions', width: '120px',
      render: (c) => (
        <div className="flex justify-end">
          <RowActionMenu
            primary={{ label: 'View', icon: DockIcons.edit, onClick: () => navigate(`/admin/courses/${c.id}`) }}
            items={[
              { label: 'Edit course', icon: EDIT_ICON, iconTone: 'text-[#120E1A]/60', onClick: () => navigate(`/admin/courses/${c.id}/edit`) },
              { label: 'Modules', icon: MODULES_ICON, iconTone: 'text-[#120E1A]/60', onClick: () => navigate(`/admin/courses/${c.id}/modules`) },
              { label: 'Delete', icon: DockIcons.trash, danger: true, onClick: () => setDeleteTarget(c) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Academic Oversight</span>
        <h1 className="text-[19px] font-medium tracking-tight mt-1 text-[#120E1A]">Courses</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">Every course published by institutions across the platform.</p>
        {categoryFilter && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#8B5CF6]/20 text-white pl-3.5 pr-2 py-1.5 text-[13px] font-semibold">
            <span className="text-white/70 font-medium">Category:</span>
            {categoryFilter}
            <button
              onClick={clearCategory}
              aria-label="Clear category filter"
              className="w-5 h-5 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>
        )}
        </div>
        <button
          onClick={() => navigate('/admin/courses/new')}
          className="bg-[#120E1A] text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-black transition-colors inline-flex items-center gap-2 shadow-sm active:scale-[0.98] shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
          New Course
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
              placeholder="Title, code or institution…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${filterFieldClass} pl-9`}
            />
          </div>
        </div>

        {/* Institution */}
        <div className="w-[200px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">Institution</label>
          <select
            className={`${filterFieldClass} cursor-pointer`}
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="ALL">All institutions</option>
            {entities.map((en) => (
              <option key={en.id} value={en.id}>{en.name}</option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="w-[130px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">Status</label>
          <select
            className={`${filterFieldClass} cursor-pointer`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Created From */}
        <div className="w-[150px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">From</label>
          <div className="relative">
            <svg className="w-3.5 h-3.5 text-[#120E1A]/35 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${filterFieldClass} pl-8`} aria-label="Created from" />
          </div>
        </div>

        {/* Created To */}
        <div className="w-[150px] flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-[#120E1A]/45 uppercase tracking-[0.12em]">To</label>
          <div className="relative">
            <svg className="w-3.5 h-3.5 text-[#120E1A]/35 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${filterFieldClass} pl-8`} aria-label="Created to" />
          </div>
        </div>

        {/* Spacer + Reset */}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => { setSearch(''); setEntityFilter('ALL'); setStatusFilter('ALL'); setDateFrom(''); setDateTo(''); }}
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
        minWidth={960}
        skeletonRows={8}
        pageSize={10}
        rowLabel="courses"
        emptyTitle={courses.length === 0 ? 'No courses yet' : 'No matches'}
        emptyMessage={
          courses.length === 0
            ? 'Courses appear here as institutions create them.'
            : 'No courses match the current filters.'
        }
      />

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete course"
        message={`Are you sure you want to delete "${deleteTarget?.title || ''}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCourse}
      />
    </div>
  );
};

export default CoursesPage;
