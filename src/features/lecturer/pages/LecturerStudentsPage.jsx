import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { lecturerCourseService } from '../../../services/api';
import { apiClient } from '../../../services/apiClient';
import { DataTable } from '../../../components/shared/DataTable';
import { useToast } from '../../../context/ToastContext';

const ENROLL_BADGE = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  PENDING: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  DROPPED: 'bg-red-50 text-red-600',
};

const AVATAR_STYLES = [
  'bg-accent/20 text-accent-text', 'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',   'bg-emerald-100 text-emerald-700',
  'bg-[#1b1e26]/[0.06] text-[#1b1e26]/70', 'bg-violet-100 text-violet-700',
  'bg-fuchsia-100 text-fuchsia-700','bg-teal-100 text-teal-700',
];

const initialsOf = (name) =>
  (name || '?').split(/[\s_.-]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const avatarStyle = (seed) => {
  let h = 0;
  const s = seed || '?';
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_STYLES[h % AVATAR_STYLES.length];
};

const filterFieldClass =
  'w-full text-[13px] px-3 py-2 rounded-lg border border-[#1b1e26]/10 bg-[#f7f8fa] text-[#1b1e26] focus:bg-white focus:ring-4 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all';
const filterSelectClass = `${filterFieldClass} appearance-none pr-8 cursor-pointer`;
const filterLabelClass = 'text-[10px] font-semibold text-[#1b1e26]/45 uppercase tracking-[0.12em]';

const SelectChevron = () => (
  <svg className="w-3.5 h-3.5 text-[#1b1e26]/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CoursesModal = ({ student, onClose }) => {
  if (!student) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#1b1e26]/[0.06] shadow-[0_20px_60px_rgba(27,30,38,0.25)] w-full max-w-lg max-h-[80vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-150" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1b1e26]/[0.06]">
          <h3 className="text-[15px] font-semibold text-[#1b1e26]">{student.studentName} — Enrolled Courses</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1b1e26] hover:bg-[#f7f8fa] transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-3">
          {student.courses?.length > 0 ? student.courses.map((c) => (
            <div key={c.courseId} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-[#f7f8fa]">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1b1e26] truncate">{c.courseTitle}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Enrolled {new Date(c.enrolledAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${ENROLL_BADGE[c.enrollmentStatus] || 'bg-gray-100 text-gray-500'}`}>{c.enrollmentStatus}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${c.progressPercent}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#1b1e26] tabular-nums">{c.progressPercent}%</span>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-400 text-center py-6">Not enrolled in any courses.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const LecturerStudentsPage = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [coursesTarget, setCoursesTarget] = useState(null);

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

  const grouped = useMemo(() => {
    const map = students.reduce((acc, s) => {
      if (!acc[s.studentId]) {
        acc[s.studentId] = { studentId: s.studentId, studentName: s.studentName, studentEmail: s.studentEmail, courses: [], totalProgress: 0 };
      }
      acc[s.studentId].courses.push({ courseId: s.courseId, courseTitle: s.courseTitle, enrollmentStatus: s.enrollmentStatus, progressPercent: s.progressPercent, enrolledAt: s.enrolledAt });
      acc[s.studentId].totalProgress += s.progressPercent;
      return acc;
    }, {});
    return Object.values(map).map((g) => ({
      ...g,
      avgProgress: Math.round(g.totalProgress / g.courses.length),
      latestCourse: g.courses.reduce((a, b) => new Date(a.enrolledAt) > new Date(b.enrolledAt) ? a : b),
    }));
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return grouped.filter((g) => {
      if (q && !(g.studentName || '').toLowerCase().includes(q) && !(g.studentEmail || '').toLowerCase().includes(q)) return false;
      if (filterStatus !== 'All') {
        const statuses = g.courses.map((c) => c.enrollmentStatus);
        if (!statuses.includes(filterStatus)) return false;
      }
      if (filterDateFrom || filterDateTo) {
        const enrolled = g.latestCourse.enrolledAt ? g.latestCourse.enrolledAt.slice(0, 10) : '';
        if (!enrolled) return false;
        if (filterDateFrom && enrolled < filterDateFrom) return false;
        if (filterDateTo && enrolled > filterDateTo) return false;
      }
      return true;
    });
  }, [grouped, search, filterStatus, filterDateFrom, filterDateTo]);

  const resetFilters = () => {
    setSearch('');
    setFilterStatus('All');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const columns = [
    {
      key: 'name', header: 'Name', sortable: true, sortValue: (g) => g.studentName || '',
      render: (g) => {
        const label = g.studentName || '?';
        return (
          <div className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${avatarStyle(label)}`}>
              {initialsOf(label)}
            </span>
            <div>
              <span className="font-medium text-[#1b1e26] whitespace-nowrap">{g.studentName || '—'}</span>
              <p className="text-[11px] text-slate-400">{g.studentEmail || '—'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'email', header: 'Email', sortable: true, sortValue: (g) => g.studentEmail || '',
      render: (g) => <span className="text-[#1b1e26]/45">{g.studentEmail || '—'}</span>,
    },
    {
      key: 'courses', header: 'Courses', sortable: true, sortValue: (g) => g.courses?.length || 0,
      render: (g) => {
        const count = g.courses?.length || 0;
        return (
          <button
            onClick={() => setCoursesTarget(g)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-[#f7f8fa] text-[#1b1e26]/80 border border-[#1b1e26]/10 hover:bg-accent/20 hover:border-accent/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            {count} {count === 1 ? 'course' : 'courses'}
          </button>
        );
      },
    },
    {
      key: 'status', header: 'Status', sortable: true, sortValue: (g) => {
        const statuses = [...new Set(g.courses.map((c) => c.enrollmentStatus))];
        return statuses.join(', ');
      },
      render: (g) => {
        const statuses = [...new Set(g.courses.map((c) => c.enrollmentStatus))];
        return (
          <div className="flex flex-wrap gap-1">
            {statuses.map((st) => (
              <span key={st} className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${ENROLL_BADGE[st] || 'bg-gray-100 text-gray-500'}`}>{st}</span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'progress', header: 'Progress', sortable: true, sortValue: (g) => g.avgProgress,
      render: (g) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: `${g.avgProgress}%` }} />
          </div>
          <span className="text-[10px] font-semibold text-[#1b1e26] tabular-nums">{g.avgProgress}%</span>
        </div>
      ),
    },
    {
      key: 'enrolled', header: 'Enrolled', sortable: true,
      sortValue: (g) => (g.latestCourse?.enrolledAt ? new Date(g.latestCourse.enrolledAt).getTime() : 0),
      render: (g) => (
        <span className="text-gray-400">{g.latestCourse?.enrolledAt ? new Date(g.latestCourse.enrolledAt).toLocaleDateString() : '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Teaching</span>
          <h1 className="text-[19px] font-medium tracking-tight mt-1 text-[#1b1e26]">My Students</h1>
          <p className="text-[12px] text-slate-500 mt-1">{grouped.length} student{grouped.length !== 1 ? 's' : ''} enrolled across {courses.length} course{courses.length !== 1 ? 's' : ''}.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#1b1e26]/[0.06] shadow-sm px-3 py-2.5">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="flex-1 min-w-[200px] max-w-[340px] flex flex-col gap-1">
            <label className={filterLabelClass}>Search</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
              </svg>
              <input
                type="text" placeholder="Name or email…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className={`${filterFieldClass} pl-9`}
              />
            </div>
          </div>
          <div className="w-[180px] flex flex-col gap-1">
            <label className={filterLabelClass}>Course</label>
            <div className="relative">
              <select className={filterSelectClass} value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
                <option value="">All courses</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <SelectChevron />
            </div>
          </div>
          <div className="w-[130px] flex flex-col gap-1">
            <label className={filterLabelClass}>Status</label>
            <div className="relative">
              <select className={filterSelectClass} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="DROPPED">Dropped</option>
              </select>
              <SelectChevron />
            </div>
          </div>
          <div className="w-[160px] flex flex-col gap-1">
            <label className={filterLabelClass}>From</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date" aria-label="Enrolled from"
                className={`${filterFieldClass} pl-9`}
                value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
          </div>
          <div className="w-[160px] flex flex-col gap-1">
            <label className={filterLabelClass}>To</label>
            <div className="relative">
              <svg className="w-4 h-4 text-[#1b1e26]/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date" aria-label="Enrolled to"
                className={`${filterFieldClass} pl-9`}
                value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={resetFilters}
            className="shrink-0 h-[34px] px-4 rounded-full border border-red-200 text-red-500 text-[13px] font-semibold hover:bg-red-50 hover:border-red-300 inline-flex items-center gap-1.5 transition-colors active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Clear All
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        keyField="studentId"
        loading={loading}
        minWidth={1020}
        skeletonRows={10}
        pageSize={10}
        rowLabel="students"
        emptyTitle={grouped.length === 0 ? 'No students yet' : 'No matches'}
        emptyMessage={grouped.length === 0 ? 'Students will appear once they enroll in your courses.' : 'No students match the current filters.'}
      />

      <CoursesModal student={coursesTarget} onClose={() => setCoursesTarget(null)} />
    </div>
  );
};

export default LecturerStudentsPage;
