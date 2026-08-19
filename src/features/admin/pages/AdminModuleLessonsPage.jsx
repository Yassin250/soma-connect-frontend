import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { platformCourseService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/shared/DataTable';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { humanize } from '../../courses/CourseDetailView';
import { LessonFormModal, ConfirmDeleteModal, ITEM_TYPES } from '../components/CurriculumModals';
import { FilterToolbar, FilterSelect } from '../components/FilterToolbar';

// Type → icon glyph + tint. Keeps the lesson list scannable at a glance.
const TYPE_META = {
  VIDEO: { d: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', tint: 'bg-rose-50 text-rose-500' },
  READING: { d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13', tint: 'bg-sky-50 text-sky-500' },
  QUIZ: { d: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', tint: 'bg-violet-50 text-violet-500' },
  ASSIGNMENT: { d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', tint: 'bg-amber-50 text-amber-500' },
  FILE: { d: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', tint: 'bg-[#0A0A0A]/[0.06] text-[#0A0A0A]/60' },
  LINK: { d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', tint: 'bg-emerald-50 text-emerald-500' },
};
const metaFor = (t) => TYPE_META[t] || TYPE_META.FILE;

/**
 * The lessons (module items) inside a single module — reached by clicking a
 * module's lesson count. Full lesson management: add, edit, delete.
 */
export const AdminModuleLessonsPage = () => {
  const { id, moduleId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [requiredFilter, setRequiredFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await platformCourseService.getOne(id);
      setCourse(data);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const module = (course?.modules || []).find((m) => String(m.id) === String(moduleId)) || null;
  const allLessons = (module?.items || [])
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((l, idx) => ({ ...l, _order: idx + 1 }));
  const lessons = allLessons.filter((l) => {
    if (typeFilter !== 'ALL' && l.itemType !== typeFilter) return false;
    if (requiredFilter === 'REQUIRED' && !l.required) return false;
    if (requiredFilter === 'OPTIONAL' && l.required) return false;
    return true;
  });

  const saveLesson = async (payload) => {
    if (editingLesson) {
      await platformCourseService.updateLesson(id, moduleId, editingLesson.id, payload);
      toast.success('Lesson updated');
    } else {
      await platformCourseService.createLesson(id, moduleId, { ...payload, sortOrder: allLessons.length });
      toast.success('Lesson created');
    }
    setLessonModalOpen(false);
    setEditingLesson(null);
    await load();
  };

  const confirmDeleteLesson = async () => {
    try {
      await platformCourseService.deleteLesson(id, moduleId, deletingLesson.id);
      toast.success('Lesson deleted');
      setDeletingLesson(null);
      await load();
    } catch (err) { toast.error(err.message); }
  };

  const columns = [
    {
      key: 'order', header: '#', width: '56px', sortable: true, sortValue: (l) => l.sortOrder ?? l._order,
      render: (l) => (
        <span className="w-7 h-7 rounded-lg bg-[#0A0A0A]/[0.06] text-[#0A0A0A]/50 text-[11px] font-bold flex items-center justify-center">
          {l._order}
        </span>
      ),
    },
    {
      key: 'title', header: 'Lesson', sortable: true, sortValue: (l) => l.title || '',
      render: (l) => {
        const meta = metaFor(l.itemType);
        return (
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.tint}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={meta.d} /></svg>
            </span>
            <p className="font-medium text-[#0A0A0A] truncate max-w-[340px]">{l.title || 'Untitled lesson'}</p>
          </div>
        );
      },
    },
    {
      key: 'type', header: 'Type', sortable: true, sortValue: (l) => l.itemType || '',
      render: (l) => <span className="text-[13px] text-[#0A0A0A]/70">{humanize(l.itemType)}</span>,
    },
    {
      key: 'duration', header: 'Duration', sortable: true, sortValue: (l) => l.durationMinutes ?? 0,
      render: (l) => (
        <span className="text-[13px] text-[#0A0A0A]/60">{l.durationMinutes ? `${l.durationMinutes} min` : '—'}</span>
      ),
    },
    {
      key: 'required', header: 'Required', sortable: true, sortValue: (l) => (l.required ? 1 : 0),
      render: (l) => (
        l.required ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#3D7FFF]/25 text-[#FFFFFF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF]" />
            Required
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#0A0A0A]/[0.05] text-[#0A0A0A]/45">
            Optional
          </span>
        )
      ),
    },
    {
      key: 'content', header: 'Content', sortable: false,
      render: (l) => (
        l.contentUrl
          ? (/^https?:\/\//i.test(l.contentUrl)
              ? <a href={l.contentUrl} target="_blank" rel="noreferrer" className="text-[13px] text-[#FFFFFF] hover:text-[#0A0A0A] hover:underline truncate max-w-[220px] inline-block align-middle">{l.contentUrl}</a>
              : <span className="text-[13px] text-[#0A0A0A]/50 truncate max-w-[220px] inline-block align-middle">{l.contentUrl}</span>)
          : <span className="text-[13px] text-[#0A0A0A]/30">—</span>
      ),
    },
    {
      key: 'actions', header: 'Actions', width: '120px',
      render: (l) => (
        <div className="flex justify-end">
          <RowActionMenu
            primary={{ label: 'Edit', icon: DockIcons.edit, onClick: () => { setEditingLesson(l); setLessonModalOpen(true); } }}
            items={[
              { label: 'Delete lesson', icon: DockIcons.trash, danger: true, onClick: () => setDeletingLesson(l) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button
            onClick={() => navigate(`/admin/courses/${id}/modules`)}
            className="flex w-fit items-center gap-1.5 text-[12px] font-medium text-[#0A0A0A]/50 hover:text-[#0A0A0A] transition-colors mb-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to Modules
          </button>
          <span className="block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            {course?.title || 'Course'}{module ? ` · ${humanize(module.moduleType)}` : ''}
          </span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1 text-[#0A0A0A]">
            {module ? `${module.title} — Lessons` : 'Lessons'}
          </h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {module
              ? `${allLessons.length} lesson${allLessons.length === 1 ? '' : 's'} in this module.`
              : 'The lessons inside this module.'}
          </p>
        </div>
        <button
          onClick={() => { setEditingLesson(null); setLessonModalOpen(true); }}
          disabled={!module}
          className="bg-[#0A0A0A] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-black transition-colors inline-flex items-center gap-2 shadow-sm active:scale-[0.98] shrink-0 disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
          Add Lesson
        </button>
      </div>

      <FilterToolbar
        showReset={typeFilter !== 'ALL' || requiredFilter !== 'ALL'}
        onReset={() => { setTypeFilter('ALL'); setRequiredFilter('ALL'); }}
      >
        <FilterSelect
          label="Type" width="w-[160px]"
          value={typeFilter} onChange={setTypeFilter}
          options={ITEM_TYPES.map((t) => ({ value: t, label: humanize(t) }))}
        />
        <FilterSelect
          label="Required" width="w-[150px]"
          value={requiredFilter} onChange={setRequiredFilter}
          options={[{ value: 'REQUIRED', label: 'Required' }, { value: 'OPTIONAL', label: 'Optional' }]}
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        rows={lessons}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={820}
        skeletonRows={6}
        pageSize={15}
        rowLabel="lessons"
        emptyTitle={module ? 'No lessons yet' : 'Module not found'}
        emptyMessage={module ? 'This module has no lessons. Add the first one to get started.' : 'This module could not be found in the course.'}
      />

      <LessonFormModal
        open={lessonModalOpen}
        editing={editingLesson}
        onClose={() => { setLessonModalOpen(false); setEditingLesson(null); }}
        onSubmit={saveLesson}
      />
      <ConfirmDeleteModal
        open={!!deletingLesson}
        title="Delete lesson"
        message={deletingLesson ? `Delete "${deletingLesson.title}"? This cannot be undone.` : ''}
        onClose={() => setDeletingLesson(null)}
        onConfirm={confirmDeleteLesson}
      />
    </div>
  );
};

export default AdminModuleLessonsPage;
