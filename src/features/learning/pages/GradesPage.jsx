import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { learnerCourseService } from '../../../services/api';

const STATUS_LABEL = { ACTIVE: 'In Progress', COMPLETED: 'Completed', PENDING: 'Pending', DROPPED: 'Dropped' };
const STATUS_PILL = {
  ACTIVE: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-gray-100 text-gray-500',
  DROPPED: 'bg-red-100 text-red-600',
};
const TYPE_ICON = {
  QUIZ: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>,
  ASSIGNMENT: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  VIDEO: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
};

const emptyGrades = {
  totalCourses: 0, inProgress: 0, completed: 0, overallAverageScore: 0, enrollments: [],
};

function ScoreRing({ pct, size = 36, stroke = 3 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#ef4444';
  return (
    <svg width={size} height={size} className="rotate-[-90deg] shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f1f3" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

const GradesPage = () => {
  const [data, setData] = useState(emptyGrades);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const prevId = useRef(null);

  useEffect(() => {
    learnerCourseService.getGrades()
      .then((res) => {
        const d = res || emptyGrades;
        setData(d);
        if (d.enrollments?.length) { setSelected(d.enrollments[0]); prevId.current = d.enrollments[0].courseId; }
      })
      .catch(() => { setData(emptyGrades); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex gap-6 h-[calc(100vh-100px)]">
      <div className="w-56 shrink-0 space-y-2 animate-pulse">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-200/70 rounded-xl" />)}
      </div>
      <div className="flex-1 space-y-4 animate-pulse">
        <div className="h-40 bg-gray-200/70 rounded-xl" />
        <div className="h-64 bg-gray-200/70 rounded-xl" />
      </div>
    </div>
  );

  if (!data.enrollments?.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="w-14 h-14 rounded-2xl bg-[#d0f24a]/20 text-[#1b1e26] flex items-center justify-center mb-4">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
      </span>
      <h2 className="text-base font-semibold text-[#1b1e26]">No grades yet</h2>
      <p className="text-sm text-gray-400 mt-1">Enroll in a course and start learning to see your grades.</p>
      <Link to="/courses" className="mt-4 px-5 py-2.5 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black transition-colors">Browse Courses</Link>
    </div>
  );

  const progressBg = (pct) => pct === 100
    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
    : 'linear-gradient(90deg, #d0f24a, #a3d420)';

  const scoreColor = (s) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-amber-600' : 'text-red-500';

  const ItemsTable = ({ course }) => {
    const graded = (course.items || []).filter((i) => i.score != null);
    const ungraded = (course.items || []).filter((i) => i.score == null);
    if (!course.items?.length) return (
      <div className="flex flex-col items-center py-12 text-center">
        <svg className="w-10 h-10 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 14l2 2 4-4" /></svg>
        <p className="text-sm font-semibold text-[#1b1e26]">No graded items yet</p>
        <p className="text-xs text-gray-400 mt-1">Complete quizzes and assignments to see scores here.</p>
      </div>
    );
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 border-b border-[#1b1e26]/[0.06]">
              <th className="pb-2.5 pr-4 font-medium w-[60%]">Name</th>
              <th className="pb-2.5 pr-4 font-medium w-[15%]">Type</th>
              <th className="pb-2.5 pr-4 font-medium text-right">Score</th>
              <th className="pb-2.5 font-medium text-right w-28">%</th>
            </tr>
          </thead>
          <tbody>
            {graded.map((item) => {
              const pct = item.maxScore ? Math.round((item.score / item.maxScore) * 100) : 0;
              return (
                <motion.tr
                  key={item.itemId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border-b border-[#1b1e26]/[0.04] text-[13px] hover:bg-[#f7f8fa] transition-colors group"
                >
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-[#f7f8fa] flex items-center justify-center text-[#1b1e26]/50 group-hover:bg-white transition-colors">
                        {TYPE_ICON[item.itemType] || <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /></svg>}
                      </span>
                      <span className="font-semibold text-[#1b1e26] truncate">{item.itemTitle}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">{item.itemType}</span>
                  </td>
                  <td className={`py-2.5 pr-4 text-right font-bold ${scoreColor(pct)}`}>{item.score}<span className="text-gray-400 font-normal">/{item.maxScore ?? '—'}</span></td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-[12px] font-bold tabular-nums ${scoreColor(pct)}`}>{pct}%</span>
                      <ScoreRing pct={pct} size={22} stroke={2.5} />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
            {ungraded.map((item) => (
              <tr key={item.itemId} className="border-b border-[#1b1e26]/[0.04] text-[13px] opacity-40 hover:opacity-70 transition-all">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#f7f8fa] flex items-center justify-center text-gray-400">
                      {TYPE_ICON[item.itemType] || <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /></svg>}
                    </span>
                    <span className="font-semibold text-[#1b1e26] truncate">{item.itemTitle}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-4"><span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">{item.itemType}</span></td>
                <td className="py-2.5 pr-4 text-right text-gray-400">—</td>
                <td className="py-2.5 text-right"><span className="text-[11px] text-gray-400">Pending</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex gap-6">
      {/* Course sidebar */}
      <div className="w-56 shrink-0 hidden md:block">
        <div className="sticky top-6">
          <div className="flex items-center gap-2 px-3 mb-4">
            <div className="w-1 h-4 rounded-full bg-[#d0f24a]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">Courses</p>
          </div>
          <div className="space-y-1">
            {data.enrollments.map((c) => {
              const active = selected?.courseId === c.courseId;
              const sc = c.averageScore;
              return (
                <button
                  key={c.courseId}
                  onClick={() => { prevId.current = selected?.courseId; setSelected(c); }}
                  className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                    active
                      ? 'bg-white border border-[#1b1e26]/[0.06] shadow-sm'
                      : 'hover:bg-white/60 border border-transparent'
                  }`}
                >
                  {active && <motion.div layoutId="sidebar-active" className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#d0f24a]" />}
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                    active ? 'bg-[#d0f24a] text-[#1b1e26]' : 'bg-[#1b1e26] text-white'
                  }`}>
                    {(c.courseTitle || '?').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[#1b1e26] truncate leading-tight">{c.courseTitle}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {sc > 0 && <ScoreRing pct={sc} size={14} stroke={2} />}
                      <p className={`text-[11px] font-bold ${sc > 0 ? scoreColor(sc) : 'text-gray-400'}`}>
                        {sc > 0 ? `${sc}%` : '—'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile course selector */}
      <div className="md:hidden w-full">
        <select
          value={selected?.courseId || ''}
          onChange={(e) => { prevId.current = selected?.courseId; setSelected(data.enrollments.find((c) => c.courseId === e.target.value)); }}
          className="w-full px-4 py-2.5 rounded-xl border border-[#1b1e26]/[0.1] bg-white text-sm font-semibold text-[#1b1e26] appearance-none"
        >
          {data.enrollments.map((c) => (
            <option key={c.courseId} value={c.courseId}>{c.courseTitle} — {c.averageScore > 0 ? `${c.averageScore}%` : 'No grade'}</option>
          ))}
        </select>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.courseId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Course header */}
              <div className="bg-white rounded-xl border border-[#1b1e26]/[0.06] shadow-sm overflow-hidden">
                <div className="relative bg-gradient-to-r from-[#1b1e26] to-[#343b49] px-5 py-5 overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#d0f24a]/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <h1 className="text-[17px] font-bold text-white truncate">{selected.courseTitle}</h1>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${STATUS_PILL[selected.status] || 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_LABEL[selected.status] || selected.status}
                        </span>
                      </div>
                      {selected.courseCode && <p className="text-[11px] text-gray-400">{selected.courseCode}</p>}
                    </div>
                    <Link
                      to={`/learning/course/${selected.courseId}`}
                      className="shrink-0 px-3.5 py-2 rounded-lg bg-[#d0f24a] text-[#1b1e26] text-[11px] font-bold hover:bg-[#c4e83a] active:scale-[0.97] transition-all shadow-sm"
                    >
                      Open Course
                    </Link>
                  </div>
                </div>

                <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {[
                    { label: 'Progress', value: `${selected.progressPercent}%`, color: 'text-[#1b1e26]', bar: true, pct: selected.progressPercent },
                    { label: 'Items', value: `${selected.completedItems}/${selected.totalItems}`, color: 'text-[#1b1e26]', sub: 'completed' },
                    { label: 'Average', value: selected.averageScore > 0 ? `${selected.averageScore}%` : '—', color: selected.averageScore > 0 ? scoreColor(selected.averageScore) : 'text-gray-400', ring: selected.averageScore > 0, pct: selected.averageScore },
                    { label: 'Graded', value: `${selected.items?.filter((i) => i.score != null).length || 0}/${selected.items?.length || 0}`, color: 'text-[#1b1e26]', sub: 'items scored' },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{s.label}</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        {s.ring && <ScoreRing pct={s.pct} size={22} stroke={2.5} />}
                      </div>
                      {s.bar && (
                        <div className="h-1.5 bg-[#f0f1f3] rounded-full mt-1.5 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${s.pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            style={{ background: progressBg(s.pct) }}
                          />
                        </div>
                      )}
                      {s.sub && <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats mini chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'total courses', value: data.totalCourses, cls: 'text-[#1b1e26]' },
                  { label: 'in progress', value: data.inProgress, cls: 'text-amber-600' },
                  { label: 'completed', value: data.completed, cls: 'text-green-600' },
                  { label: 'overall avg', value: `${data.overallAverageScore}%`, cls: scoreColor(data.overallAverageScore) },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#1b1e26]/[0.06] text-[11px] shadow-sm hover:shadow-md transition-shadow">
                    <span className={`font-bold ${s.cls}`}>{s.value}</span>
                    <span className="text-gray-400">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Items table */}
              <div className="bg-white rounded-xl border border-[#1b1e26]/[0.06] shadow-sm">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#1b1e26]/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-[#d0f24a]" />
                    <h2 className="text-[13px] font-semibold text-[#1b1e26]">Graded Items</h2>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">{selected.items?.length || 0} total</span>
                </div>
                <div className="px-5 py-2">
                  <ItemsTable course={selected} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GradesPage;
