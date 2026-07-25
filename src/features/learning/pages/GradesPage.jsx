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

const GradesPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    learnerCourseService.getGrades()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
      <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  );

  if (!data || !data.enrollments?.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="w-16 h-16 rounded-2xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center mb-4">
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      </span>
      <h2 className="text-lg font-semibold text-[#1b1e26]">No grades yet</h2>
      <p className="text-sm text-gray-400 mt-1">Enroll in a course and start learning to see your grades.</p>
      <Link to="/courses" className="mt-4 px-5 py-2.5 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black transition-colors">Browse Courses</Link>
    </div>
  );

  const statCard = (label, value, color) => (
    <div className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] p-4 sm:p-5 shadow-[0_1px_3px_rgba(27,30,38,0.04)]">
      <p className={`text-3xl sm:text-4xl font-black ${color}`}>{value}</p>
      <p className="text-xs sm:text-sm text-gray-400 font-semibold mt-1">{label}</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1b1e26]">Grades & Progress</h1>
        <p className="text-sm text-gray-400 mt-1">Track your performance across all courses.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statCard('Total Courses', data.totalCourses, 'text-[#1b1e26]')}
        {statCard('In Progress', data.inProgress, 'text-amber-600')}
        {statCard('Completed', data.completed, 'text-green-600')}
        {statCard('Avg Score', `${data.overallAverageScore}%`, data.overallAverageScore >= 70 ? 'text-green-600' : 'text-amber-600')}
      </div>

      {/* Course list */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#1b1e26]">Per-Course Breakdown</h2>
        {data.enrollments.map((course, idx) => (
          <motion.div
            key={course.courseId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] p-5 sm:p-6 shadow-[0_1px_3px_rgba(27,30,38,0.04)] hover:shadow-[0_4px_16px_rgba(27,30,38,0.08)] transition-shadow"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <Link to={`/learning/course/${course.courseId}`} className="text-base sm:text-lg font-bold text-[#1b1e26] hover:text-[#d0f24a] transition-colors truncate block">
                  {course.courseTitle}
                </Link>
                {course.courseCode && <p className="text-xs text-gray-400 mt-0.5">{course.courseCode}</p>}
              </div>
              <span className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold ${statusColor(course.status)}`}>
                {statusLabel(course.status)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1b1e26]">{course.progressPercent}% Complete</span>
                <span className="text-gray-400">{course.completedItems}/{course.totalItems} items</span>
              </div>
              <div className="h-2.5 bg-[#f0f1f3] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 ease-out"
                     style={{
                       width: `${course.progressPercent}%`,
                       background: course.progressPercent === 100
                         ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                         : 'linear-gradient(90deg, #d0f24a, #a3d420)'
                     }}
                />
              </div>
            </div>

            {/* Score & items row */}
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-medium">Average Score:</span>
                <span className={`font-bold ${course.averageScore >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                  {course.averageScore}%
                </span>
              </div>
              {course.averageScore > 0 && (
                <Link to={`/learning/course/${course.courseId}`}
                      className="text-[#1b1e26] font-semibold hover:text-[#d0f24a] transition-colors underline underline-offset-2">
                  View Details
                </Link>
              )}
            </div>

            {/* Item scores */}
            {course.items?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#1b1e26]/[0.06]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {course.items.filter(i => i.score != null).map(item => (
                    <div key={item.itemId} className="flex items-center justify-between bg-[#f7f8fa] rounded-xl px-3.5 py-2.5">
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="text-xs font-semibold text-[#1b1e26] truncate">{item.itemTitle}</p>
                        <p className="text-[10px] text-gray-400">{item.itemType}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-[#1b1e26]">{item.score}/{item.maxScore ?? 100}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default GradesPage;
