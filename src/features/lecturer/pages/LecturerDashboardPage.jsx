import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const API_BASE_URL = 'http://localhost:5050/api/lecturer';

const STATS = [
  {
    key: 'courses',
    label: 'Active Courses',
    hint: 'Currently teaching',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    featured: true,
  },
  {
    key: 'students',
    label: 'Enrolled Students',
    hint: 'Across all courses',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    key: 'pendingGrading',
    label: 'Pending Grading',
    hint: 'Awaiting review',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  },
  {
    key: 'graded',
    label: 'Graded Submissions',
    hint: 'Completed reviews',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

const QUICK_ACTIONS = [
  {
    label: 'My Courses',
    sub: 'View course materials and modules',
    path: '/lecturer/courses',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    label: 'Assignments & Grading',
    sub: 'Create assignments, grade submissions',
    path: '/lecturer/assignments',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: 'My Students',
    sub: 'View roster and progress',
    path: '/lecturer/students',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    label: 'Timetable',
    sub: 'View your teaching schedule',
    path: '/lecturer/timetable',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
];

export const LecturerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = (user?.name || 'Lecturer').split(' ')[0];
  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;

    const load = async () => {
      try {
        const [coursesRes, studentsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/courses?lecturerId=${user.id}`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/students?lecturerId=${user.id}`, { headers: getHeaders() }),
        ]);

        if (cancelled) return;

        let courseData = [];
        if (coursesRes.ok) {
          const d = await coursesRes.json();
          courseData = Array.isArray(d) ? d : d.data || [];
          if (!cancelled) setCourses(courseData);
        }

        if (studentsRes.ok) {
          const d = await studentsRes.json();
          if (!cancelled) setStudents(Array.isArray(d) ? d : d.data || []);
        }

        const ids = courseData.map(c => c.id).filter(Boolean);
        if (ids.length > 0) {
          const [subsRes, assignsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/submissions?courseIds=${ids.join(',')}`, { headers: getHeaders() }),
            fetch(`${API_BASE_URL}/assignments?courseIds=${ids.join(',')}`, { headers: getHeaders() }),
          ]);
          if (cancelled) return;
          if (subsRes.ok) {
            const d = await subsRes.json();
            if (!cancelled) setAllSubmissions(Array.isArray(d) ? d : d.data || []);
          }
          if (assignsRes.ok) {
            const d = await assignsRes.json();
            if (!cancelled) setAllAssignments(Array.isArray(d) ? d : d.data || []);
          }
        }
      } catch (_) {
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user, token, getHeaders]);

  const pendingGrading = allSubmissions.filter(s => s.status === 'submitted');
  const gradedCount = allSubmissions.filter(s => s.status === 'graded').length;

  const statValue = (key) => {
    if (loading) return '…';
    switch (key) {
      case 'courses': return courses.length;
      case 'students': return students.length;
      case 'pendingGrading': return pendingGrading.length;
      case 'graded': return gradedCount;
      default: return '—';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-gray-400">{dateLabel}</p>
          <h1 className="text-[19px] font-medium text-[#1b1e26] tracking-tight leading-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-[12px] text-gray-500 mt-1">
            Here's what's happening across your courses today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className={`group rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              s.featured
                ? 'bg-[#1b1e26] border-[#1b1e26] text-white'
                : 'bg-white border-[#1b1e26]/[0.06] shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                s.featured ? 'bg-[#d0f24a] text-[#1b1e26]' : 'bg-[#d0f24a]/20 text-[#1b1e26]'
              }`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.icon} />
                </svg>
              </span>
            </div>
            <p className={`text-3xl font-semibold tracking-tight mt-4 ${s.featured ? 'text-white' : 'text-[#1b1e26]'}`}>
              {statValue(s.key)}
            </p>
            <p className={`text-[13px] font-semibold mt-1 ${s.featured ? 'text-white/80' : 'text-[#1b1e26]/70'}`}>
              {s.label}
            </p>
            <p className={`text-xs mt-0.5 ${s.featured ? 'text-white/40' : 'text-gray-400'}`}>{s.hint}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[#1b1e26] mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className="group flex items-center gap-3.5 rounded-2xl bg-white border border-[#1b1e26]/[0.06] shadow-sm p-4 transition-all duration-200 hover:border-[#d0f24a] hover:shadow-md w-full text-left"
            >
              <span className="w-11 h-11 rounded-xl bg-[#f3f4f6] group-hover:bg-[#d0f24a]/25 text-[#1b1e26] flex items-center justify-center shrink-0 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={a.icon} />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#1b1e26] truncate">{a.label}</span>
                <span className="block text-xs text-gray-400 truncate">{a.sub}</span>
              </span>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-[#1b1e26] ml-auto shrink-0 transition-all group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {courses.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#1b1e26] mb-3">Your Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map((course) => {
              const courseAssignments = allAssignments.filter(a => a.courseId === course.id);
              const assignIds = courseAssignments.map(a => a.id);
              const subs = allSubmissions.filter(s => assignIds.includes(s.assignmentId));
              const graded = subs.filter(s => s.status === 'graded').length;
              const total = subs.length;
              const pct = total > 0 ? Math.round((graded / total) * 100) : 0;
              return (
                <div key={course.id} className="group rounded-2xl bg-white border border-[#1b1e26]/[0.06] shadow-sm p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-1 bg-[#d0f24a]/20 text-[#1b1e26] rounded uppercase tracking-wider">
                      {course.code || 'Course'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-[#1b1e26] leading-snug">{course.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{course.studentsCount || 0} students · {courseAssignments.length} assignments</p>
                  {total > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Graded</span>
                        <span className="font-semibold text-[#1b1e26]">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#d0f24a] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pendingGrading.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#1b1e26] mb-3">Pending Review</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingGrading.slice(0, 6).map((sub) => (
              <div key={sub.id} className="rounded-2xl bg-white border border-[#1b1e26]/[0.06] shadow-sm p-4 transition-all duration-200 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#1b1e26]">{sub.studentName || sub.studentId}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub.assignmentTitle || sub.assignmentId}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-lg border border-amber-200">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-[#1b1e26]/15 bg-white/60 p-5 flex items-center gap-4">
        <span className="w-10 h-10 rounded-xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-[#1b1e26]">More features are on the way</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Timetable, messaging, and advanced analytics will appear here in upcoming releases.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboardPage;
