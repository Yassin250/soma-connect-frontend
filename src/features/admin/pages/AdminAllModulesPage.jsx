import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { platformCourseService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/shared/DataTable';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { humanize } from '../../courses/CourseDetailView';
import { MODULE_TYPES } from '../components/CurriculumModals';
import { FilterToolbar, FilterSelect, SearchField } from '../components/FilterToolbar';

const MODULE_ICON = {
  READING: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  VIDEO: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  ASSIGNMENT: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  QUIZ: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

/**
 * Platform-wide module oversight — every module across every course, in one
 * table with filters. Drill into a module's lessons or its parent course.
 */
export const AdminAllModulesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [accessFilter, setAccessFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await platformCourseService.listAllModules();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Institution options derived from the loaded modules.
  const entityOptions = [...new Set(rows.map((m) => m.entityName).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((n) => ({ value: n, label: n }));

  const visible = rows.filter((m) => {
    const q = search.trim().toLowerCase();
    if (typeFilter !== 'ALL' && m.moduleType !== typeFilter) return false;
    if (accessFilter === 'LOCKED' && !m.lockedAfterPrevious) return false;
    if (accessFilter === 'OPEN' && m.lockedAfterPrevious) return false;
    if (entityFilter !== 'ALL' && m.entityName !== entityFilter) return false;
    if (!q) return true;
    return (m.title || '').toLowerCase().includes(q) || (m.courseTitle || '').toLowerCase().includes(q);
  });
  const hasFilters = search || typeFilter !== 'ALL' || accessFilter !== 'ALL' || entityFilter !== 'ALL';
  const resetFilters = () => { setSearch(''); setTypeFilter('ALL'); setAccessFilter('ALL'); setEntityFilter('ALL'); };

  const columns = [
    {
      key: 'title', header: 'Module', sortable: true, sortValue: (m) => m.title || '',
      render: (m) => (
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#8B5CF6]/25 text-[#120E1A] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={MODULE_ICON[m.moduleType] || MODULE_ICON.READING} /></svg>
          </span>
          <div className="min-w-0">
            <p className="font-medium text-[#120E1A] truncate max-w-[280px]">{m.title || 'Untitled module'}</p>
            <p className="text-[11px] text-gray-400 truncate max-w-[280px]">{m.description || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'course', header: 'Course', sortable: true, sortValue: (m) => m.courseTitle || '',
      render: (m) => (
        <button
          onClick={() => navigate(`/admin/courses/${m.courseId}`)}
          className="text-[13px] text-[#FFFFFF] hover:text-[#120E1A] hover:underline truncate max-w-[200px] inline-block align-middle text-left"
        >
          {m.courseTitle || '—'}
        </button>
      ),
    },
    {
      key: 'entity', header: 'Institution', sortable: true, sortValue: (m) => m.entityName || '',
      render: (m) => <span className="text-[13px] text-[#120E1A]/60">{m.entityName || '—'}</span>,
    },
    {
      key: 'type', header: 'Type', sortable: true, sortValue: (m) => m.moduleType || '',
      render: (m) => <span className="text-[13px] text-[#120E1A]/70">{humanize(m.moduleType)}</span>,
    },
    {
      key: 'lessons', header: 'Lessons', sortable: true, sortValue: (m) => m.lessonCount ?? 0,
      render: (m) => (
        <button
          onClick={() => navigate(`/admin/courses/${m.courseId}/modules/${m.id}/lessons`)}
          title={`Open the ${m.lessonCount ?? 0} lesson${(m.lessonCount ?? 0) === 1 ? '' : 's'} in ${m.title}`}
          className="inline-flex items-center gap-1.5 min-w-[1.75rem] h-7 pl-2.5 pr-2 rounded-full bg-[#8B5CF6] text-white text-[11px] font-bold shadow-sm hover:bg-[#C4B5FD] transition-all group"
        >
          {m.lessonCount ?? 0}
          <svg className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      ),
    },
    {
      key: 'access', header: 'Access', sortable: true, sortValue: (m) => (m.lockedAfterPrevious ? 1 : 0),
      render: (m) => (
        m.lockedAfterPrevious ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" /></svg>
            Locked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Open
          </span>
        )
      ),
    },
    {
      key: 'actions', header: 'Actions', width: '120px',
      render: (m) => (
        <div className="flex justify-end">
          <RowActionMenu
            primary={{ label: 'Lessons', icon: DockIcons.edit, onClick: () => navigate(`/admin/courses/${m.courseId}/modules/${m.id}/lessons`) }}
            items={[
              { label: 'Open course', icon: DockIcons.edit, iconTone: 'text-[#120E1A]/60', onClick: () => navigate(`/admin/courses/${m.courseId}`) },
              { label: 'Manage modules', icon: DockIcons.edit, iconTone: 'text-[#120E1A]/60', onClick: () => navigate(`/admin/courses/${m.courseId}/modules`) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Academic Oversight</span>
        <h1 className="text-[19px] font-medium tracking-tight mt-1 text-[#120E1A]">Modules</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">Every module across every course on the platform.</p>
      </div>

      <FilterToolbar showReset={hasFilters} onReset={resetFilters}>
        <SearchField value={search} onChange={setSearch} placeholder="Module or course…" />
        <FilterSelect
          label="Type" width="w-[150px]"
          value={typeFilter} onChange={setTypeFilter}
          options={MODULE_TYPES.map((t) => ({ value: t, label: humanize(t) }))}
        />
        <FilterSelect
          label="Access" width="w-[130px]"
          value={accessFilter} onChange={setAccessFilter}
          options={[{ value: 'LOCKED', label: 'Locked' }, { value: 'OPEN', label: 'Open' }]}
        />
        <FilterSelect
          label="Institution" width="w-[190px]"
          value={entityFilter} onChange={setEntityFilter}
          options={entityOptions}
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        rows={visible}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={980}
        skeletonRows={10}
        pageSize={15}
        rowLabel="modules"
        emptyTitle="No modules yet"
        emptyMessage="Modules appear here as institutions build out their course curricula."
      />
    </div>
  );
};

export default AdminAllModulesPage;
