import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { learnerCourseService } from '../../../services/api';

const STATUS_META = {
  ACTIVE: { label: 'In Progress', cls: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
  PENDING: { label: 'Pending', cls: 'bg-gray-100 text-gray-500' },
  DROPPED: { label: 'Dropped', cls: 'bg-red-100 text-red-600' },
};

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'ACTIVE', label: 'In Progress' },
  { id: 'COMPLETED', label: 'Completed' },
];

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    learnerCourseService.listMyCourses()
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = filter === 'ALL' ? courses : courses.filter((c) => c.status === filter);

  const counts = { ALL: courses.length, ACTIVE: 0, COMPLETED: 0 };
  courses.forEach((c) => { if (counts[c.status] !== undefined) counts[c.status]++; });

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-pulse">
      {[0, 1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-200/70 rounded-xl" />)}
    </div>
  );

  if (!courses.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="w-14 h-14 rounded-2xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center mb-4">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
      </span>
      <h2 className="text-base font-semibold text-[#1b1e26]">No enrolled courses yet</h2>
      <p className="text-sm text-gray-400 mt-1">Browse the catalog and enroll in a course to get started.</p>
      <Link to="/courses" className="mt-4 px-5 py-2.5 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black transition-colors">Browse Courses</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gray-400">Learning</span>
        <h1 className="text-[19px] font-medium tracking-tight mt-1.5 text-[#1b1e26]">My Courses</h1>
        <p className="text-[12px] text-slate-500 mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} enrolled.</p>
      </div>

      <div className="inline-flex rounded-xl bg-white border border-[#1b1e26]/[0.06] shadow-sm p-1 gap-1">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
                active ? 'bg-[#1b1e26] text-white shadow-sm' : 'text-gray-400 hover:text-[#1b1e26] hover:bg-[#f7f8fa]'
              }`}
            >
              {f.label}
              <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                active ? 'bg-[#d0f24a] text-[#1b1e26]' : 'bg-[#1b1e26]/[0.06] text-[#1b1e26]/50'
              }`}>
                {counts[f.id] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#1b1e26]/15 p-14 text-center">
          <span className="w-14 h-14 rounded-2xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </span>
          <p className="text-base font-semibold text-[#1b1e26]">{filter === 'ALL' ? 'No courses yet' : 'Nothing in this filter'}</p>
          <p className="text-sm text-gray-400 mt-1">{filter === 'ALL' ? 'Browse the catalog and enroll in a course to get started.' : 'Try a different status filter.'}</p>
          {filter === 'ALL' && (
            <Link to="/courses" className="mt-4 inline-block px-6 py-2.5 rounded-xl text-sm font-bold bg-[#d0f24a] text-[#1b1e26] hover:bg-[#c4e83a] transition-colors active:scale-[0.98] shadow-sm">Browse Courses</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {visible.map((c) => {
            const meta = STATUS_META[c.status] || { label: c.status, cls: 'bg-gray-100 text-gray-500' };
            const pct = c.overallProgressPercent || 0;
            return (
              <div
                key={c.courseId}
                className="group bg-white rounded-xl border border-[#1b1e26]/[0.06] shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col"
              >
                <Link to={`/learning/course/${c.courseId}`} className="relative block h-[68px] shrink-0">
                  {c.coverImageUrl ? (
                    <img src={c.coverImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1b1e26] to-[#343b49] flex items-center justify-center">
                      <span className="w-7 h-7 rounded-lg bg-[#d0f24a] text-[#1b1e26] text-[11px] font-bold flex items-center justify-center">
                        {(c.courseTitle || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${meta.cls}`}>{meta.label}</span>
                </Link>

                <div className="p-2.5 flex flex-col flex-1">
                  <Link to={`/learning/course/${c.courseId}`} className="block">
                    <h3 className="text-[13px] font-medium text-[#1b1e26] leading-snug line-clamp-1 group-hover:underline decoration-[#d0f24a] decoration-2 underline-offset-2">
                      {c.courseTitle}
                    </h3>
                  </Link>
                  {c.instructorName && (
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">By {c.instructorName}</p>
                  )}

                  {c.summary && (
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed line-clamp-1">{c.summary}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.estimatedHours && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#f7f8fa] text-[#1b1e26]/70 border border-[#1b1e26]/[0.06]">{c.estimatedHours}h</span>
                    )}
                    {c.level && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#d0f24a]/20 text-[#1b1e26]">{c.level.toLowerCase()}</span>
                    )}
                    {c.totalItems > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#f7f8fa] text-[#1b1e26]/70 border border-[#1b1e26]/[0.06]">{c.completedItems}/{c.totalItems} items</span>
                    )}
                  </div>

                  <div className="space-y-1 mt-2 pt-2 border-t border-[#1b1e26]/[0.05]">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-[#1b1e26]">{pct}%</span>
                      <span className="text-gray-400">{pct === 100 ? 'Done' : 'In progress'}</span>
                    </div>
                    <div className="h-1.5 bg-[#f0f1f3] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100
                            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                            : 'linear-gradient(90deg, #d0f24a, #a3d420)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end mt-2 pt-1">
                    {c.status !== 'COMPLETED' && (
                      <span className="px-3 py-1 rounded-lg bg-[#1b1e26] text-white text-[10px] font-bold tracking-wide hover:bg-black transition-colors active:scale-[0.97]">
                        Resume
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
