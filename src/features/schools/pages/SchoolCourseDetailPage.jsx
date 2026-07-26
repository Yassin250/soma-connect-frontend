import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { entityCourseService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { CourseDetailView, CourseStatusPill } from '../../courses/CourseDetailView';

export const SchoolCourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCourse(await entityCourseService.getOne(id));
    } catch (err) {
      toast.error(err.message);
      navigate('/school/courses');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (status, verb) => {
    setBusy(true);
    try {
      await entityCourseService.setStatus(id, status);
      toast.success(`Course ${verb}`);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading || !course) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-96 bg-gray-200 rounded-xl" />
        <div className="h-80 bg-gray-200/70 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 min-w-0">
          <button
            onClick={() => navigate('/school/courses')}
            className="w-10 h-10 rounded-xl border border-[#1b1e26]/10 text-[#1b1e26]/50 hover:text-[#1b1e26] hover:bg-white flex items-center justify-center transition-colors shrink-0 mt-1"
            aria-label="Back to courses"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                {[course.code, course.category].filter(Boolean).join(' · ') || 'Course'}
              </span>
              <CourseStatusPill status={course.status} />
            </div>
            <h1 className="text-[19px] font-medium text-[#1b1e26] tracking-tight leading-tight mt-1">{course.title}</h1>
            {course.summary && <p className="text-[12px] text-gray-500 mt-1">{course.summary}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {course.status === 'PUBLISHED' ? (
            <button
              onClick={() => setStatus('ARCHIVED', 'archived')}
              disabled={busy}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#1b1e26]/70 border border-[#1b1e26]/10 bg-white hover:bg-[#f7f8fa] transition-colors disabled:opacity-60"
            >
              Archive
            </button>
          ) : (
            <button
              onClick={() => setStatus('PUBLISHED', 'published')}
              disabled={busy}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-accent text-[#1b1e26] hover:bg-accent-hover transition-colors active:scale-[0.98] shadow-sm disabled:opacity-60"
            >
              {course.status === 'ARCHIVED' ? 'Republish' : 'Publish'}
            </button>
          )}
          <button
            onClick={() => navigate(`/school/courses/${id}/edit`)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#1b1e26] text-white hover:bg-black transition-colors active:scale-[0.98] shadow-sm"
          >
            Edit course
          </button>
        </div>
      </div>

      <CourseDetailView course={course} />
    </div>
  );
};

export default SchoolCourseDetailPage;
