import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { platformCourseService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { CourseDetailView, CourseStatusPill } from '../../courses/CourseDetailView';

/** Read-only oversight view of any entity's course for the platform console. */
export const AdminCourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    platformCourseService.getOne(id)
      .then((c) => { if (!cancelled) setCourse(c); })
      .catch((err) => { toast.error(err.message); navigate('/admin/courses'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

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
      <div className="flex items-start gap-4 min-w-0">
        <button
          onClick={() => navigate('/admin/courses')}
          className="w-10 h-10 rounded-xl border border-[#120E1A]/10 text-[#120E1A]/50 hover:text-[#120E1A] hover:bg-white flex items-center justify-center transition-colors shrink-0 mt-1"
          aria-label="Back to courses"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-[#120E1A] text-[#8B5CF6]">
              {course.entityName}
            </span>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              {[course.code, course.category].filter(Boolean).join(' · ')}
            </span>
            <CourseStatusPill status={course.status} />
          </div>
          <h1 className="text-[19px] font-medium text-[#120E1A] tracking-tight leading-tight mt-1">{course.title}</h1>
          {course.summary && <p className="text-[12px] text-gray-500 mt-1">{course.summary}</p>}
        </div>
      </div>

      <CourseDetailView course={course} />
    </div>
  );
};

export default AdminCourseDetailPage;
