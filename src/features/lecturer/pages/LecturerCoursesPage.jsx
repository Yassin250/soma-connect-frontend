import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ConfirmDeleteModal } from '../../admin/components/CurriculumModals';
import { lecturerCourseService } from '../../../services/api';

const STATUS_BADGE = {
  DRAFT: 'bg-gray-100 text-gray-500',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-red-100 text-red-600',
};

const LecturerCoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await lecturerCourseService.list();
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handlePublish = async (id) => {
    try {
      const updated = await lecturerCourseService.setStatus(id, 'PUBLISHED');
      setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'PUBLISHED', ...updated } : c)));
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await lecturerCourseService.remove(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch { /* ignore */ }
    finally { setConfirmDelete(null); setIsDeleting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1b1e26]">My Courses</h1>
          <p className="text-sm text-gray-400 mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => navigate('/lecturer/courses/new')} className="px-4 py-2.5 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black transition-all">+ New Course</button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="w-16 h-16 rounded-2xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center mb-4">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </span>
          <h2 className="text-lg font-semibold text-[#1b1e26]">No courses yet</h2>
          <p className="text-sm text-gray-400 mt-1">Create your first course to get started.</p>
          <button onClick={() => navigate('/lecturer/courses/new')} className="mt-4 px-5 py-2.5 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black transition-colors">Create Course</button>
        </div>
      ) : (
        <div className="grid gap-3">
          {courses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] p-5 sm:p-6 shadow-[0_1px_3px_rgba(27,30,38,0.04)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-bold text-[#1b1e26] truncate">{course.title}</h3>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[course.status] || 'bg-gray-100 text-gray-500'}`}>
                      {course.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-1">{course.summary || 'No description'}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center flex-wrap gap-x-5 gap-y-1 text-xs text-gray-400">
                {course.enrollmentCode && (
                  <span className="font-mono font-semibold text-[#1b1e26] tracking-wider">Code: {course.enrollmentCode}</span>
                )}
                {course.level && <span className="capitalize">{course.level.toLowerCase()}</span>}
                {course.moduleCount > 0 && <span>{course.moduleCount} module{course.moduleCount !== 1 ? 's' : ''}</span>}
                {course.estimatedHours && <span>{course.estimatedHours}h</span>}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button onClick={() => navigate(`/lecturer/courses/${course.id}/edit`)} className="px-3 py-1.5 rounded-lg text-gray-400 text-xs font-semibold hover:text-[#1b1e26] hover:bg-gray-100 transition-all">Edit</button>
                {course.status === 'DRAFT' && (
                  <button onClick={() => handlePublish(course.id)} className="px-3 py-1.5 rounded-lg bg-[#d0f24a] text-[#1b1e26] text-xs font-bold hover:brightness-90 transition-all">Publish</button>
                )}
                {course.status === 'PUBLISHED' && (
                  <span className="text-xs text-green-600 font-semibold">Students can enroll with code</span>
                )}
                <button onClick={() => setConfirmDelete(course)} className="ml-auto px-3 py-1.5 rounded-lg text-gray-400 text-xs font-semibold hover:text-red-500 hover:bg-red-50 transition-all">Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <ConfirmDeleteModal
        open={confirmDelete !== null}
        title="Delete Course"
        message="Are you sure you want to delete "
        itemName={confirmDelete?.title}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete.id)}
      />
    </div>
  );
};

export default LecturerCoursesPage;
