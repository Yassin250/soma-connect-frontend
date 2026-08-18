import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { entityCourseService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { RowActionMenu, DockIcons } from '../../../components/shared/RowActions';
import { ConfirmDeleteModal } from '../../admin/components/CurriculumModals';
import { CourseStatusPill, humanize } from '../../courses/CourseDetailView';

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'DRAFT', label: 'Drafts' },
  { id: 'PUBLISHED', label: 'Published' },
  { id: 'ARCHIVED', label: 'Archived' },
];

export const SchoolCoursesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await entityCourseService.list();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(
    () => (filter === 'ALL' ? courses : courses.filter((c) => c.status === filter)),
    [courses, filter]
  );

  const counts = useMemo(() => {
    const map = { ALL: courses.length, DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0 };
    courses.forEach((c) => { map[c.status] = (map[c.status] || 0) + 1; });
    return map;
  }, [courses]);

  const setStatus = async (course, status, verb) => {
    try {
      await entityCourseService.setStatus(course.id, status);
      toast.success(`Course ${verb}`);
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await entityCourseService.remove(deleteTarget.id);
      toast.success('Course deleted');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const statusAction = (c) =>
    c.status === 'PUBLISHED'
      ? { label: 'Archive course', icon: DockIcons.power, onClick: () => setStatus(c, 'ARCHIVED', 'archived') }
      : { label: c.status === 'ARCHIVED' ? 'Republish course' : 'Publish course', icon: DockIcons.power, iconTone: 'text-emerald-500', onClick: () => setStatus(c, 'PUBLISHED', 'published') };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Learning &amp; Integrity</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1.5 text-[#1b1e26]">Courses</h1>
          <p className="text-[12px] text-slate-500 mt-1">Build, publish, and manage your institution's courses.</p>
        </div>
        <button
          onClick={() => navigate('/school/courses/new')}
          className="bg-[#0E1412] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-black transition-colors inline-flex items-center gap-2 shadow-sm active:scale-[0.98]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Create Course
        </button>
      </div>

      {/* Status filter chips */}
      <div className="inline-flex rounded-xl bg-white border border-[#1b1e26]/[0.06] shadow-sm p-1 gap-1">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
                 active ? 'bg-[#0E1412] text-white shadow-sm shadow-emerald-500/15' : 'text-gray-400 hover:text-[#1b1e26] hover:bg-[#f7f8fa]'
              }`}
            >
              {f.label}
              <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                active ? 'bg-accent text-[#1b1e26]' : 'bg-[#1b1e26]/[0.06] text-[#1b1e26]/50'
              }`}>
                {counts[f.id] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Catalog */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
          {[0, 1, 2].map((i) => <div key={i} className="h-64 bg-gray-200/70 rounded-2xl" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#1b1e26]/15 p-14 text-center">
          <span className="w-14 h-14 rounded-2xl bg-accent/20 text-[#1b1e26] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </span>
          <p className="text-base font-semibold text-[#1b1e26]">
            {courses.length === 0 ? 'No courses yet' : 'Nothing in this filter'}
          </p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            {courses.length === 0
              ? 'Create your first course — basics, objectives, and curriculum in one guided flow.'
              : 'Try a different status filter.'}
          </p>
          {courses.length === 0 && (
            <button
              onClick={() => navigate('/school/courses/new')}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-accent text-[#1b1e26] hover:bg-accent-hover transition-colors active:scale-[0.98] shadow-sm"
            >
              Create your first course
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {visible.map((c) => (
            <div
              key={c.id}
              className="group bg-white rounded-xl border border-[#1b1e26]/[0.06] shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col"
            >
              {/* Cover */}
              <Link to={`/school/courses/${c.id}`} className="relative block h-[68px] shrink-0">
                {c.coverImageUrl ? (
                  <img src={c.coverImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0E1412] to-[#1a2020] flex items-center justify-center">
                    <span className="w-7 h-7 rounded-lg bg-accent text-white text-[11px] font-bold flex items-center justify-center">
                      {(c.title || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="absolute top-1.5 right-1.5"><CourseStatusPill status={c.status} /></span>
              </Link>

              {/* Body */}
              <div className="p-2.5 flex flex-col flex-1">
                <Link to={`/school/courses/${c.id}`} className="block">
                  <h3 className="text-[13px] font-medium text-[#1b1e26] leading-snug line-clamp-1 group-hover:underline decoration-accent decoration-2 underline-offset-2">
                    {c.title}
                  </h3>
                </Link>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                  {[c.code, c.category].filter(Boolean).join(' · ') || '—'}
                </p>
                {c.summary && (
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed line-clamp-1">{c.summary}</p>
                )}

                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#f7f8fa] text-[#1b1e26]/70 border border-[#1b1e26]/[0.06]">
                    {c.moduleCount} module{c.moduleCount === 1 ? '' : 's'}
                  </span>
                  {c.estimatedHours && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#f7f8fa] text-[#1b1e26]/70 border border-[#1b1e26]/[0.06]">
                      {c.estimatedHours}h
                    </span>
                  )}
                  {c.level && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-accent/20 text-[#1b1e26]">
                      {humanize(c.level)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#1b1e26]/[0.05]">
                  <span className="text-[10px] text-gray-400 truncate">
                    {c.instructorName || 'No instructor'}
                  </span>
                  <RowActionMenu
                    primary={{ label: 'View', icon: DockIcons.edit, onClick: () => navigate(`/school/courses/${c.id}`) }}
                    items={[
                      { label: 'Edit course', icon: DockIcons.edit, onClick: () => navigate(`/school/courses/${c.id}/edit`) },
                      statusAction(c),
                      'divider',
                      { label: 'Delete course', icon: DockIcons.trash, danger: true, onClick: () => setDeleteTarget(c) },
                    ]}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete course"
        message={`Are you sure you want to delete "${deleteTarget?.title || ''}"? This removes its whole curriculum and cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </div>
  );
};

export default SchoolCoursesPage;
