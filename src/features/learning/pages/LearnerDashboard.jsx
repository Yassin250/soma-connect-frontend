import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { learnerCourseService } from '../../../services/api';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const LEVEL_LABEL = { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' };

// Deterministic cover gradient so cards without an uploaded image still look varied.
const GRADIENTS = [
  'from-[#6366f1] to-[#8b5cf6]',
  'from-[#0ea5e9] to-[#22d3ee]',
  'from-[#f59e0b] to-[#f97316]',
  'from-[#10b981] to-[#34d399]',
  'from-[#ec4899] to-[#f43f5e]',
  'from-[#3b4a6b] to-[#1b1e26]',
];
const gradFor = (str = '') =>
  GRADIENTS[[...String(str)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % GRADIENTS.length];

/* ── Animated SVG progress ring ── */
const ProgressRing = ({ value = 0, size = 168, stroke = 13, track = 'rgba(255,255,255,0.12)', bar = 'var(--clr-accent)', children }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bar} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
};

const Cover = ({ course, className = '', overlay = true }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${gradFor(course.courseTitle)} ${className}`}>
    {course.coverImageUrl && (
      <img src={course.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
    )}
    {overlay && <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />}
  </div>
);

export const LearnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await learnerCourseService.listMyCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load your courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const firstName = user?.name?.split(' ')[0] || 'Learner';

  const inProgress = courses.filter((c) => c.status === 'ACTIVE' && c.overallProgressPercent > 0 && c.overallProgressPercent < 100);
  const completed = courses.filter((c) => c.status === 'COMPLETED');
  const notStarted = courses.filter((c) => c.status === 'ACTIVE' && c.overallProgressPercent === 0);
  const certificatesEarned = completed.filter((c) => c.certificateEnabled).length;
  const totalHours = courses.reduce((sum, c) => sum + (c.estimatedHours || 0), 0);
  const lessonsDone = courses.reduce((sum, c) => sum + (c.completedItems || 0), 0);
  const level = Math.floor(lessonsDone / 10) + 1;
  const avgProgress = courses.length
    ? Math.round(courses.reduce((sum, c) => sum + c.overallProgressPercent, 0) / courses.length)
    : 0;

  // The one course we invite the learner to jump back into.
  const featured = inProgress[0] || notStarted[0] || completed[0] || null;

  const STAT_RIBBON = [
    { label: 'Enrolled', value: courses.length, tone: 'lime',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'In progress', value: inProgress.length, tone: 'amber', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Completed', value: completed.length, tone: 'emerald', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { label: 'Certificates', value: certificatesEarned, tone: 'violet', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  ];
  const iconTileStyles = {
    lime: 'bg-accent text-[#1b1e26]',
    amber: 'bg-amber-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    violet: 'bg-violet-500 text-white',
  };

  const ctaLabel = (c) => (c.status === 'COMPLETED' ? 'Review course' : c.overallProgressPercent > 0 ? 'Continue' : 'Start course');

  const CourseCard = ({ course }) => (
    <motion.div
      {...fadeUp}
      onClick={() => navigate(`/learning/course/${course.courseId}`)}
      className="group cursor-pointer bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_8px_24px_rgba(27,30,38,0.1)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      <Cover course={course} className="h-[68px]">
        <div className="absolute inset-0 p-2 flex items-start justify-between">
          {course.category && (
            <span className="text-[9px] font-bold uppercase tracking-wide text-white bg-black/25 backdrop-blur-sm px-2 py-0.5 rounded-full">{course.category}</span>
          )}
          {course.status === 'COMPLETED' && (
            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white inline-flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Done
            </span>
          )}
        </div>
      </Cover>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[12px] font-bold text-[#1b1e26] leading-snug line-clamp-2">{course.courseTitle}</h3>
        <p className="text-[10px] text-gray-500 mt-0.5 truncate">{[LEVEL_LABEL[course.level], course.instructorName || course.entityName].filter(Boolean).join(' · ')}</p>
        {course.summary && <p className="text-[10px] text-gray-400 mt-1 leading-relaxed line-clamp-2">{course.summary}</p>}

        <div className="mt-auto pt-2.5">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-gray-500">{course.completedItems}/{course.totalItems} lessons</span>
            <span className="text-[10px] font-bold text-[#1b1e26]">{course.overallProgressPercent}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2.5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${course.overallProgressPercent}%` }} transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${course.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-gradient-to-r from-accent to-accent-dark'}`} />
          </div>
          <div className="w-full py-2 rounded-lg bg-[#1b1e26] text-white text-[10px] font-bold text-center group-hover:bg-black transition-colors inline-flex items-center justify-center gap-1">
            {ctaLabel(course)}
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const Section = ({ title, list }) => list.length > 0 && (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{title}</p>
        <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{list.length}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {list.map((c) => <CourseCard key={c.enrollmentId} course={c} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

        {/* ── HERO — greeting + big overall-progress ring ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#20242e] via-[#181b22] to-[#101217] text-white px-7 sm:px-10 py-9 sm:py-10"
        >
          <div className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 -right-16 w-80 h-80 rounded-full bg-[#39435a]/40 blur-[110px] pointer-events-none" />
          <div className="absolute top-[20%] right-[26%] w-36 h-36 rounded-[2rem] border border-white/10 rotate-[18deg] pointer-events-none hidden lg:block" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-accent uppercase tracking-[0.18em]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                My Learning
              </span>
              <h1 className="mt-3 text-[2rem] sm:text-[2.7rem] font-semibold tracking-tight leading-[1.08]">
                Welcome back, {firstName} <span className="inline-block">👋</span>
              </h1>
              <p className="mt-2.5 text-white/55 text-sm sm:text-base leading-relaxed max-w-lg">
                {courses.length === 0
                  ? "Your learning journey starts here — pick a course and dive in."
                  : `You've completed ${lessonsDone} lesson${lessonsDone === 1 ? '' : 's'} across ${courses.length} course${courses.length === 1 ? '' : 's'}. Keep the momentum going.`}
              </p>

              {/* Glass stat pills */}
              <div className="mt-6 flex flex-wrap gap-2.5">
                {[
                  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: `Level ${level}` },
                  { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: `${lessonsDone} lessons done` },
                  { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: `${totalHours}h of content` },
                ].map((p) => (
                  <span key={p.label} className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-xl px-3.5 py-2 text-xs font-semibold text-white/85">
                    <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={p.icon} /></svg>
                    {p.label}
                  </span>
                ))}
              </div>
            </div>

            {/* The centerpiece — animated overall progress ring */}
            <div className="shrink-0 mx-auto lg:mx-0">
              <ProgressRing value={avgProgress}>
                <span className="text-[2.75rem] font-extrabold leading-none tracking-tight">{avgProgress}<span className="text-xl align-top">%</span></span>
                <span className="mt-1 text-[11px] font-semibold text-white/45 uppercase tracking-[0.15em]">Avg progress</span>
              </ProgressRing>
            </div>
          </div>
        </motion.div>

        {/* ── RESUME SPOTLIGHT ── */}
        {!loading && !error && featured && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
            className="grid md:grid-cols-[300px_1fr] bg-white rounded-3xl border border-gray-100 shadow-[0_16px_50px_rgba(27,30,38,0.10)] overflow-hidden"
          >
            <Cover course={featured} className="h-44 md:h-auto min-h-[180px]">
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <span className="self-start text-[10px] font-bold uppercase tracking-wide text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  {featured.status === 'COMPLETED' ? 'Completed' : featured.overallProgressPercent > 0 ? 'In progress' : 'Ready to start'}
                </span>
                {featured.category && <span className="text-white/90 text-xs font-semibold">{featured.category}</span>}
              </div>
            </Cover>

            <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-accent-text uppercase tracking-[0.15em] mb-1.5">
                  {featured.overallProgressPercent > 0 && featured.status !== 'COMPLETED' ? 'Jump back in' : 'Featured for you'}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1b1e26] tracking-tight leading-tight">{featured.courseTitle}</h2>
                <p className="text-sm text-gray-500 mt-1.5">{[LEVEL_LABEL[featured.level], featured.instructorName || featured.entityName].filter(Boolean).join(' · ')}</p>
                {featured.summary && <p className="text-sm text-gray-400 mt-2 leading-relaxed line-clamp-2 max-w-xl">{featured.summary}</p>}

                <button
                  onClick={() => navigate(`/learning/course/${featured.courseId}`)}
                  className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-[#1b1e26] text-sm font-bold hover:bg-accent-hover active:scale-[0.98] transition-all shadow-sm"
                >
                  {featured.status === 'COMPLETED' ? 'Review course' : featured.overallProgressPercent > 0 ? 'Resume learning' : 'Start course'}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>

              {/* Course-specific ring */}
              <div className="shrink-0 self-center">
                <ProgressRing value={featured.overallProgressPercent} size={128} stroke={11} track="#eef0f2" bar="#1b1e26">
                  <span className="text-2xl font-extrabold text-[#1b1e26] leading-none">{featured.overallProgressPercent}%</span>
                  <span className="mt-0.5 text-[10px] font-semibold text-gray-400">{featured.completedItems}/{featured.totalItems} lessons</span>
                </ProgressRing>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STAT RIBBON — one segmented card ── */}
        {!loading && !error && courses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-2xl border border-gray-100 shadow-sm divide-x divide-y lg:divide-y-0 divide-gray-100 overflow-hidden"
          >
            {STAT_RIBBON.map((s) => (
              <div key={s.label} className="flex items-center gap-3.5 p-5">
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconTileStyles[s.tone]}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                </span>
                <div>
                  <p className="text-2xl font-extrabold text-[#1b1e26] leading-none tracking-tight">{s.value}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── COURSES ── */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 rounded-xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button onClick={load} className="px-5 py-2.5 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black transition-colors">Try again</button>
          </div>
        ) : courses.length === 0 ? (
          <div className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl p-12 text-center">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-accent/15 blur-[90px] pointer-events-none" />
            <span className="relative w-16 h-16 rounded-2xl bg-accent text-[#1b1e26] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-accent/25">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <h2 className="relative text-xl font-bold text-[#1b1e26] mb-1.5">Your journey starts here</h2>
            <p className="relative text-sm text-gray-500 mb-6 max-w-sm mx-auto">You haven't enrolled in any course yet. Browse the catalog and pick your first one — it only takes a click.</p>
            <Link to="/courses" className="relative inline-flex items-center gap-2 px-6 py-3 bg-[#1b1e26] text-white rounded-2xl font-bold hover:bg-black transition-colors">
              Browse courses
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-8 pt-2">
            <Section title="Continue learning" list={inProgress} />
            <Section title="Not started" list={notStarted} />
            <Section title="Completed" list={completed} />
          </div>
        )}
      </div>
  );
};

export default LearnerDashboard;
