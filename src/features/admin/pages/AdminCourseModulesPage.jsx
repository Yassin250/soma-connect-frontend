import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { platformCourseService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { DataTable } from '../../../components/shared/DataTable';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { humanize } from '../../courses/CourseDetailView';
import { ModuleFormModal, ConfirmDeleteModal, MODULE_TYPES } from '../components/CurriculumModals';
import { FilterToolbar, FilterSelect } from '../components/FilterToolbar';

const MODULE_ICON = {
  READING: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  VIDEO: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  ASSIGNMENT: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  QUIZ: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

/**
 * A dedicated modules table for a single course — reached from the "Modules"
 * count/action on the platform Courses page. Full module management: add, edit,
 * delete, and drill into a module's lessons.
 */
export const AdminCourseModulesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [deletingModule, setDeletingModule] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [accessFilter, setAccessFilter] = useState('ALL');

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

  const modules = (course?.modules || [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((m) => {
      if (typeFilter !== 'ALL' && m.moduleType !== typeFilter) return false;
      if (accessFilter === 'LOCKED' && !m.lockedAfterPrevious) return false;
      if (accessFilter === 'OPEN' && m.lockedAfterPrevious) return false;
      return true;
    });
  const totalModules = course?.modules?.length ?? 0;

  const saveModule = async (payload) => {
    if (editingModule) {
      await platformCourseService.updateModule(id, editingModule.id, payload);
      toast.success('Module updated');
    } else {
      await platformCourseService.createModule(id, { ...payload, sortOrder: modules.length });
      toast.success('Module created');
    }
    setModuleModalOpen(false);
    setEditingModule(null);
    await load();
  };

  const confirmDeleteModule = async () => {
    try {
      await platformCourseService.deleteModule(id, deletingModule.id);
      toast.success('Module deleted');
      setDeletingModule(null);
      await load();
    } catch (err) { toast.error(err.message); }
  };

  const goToLessons = (m) => navigate(`/admin/courses/${id}/modules/${m.id}/lessons`);

  const columns = [
    {
      key: 'order', header: '#', width: '56px', sortable: true, sortValue: (m) => m.sortOrder,
      render: (m) => (
        <span className="w-7 h-7 rounded-lg bg-[#1b1e26] text-[#d0f24a] text-[11px] font-bold flex items-center justify-center">
          {m.sortOrder + 1}
        </span>
      ),
    },
    {
      key: 'title', header: 'Module', sortable: true, sortValue: (m) => m.title || '',
      render: (m) => (
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#d0f24a]/25 text-[#1b1e26] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={MODULE_ICON[m.moduleType] || MODULE_ICON.READING} /></svg>
          </span>
          <div className="min-w-0">
            <p className="font-medium text-[#1b1e26] truncate max-w-[320px]">{m.title || 'Untitled module'}</p>
            <p className="text-[11px] text-gray-400 truncate max-w-[320px]">{m.description || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type', header: 'Type', sortable: true, sortValue: (m) => m.moduleType || '',
      render: (m) => <span className="text-[13px] text-[#1b1e26]/70">{humanize(m.moduleType)}</span>,
    },
    {
      key: 'items', header: 'Lessons', sortable: true, sortValue: (m) => (m.items?.length ?? 0),
      render: (m) => (
        <button
          onClick={() => goToLessons(m)}
          title={`Open the ${m.items?.length ?? 0} lesson${(m.items?.length ?? 0) === 1 ? '' : 's'} in ${m.title}`}
          className="inline-flex items-center gap-1.5 min-w-[1.75rem] h-7 pl-2.5 pr-2 rounded-full bg-[#d0f24a] text-[#1b1e26] text-[11px] font-bold shadow-sm hover:bg-[#c4e83a] transition-all group"
        >
          {m.items?.length ?? 0}
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
            primary={{ label: 'Lessons', icon: DockIcons.edit, onClick: () => goToLessons(m) }}
            items={[
              { label: 'Edit module', icon: DockIcons.edit, iconTone: 'text-[#1b1e26]/60', onClick: () => { setEditingModule(m); setModuleModalOpen(true); } },
              'divider',
              { label: 'Delete module', icon: DockIcons.trash, danger: true, onClick: () => setDeletingModule(m) },
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
            onClick={() => navigate('/admin/courses')}
            className="flex w-fit items-center gap-1.5 text-[12px] font-medium text-[#1b1e26]/50 hover:text-[#1b1e26] transition-colors mb-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to Courses
          </button>
          <span className="block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Course Curriculum</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1 text-[#1b1e26]">
            {course ? `${course.title} — Modules` : 'Modules'}
          </h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {course
              ? `${totalModules} module${totalModules === 1 ? '' : 's'} in this course${course.entityName ? ` · ${course.entityName}` : ''}.`
              : 'The ordered curriculum for this course.'}
          </p>
        </div>
        <button
          onClick={() => { setEditingModule(null); setModuleModalOpen(true); }}
          className="bg-[#1b1e26] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-black transition-colors inline-flex items-center gap-2 shadow-sm active:scale-[0.98] shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
          Add Module
        </button>
      </div>

      <FilterToolbar
        showReset={typeFilter !== 'ALL' || accessFilter !== 'ALL'}
        onReset={() => { setTypeFilter('ALL'); setAccessFilter('ALL'); }}
      >
        <FilterSelect
          label="Type" width="w-[160px]"
          value={typeFilter} onChange={setTypeFilter}
          options={MODULE_TYPES.map((t) => ({ value: t, label: humanize(t) }))}
        />
        <FilterSelect
          label="Access" width="w-[140px]"
          value={accessFilter} onChange={setAccessFilter}
          options={[{ value: 'LOCKED', label: 'Locked' }, { value: 'OPEN', label: 'Open' }]}
        />
      </FilterToolbar>

      <DataTable
        columns={columns}
        rows={modules}
        keyField="id"
        loading={loading}
        error={error}
        minWidth={760}
        skeletonRows={6}
        pageSize={15}
        rowLabel="modules"
        emptyTitle="No modules yet"
        emptyMessage="This course has no modules in its curriculum. Add the first one to get started."
      />

      <ModuleFormModal
        open={moduleModalOpen}
        editing={editingModule}
        onClose={() => { setModuleModalOpen(false); setEditingModule(null); }}
        onSubmit={saveModule}
      />
      <ConfirmDeleteModal
        open={!!deletingModule}
        title="Delete module"
        message={deletingModule ? `Delete "${deletingModule.title}"? Its ${deletingModule.items?.length ?? 0} lesson${(deletingModule.items?.length ?? 0) === 1 ? '' : 's'} will be removed too. This cannot be undone.` : ''}
        onClose={() => setDeletingModule(null)}
        onConfirm={confirmDeleteModule}
      />
    </div>
  );
};

export default AdminCourseModulesPage;
