import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { platformCourseService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/shared/DataTable';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { humanize } from '../../courses/CourseDetailView';
import { ITEM_TYPES } from '../components/CurriculumModals';
import { FilterToolbar, FilterSelect, SearchField } from '../components/FilterToolbar';

const TYPE_META = {
  VIDEO: { d: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', tint: 'bg-rose-50 text-rose-500' },
  READING: { d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13', tint: 'bg-sky-50 text-sky-500' },
  QUIZ: { d: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', tint: 'bg-violet-50 text-violet-500' },
  ASSIGNMENT: { d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', tint: 'bg-amber-50 text-amber-500' },
  FILE: { d: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', tint: 'bg-[#1b1e26]/[0.06] text-[#1b1e26]/60' },
  LINK: { d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', tint: 'bg-emerald-50 text-emerald-500' },
};
const metaFor = (t) => TYPE_META[t] || TYPE_META.FILE;

/**
 * Platform-wide lesson oversight — every lesson (module item) across every
 * course, in one table with filters. Drill into the parent module or course.
 */
export const AdminAllLessonsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [requiredFilter, setRequiredFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await platformCourseService.listAllLessons();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const entityOptions = [...new Set(rows.map((l) => l.entityName).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((n) => ({ value: n, label: n }));

  const visible = rows.filter((l) => {
    const q = search.trim().toLowerCase();
    if (typeFilter !== 'ALL' && l.itemType !== typeFilter) return false;
    if (requiredFilter === 'REQUIRED' && !l.required) return false;
    if (requiredFilter === 'OPTIONAL' && l.required) return false;
    if (entityFilter !== 'ALL' && l.entityName !== entityFilter) return false;
    if (!q) return true;
    return (l.title || '').toLowerCase().includes(q)
      || (l.moduleTitle || '').toLowerCase().includes(q)
      || (l.courseTitle || '').toLowerCase().includes(q);
  });
  const hasFilters = search || typeFilter !== 'ALL' || requiredFilter !== 'ALL' || entityFilter !== 'ALL';
  const resetFilters = () => { setSearch(''); setTypeFilter('ALL'); setRequiredFilter('ALL'); setEntityFilter('ALL'); };

  const columns = [
    {
      key: 'title', header: 'Lesson', sortable: true, sortValue: (l) => l.title || '',
      render: (l) => {
        const meta = metaFor(l.itemType);
        return (
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.tint}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={meta.d} /></svg>
            </span>
            <p className="font-medium text-[#1b1e26] truncate max-w-[260px]">{l.title || 'Untitled lesson'}</p>
          </div>
        );
      },
    },
    {
      key: 'type', header: 'Type', sortable: true, sortValue: (l) => l.itemType || '',
      render: (l) => <span className="text-[13px] text-[#1b1e26]/70">{humanize(l.itemType)}</span>,
    },
    {
      key: 'module', header: 'Module', sortable: true, sortValue: (l) => l.moduleTitle || '',
      render: (l) => (
        <button
          onClick={() => navigate(`/admin/courses/${l.courseId}/modules/${l.moduleId}/lessons`)}
          className="text-[13px] text-[#5b6b12] hover:text-[#1b1e26] hover:underline truncate max-w-[180px] inline-block align-middle text-left"
        >
          {l.moduleTitle || '—'}
        </button>
      ),
    },
    {
      key: 'course', header: 'Course', sortable: true, sortValue: (l) => l.courseTitle || '',
      render: (l) => (
        <button
          onClick={() => navigate(`/admin/courses/${l.courseId}`)}
          className="text-[13px] text-[#1b1e26]/60 hover:text-[#1b1e26] hover:underline truncate max-w-[180px] inline-block align-middle text-left"
        >
          {l.courseTitle || '—'}
        </button>
      ),
    },
    {
      key: 'duration', header: 'Duration', sortable: true, sortValue: (l) => l.durationMinutes ?? 0,
      render: (l) => <span className="text-[13px] text-[#1b1e26]/60">{l.durationMinutes ? `${l.durationMinutes} min` : '—'}</span>,
    },
    {
      key: 'required', header: 'Required', sortable: true, sortValue: (l) => (l.required ? 1 : 0),
      render: (l) => (
        l.required ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#d0f24a]/25 text-[#5b6b12]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5b6b12]" />
            Required
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#1b1e26]/[0.05] text-[#1b1e26]/45">
            Optional
          </span>
        )
      ),
    },
    {
      key: 'actions', header: 'Actions', width: '110px',
      render: (l) => (
        <div className="flex justify-end">
          <RowActionMenu
            primary={{ label: 'Open', icon: DockIcons.edit, onClick: () => navigate(`/admin/courses/${l.courseId}/modules/${l.moduleId}/lessons`) }}
            items={[
              { label: 'Open course', icon: DockIcons.edit, iconTone: 'text-[#1b1e26]/60', onClick: () => navigate(`/admin/courses/${l.courseId}`) },
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
        <h1 className="text-[19px] font-medium tracking-tight mt-1 text-[#1b1e26]">Lessons</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">Every lesson across every module and course on the platform.</p>
      </div>

      <FilterToolbar showReset={hasFilters} onReset={resetFilters}>
        <SearchField value={search} onChange={setSearch} placeholder="Lesson, module or course…" width="w-[260px]" />
        <FilterSelect
          label="Type" width="w-[150px]"
          value={typeFilter} onChange={setTypeFilter}
          options={ITEM_TYPES.map((t) => ({ value: t, label: humanize(t) }))}
        />
        <FilterSelect
          label="Required" width="w-[140px]"
          value={requiredFilter} onChange={setRequiredFilter}
          options={[{ value: 'REQUIRED', label: 'Required' }, { value: 'OPTIONAL', label: 'Optional' }]}
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
        rowLabel="lessons"
        emptyTitle="No lessons yet"
        emptyMessage="Lessons appear here as institutions build out their course curricula."
      />
    </div>
  );
};

export default AdminAllLessonsPage;
