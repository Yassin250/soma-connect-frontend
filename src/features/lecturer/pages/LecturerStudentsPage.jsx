import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { lecturerCourseService } from '../../../services/api';
import { apiClient } from '../../../services/apiClient';

const STATUS_BADGE = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  DROPPED: 'bg-red-100 text-red-600',
};

const LecturerStudentsPage = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    lecturerCourseService.list()
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = filterCourse ? { courseId: filterCourse } : {};
    apiClient.get('/api/lecturer/courses/students', { params })
      .then((r) => setStudents(r.data?.data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [filterCourse]);

  const filtered = students.filter((s) =>
    !search || s.studentName?.toLowerCase().includes(search.toLowerCase()) || s.studentEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = new Set(students.map((s) => s.studentId)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1b1e26]">My Students</h1>
          <p className="text-sm text-gray-400 mt-1">{totalStudents} student{totalStudents !== 1 ? 's' : ''} enrolled across {courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students…"
            className="w-full rounded-xl bg-white border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#1b1e26]/20 focus:ring-4 focus:ring-[#1b1e26]/5 transition-all"
          />
        </div>
        <select
          value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}
          className="rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#1b1e26]/20 focus:ring-4 focus:ring-[#1b1e26]/5 transition-all"
        >
          <option value="">All courses</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <p className="text-sm font-semibold text-[#1b1e26]">No students found</p>
          <p className="text-sm text-gray-400 mt-1">{filterCourse ? 'No enrollments for this course yet.' : 'No students are enrolled in your courses yet.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">Student</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">Course</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">Status</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">Progress</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s, i) => (
                  <motion.tr
                    key={`${s.studentId}-${s.courseId}`}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-[#f7f8fa] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-[#1b1e26] text-[#d0f24a] text-xs font-bold flex items-center justify-center shrink-0">
                          {s.studentName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1b1e26] truncate">{s.studentName}</p>
                          <p className="text-xs text-gray-400 truncate">{s.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-[#1b1e26] font-medium">{s.courseTitle}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[s.enrollmentStatus] || 'bg-gray-100 text-gray-500'}`}>
                        {s.enrollmentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#d0f24a] rounded-full" style={{ width: `${s.progressPercent}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-[#1b1e26] tabular-nums">{s.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-500">{new Date(s.enrolledAt).toLocaleDateString()}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerStudentsPage;
