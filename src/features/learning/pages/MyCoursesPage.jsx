import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { learnerCourseService } from '../../../services/api';

const statusLabel = (status) => {
  switch (status) {
    case 'ACTIVE': return 'In Progress';
    case 'COMPLETED': return 'Completed';
    case 'PENDING': return 'Pending';
    case 'DROPPED': return 'Dropped';
    default: return status;
  }
};
const statusColor = (status) => {
  switch (status) {
    case 'ACTIVE': return 'bg-amber-100 text-amber-700';
    case 'COMPLETED': return 'bg-green-100 text-green-700';
    case 'PENDING': return 'bg-gray-100 text-gray-500';
    case 'DROPPED': return 'bg-red-100 text-red-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    learnerCourseService.listMyCourses()
      .then(setCourses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
      {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  if (!courses.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="w-16 h-16 rounded-2xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center mb-4">
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
      </span>
      <h2 className="text-lg font-semibold text-[#1b1e26]">No enrolled courses yet</h2>
      <p className="text-sm text-gray-400 mt-1">Browse the catalog and enroll in a course to get started.</p>
      <Link to="/courses" className="mt-4 px-5 py-2.5 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black transition-colors">Browse Courses</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1b1e26]">My Courses</h1>
        <p className="text-sm text-gray-400 mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} enrolled.</p>
      </div>

      <div className="grid gap-4">
        {courses.map((course, idx) => (
          <motion.div
            key={course.courseId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              to={`/learning/course/${course.courseId}`}
              className="block bg-white rounded-2xl border border-[#1b1e26]/[0.06] p-5 sm:p-6 shadow-[0_1px_3px_rgba(27,30,38,0.04)] hover:shadow-[0_4px_16px_rgba(27,30,38,0.08)] transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#1b1e26] truncate">{course.courseTitle}</h3>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColor(course.status)}`}>
                      {statusLabel(course.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-1">{course.summary || course.entityName}</p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1b1e26]">{course.overallProgressPercent}% Complete</span>
                  <span className="text-gray-400">{course.completedItems}/{course.totalItems} items</span>
                </div>
                <div className="h-2 bg-[#f0f1f3] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                       style={{
                         width: `${course.overallProgressPercent}%`,
                         background: course.overallProgressPercent === 100
                           ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                           : 'linear-gradient(90deg, #d0f24a, #a3d420)'
                       }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {course.instructorName && <span>By {course.instructorName}</span>}
                  {course.estimatedHours && <span>{course.estimatedHours}h</span>}
                  {course.level && <span className="capitalize">{course.level.toLowerCase()}</span>}
                </div>
                {course.status !== 'COMPLETED' && (
                  <span className="px-3.5 py-1.5 rounded-lg bg-[#1b1e26] text-white text-[11px] font-bold tracking-wide hover:bg-black transition-colors">
                    Resume Course
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyCoursesPage;
