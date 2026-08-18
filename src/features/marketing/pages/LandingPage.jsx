import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { BrandLockup } from '../../../components/shared/Brand';
import { publicCourseService } from '../../../services/api';
import { dashboardPathForRoles } from '../../../utils/dashboardPath';

// Scroll-reveal wrapper
const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.55, ease: 'easeOut', delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Programs', href: '#programs' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
];

const STATS = [
  { value: '25K+', label: 'Active learners' },
  { value: '300+', label: 'Verified courses' },
  { value: '120+', label: 'Partner schools' },
  { value: '94%', label: 'Placement rate' },
];

const FEATURES = [
  {
    title: 'AI-Verified Skills',
    desc: 'Every submission is checked for originality and mastery, so your certificate actually means something to employers.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    title: 'Personalized Paths',
    desc: 'Adaptive learning that meets you where you are and moves at your pace. No two journeys look the same.',
    icon: 'M3 12h4l3 8 4-16 3 8h4',
  },
  {
    title: 'Verified Portfolio',
    desc: 'A shareable, tamper-proof record of the real work you have done. Your proof of skill, not just a grade.',
    icon: 'M4 4h16v12H4zM4 20h16M9 16v4M15 16v4',
  },
  {
    title: 'Employer Network',
    desc: 'Get matched to internships and jobs across Rwanda and beyond, straight from your verified profile.',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
];

// Visual identity for program cards, keyed by a deterministic hash of the
// REAL category name — not a hardcoded per-name map. Any category the admin
// creates in the taxonomy (see /admin/course-categories) automatically gets a
// consistent, good-looking theme without a code change here.
const CATEGORY_THEMES = [
  { gradient: 'from-violet-500 via-purple-500 to-indigo-600', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { gradient: 'from-emerald-400 via-teal-500 to-cyan-600', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.5 12C3.7 7.9 7.5 5 12 5s8.3 2.9 9.5 7c-1.2 4.1-5 7-9.5 7s-8.3-2.9-9.5-7z' },
  { gradient: 'from-sky-500 via-blue-500 to-indigo-600', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { gradient: 'from-orange-400 via-amber-500 to-rose-500', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828z' },
  { gradient: 'from-fuchsia-500 via-pink-500 to-rose-600', icon: 'M9 7h6m-6 4h6m-6 4h4M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { gradient: 'from-lime-500 via-green-500 to-emerald-600', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { gradient: 'from-cyan-500 via-sky-500 to-blue-600', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z' },
  { gradient: 'from-rose-500 via-red-500 to-orange-600', icon: 'M12 8c-1.5 0-3 .5-3 2s1.5 2 3 2 3 .5 3 2-1.5 2-3 2m0-8V6m0 10v2' },
];

const themeForCategory = (name) => {
  const key = name || 'uncategorized';
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return CATEGORY_THEMES[hash % CATEGORY_THEMES.length];
};

// Map backend course data to frontend display format
const mapCourseToDisplay = (course) => {
  const category = course.category || 'Uncategorized';
  const theme = themeForCategory(category);
  const prettyLevel = course.level
    ? course.level.charAt(0) + course.level.slice(1).toLowerCase()
    : null;
  return {
    id: course.id,
    title: course.title,
    summary: course.summary || null,
    cover: course.coverImageUrl || null,
    category,
    level: prettyLevel,
    lessons: course.moduleCount || 0,
    hours: course.estimatedHours || 0,
    institution: course.entityName || null,
    certificate: !!course.certificateEnabled,
    instructor: course.instructorName || null,
    gradient: theme.gradient,
    icon: theme.icon,
  };
};
const nameInitials = (n) => (n || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const STEPS = [
  { n: '01', title: 'Enroll', desc: 'Pick a program and set your goal. Your path adapts from day one.' },
  { n: '02', title: 'Learn & practice', desc: 'Video lessons, hands-on projects, and quizzes that build real skill.' },
  { n: '03', title: 'Get AI-verified', desc: 'Submit your work. Our AI confirms it is original and mastered.' },
  { n: '04', title: 'Get hired', desc: 'Share your verified portfolio and get matched with employers.' },
];

const TESTIMONIALS = [
  { quote: 'The AI verification gave my portfolio real credibility. I landed my first internship two weeks after finishing.', name: 'Aline U.', role: 'Data Analyst, Kigali' },
  { quote: 'As a lecturer, Soma Connect lets me focus on teaching while the platform handles verification and tracking.', name: 'Jean-Paul M.', role: 'Lecturer' },
  { quote: 'We onboarded our whole school in a week. Attendance, courses and reports all in one place.', name: 'Grace K.', role: 'School Administrator' },
];

const PLANS = [
  { name: 'Learner', price: 'Free', tagline: 'Start your journey', features: ['Access to free courses', 'AI verified submissions', 'Basic portfolio'], cta: 'Get started', featured: false },
  { name: 'Pro', price: '$9', per: '/mo', tagline: 'Go further, faster', features: ['All 300+ courses', 'Verified certificates', 'Employer matching', 'Priority support'], cta: 'Start Pro', featured: true },
  { name: 'Institution', price: 'Custom', tagline: 'For schools & teams', features: ['School dashboard', 'Bulk enrollment', 'Analytics & reports', 'Dedicated success manager'], cta: 'Talk to us', featured: false },
];

const FOOTER = [
  { title: 'Platform', links: ['Programs', 'Certificates', 'Pricing', 'For Schools'] },
  { title: 'Company', links: ['About', 'Careers', 'Partners', 'Contact'] },
  { title: 'Support', links: ['Help Center', 'Community', 'Privacy', 'Terms'] },
];

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Enrolling / opening a course requires an account. Signed-in learners go
  // straight to the learning page; anonymous visitors are routed to sign in,
  // carrying the course so they land back on it after logging in.
  const goToCourse = (courseId) => {
    const target = `/learning/course/${courseId}`;
    if (isAuthenticated) navigate(target);
    else navigate(`/login?next=${encodeURIComponent(target)}`);
  };
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [programCat, setProgramCat] = useState('All');
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const year = new Date().getFullYear();

  // Pills are derived straight from the courses actually loaded — real
  // category names + live counts, no hardcoded list. A category only shows
  // up here once it has at least one published course under it, so clicking
  // a pill never lands on an empty grid.
  const categoryPills = useMemo(() => {
    const counts = new Map();
    programs.forEach((p) => counts.set(p.category, (counts.get(p.category) || 0) + 1));
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return [{ label: 'All', count: programs.length }, ...sorted.map(([label, count]) => ({ label, count }))];
  }, [programs]);

  const filteredPrograms = programCat === 'All' ? programs : programs.filter((p) => p.category === programCat);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const courses = await publicCourseService.list();
        const mappedPrograms = courses.map(mapCourseToDisplay);
        setPrograms(mappedPrograms);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Where "Go to Dashboard" points. An unknown/edge role resolves to "/", which
  // would make the button a dead click (it's already the landing page) — every
  // authenticated account can at least reach its learning dashboard, so fall
  // back there rather than render a button that does nothing.
  const resolvedDash = dashboardPathForRoles(user);
  const dashHref = resolvedDash === '/' ? '/learning/dashboard' : resolvedDash;

  return (
    <div className="min-h-screen bg-white text-[#32292F] antialiased overflow-x-hidden scroll-smooth">
      {/* ───────────────── NAV ───────────────── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#120E1A]/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
          <Link to="/"><span style={{ '--clr-accent': '#8B5CF6' }}><BrandLockup /></span></Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-white/70 hover:text-[#8B5CF6] transition-colors">{l.label}</a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={dashHref} className="px-5 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-bold hover:bg-[#A78BFA] transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-white hover:text-[#8B5CF6] transition-colors">Sign In</Link>
                <Link to="/register" className="px-5 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-bold hover:bg-[#A78BFA] transition-colors shadow-sm">Get Started</Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen((o) => !o)} className="lg:hidden text-white p-1" aria-label={menuOpen ? 'Close menu' : 'Menu'}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden mt-3 mx-4 rounded-2xl bg-[#120E1A] border border-white/10 p-4 space-y-1 shadow-xl">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/5">{l.label}</a>
            ))}
            <div className="pt-2 flex gap-2">
              {isAuthenticated ? (
                <Link to={dashHref} className="flex-1 text-center px-4 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-bold">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="flex-1 text-center px-4 py-2.5 rounded-xl border border-white/20 text-white text-sm font-semibold">Sign In</Link>
                   <Link to="/register" className="flex-1 text-center px-4 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-bold">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ───────────────── HERO ───────────────── */}
      <section id="home" className="relative bg-gradient-to-br from-[#120E1A] via-[#1a1025] to-[#140d1e] text-white pt-36 pb-24 sm:pt-44 sm:pb-32 overflow-hidden">
        {/* ambient */}
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-[#8B5CF6]/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-[#2a1a3a]/40 blur-[110px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-6 text-[2.6rem] leading-[1.08] sm:text-6xl font-semibold tracking-tight"
            >
              Learn with Integrity.<br />Lead with <span className="text-[#8B5CF6]">Opportunity.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 text-lg text-white/60 leading-relaxed max-w-xl"
            >
              Soma Connect bridges Rwandan classrooms and the global job market with AI-verified courses,
              real portfolios, and a direct line to employers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link to="/register" className="px-7 py-3.5 rounded-2xl bg-[#8B5CF6] text-white text-sm font-bold hover:bg-[#A78BFA] transition-all active:scale-[0.98] shadow-lg shadow-[#8B5CF6]/20">
                Get Started. It's free
              </Link>
              <a href="#programs" className="px-7 py-3.5 rounded-2xl border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-colors">
                Explore Programs
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-wrap gap-x-10 gap-y-4"
            >
              {STATS.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white tabular-nums">{s.value}</p>
                  <p className="text-xs text-white/50">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero visual — landing image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* soft brand glow behind the image */}
            <div className="absolute -inset-10 rounded-full bg-[#8B5CF6]/25 blur-[90px] pointer-events-none" />

            <div className="relative group lg:scale-105 lg:origin-top-right">
              <img
                src="/landing/landing.png"
                alt="Soma Connect learning dashboard preview"
                className="w-full max-w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────────── TRUST BAR ───────────────── */}
      <section className="bg-[#120E1A] py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/30 mb-6">Trusted by learners & institutions across Rwanda</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-60">
            {['KEPLER', 'ALU', 'RP', 'AUCA', 'UR', 'CMU-AFRICA'].map((p) => (
              <span key={p} className="text-white/70 font-bold tracking-wide text-lg">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURES ───────────────── */}
      <section id="features" className="bg-[#f7f8fa] py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#32292F]/50 bg-[#8B5CF6]/40 px-3 py-1.5 rounded-full">Why Soma Connect</span>
            <h2 className="mt-5 text-4xl sm:text-[2.75rem] font-semibold tracking-tight leading-tight">Learning that actually gets you hired</h2>
            <p className="mt-4 text-gray-500 text-lg">We built the whole loop of learning, proving, and getting discovered around one idea: integrity you can verify.</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="h-full bg-white rounded-2xl border border-gray-100 p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <span className="w-12 h-12 rounded-2xl bg-[#120E1A] text-[#8B5CF6] flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── PROGRAMS ───────────────── */}
      <section id="programs" className="relative bg-[#f7f8fa] py-24 overflow-hidden">
        <div className="absolute -top-16 right-1/4 w-80 h-80 rounded-full bg-[#8B5CF6]/25 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-[#2a1a3a]/[0.06] blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          {/* Header + category filter */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
            <Reveal className="max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#32292F]/50 bg-[#8B5CF6]/40 px-3 py-1.5 rounded-full">Popular programs</span>
              <h2 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
                Certificates that{' '}
                <span className="relative inline-block">
                  open doors
                  <svg className="absolute left-0 -bottom-1 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none" fill="none">
                    <path d="M2 7c40-5 80-5 120-3s60 3 76 1" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
              <p className="mt-5 text-gray-500 text-lg leading-relaxed">
                Industry built, AI-verified programs that help you learn the skill, prove it with real work, and get discovered by employers.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex flex-wrap gap-2">
                {categoryPills.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setProgramCat(c.label)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      programCat === c.label
                        ? 'bg-[#120E1A] text-white shadow-md'
                        : 'bg-white text-[#32292F]/55 hover:text-[#32292F] border border-[#32292F]/[0.07] hover:border-[#32292F]/20'
                    }`}
                  >
                    {c.label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${programCat === c.label ? 'bg-white/15' : 'bg-[#120E1A]/[0.06]'}`}>
                      {c.count}
                    </span>
                  </button>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Program cards */}
          <motion.div
            key={programCat}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-full rounded-3xl bg-white border border-[#32292F]/[0.06] p-5 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Failed to load courses. Please try again later.</p>
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No courses available at the moment.</p>
              </div>
            ) : (
              filteredPrograms.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  onClick={() => goToCourse(p.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') goToCourse(p.id); }}
                  className="group cursor-pointer flex flex-col h-full rounded-3xl bg-white border border-[#32292F]/[0.06] shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
                >
                    {/* Banner — the uploaded cover when there is one, else the category gradient */}
                    <div className={`relative h-32 bg-gradient-to-br ${p.gradient} px-5 py-4 flex items-start justify-between overflow-hidden`}>
                      {p.cover ? (
                        <>
                          <img src={p.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </>
                      ) : (
                        <>
                          <div className="absolute -bottom-9 -right-7 w-28 h-28 rounded-full bg-white/15" />
                          <div className="absolute top-8 -left-6 w-20 h-20 rounded-full bg-white/10" />
                        </>
                      )}
                      {!p.cover && (
                        <span className="relative w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={p.icon} /></svg>
                        </span>
                      )}
                      {p.level && (
                        <span className="relative ml-auto text-[10px] font-bold uppercase tracking-wide text-white bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full">{p.level}</span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#32292F]/40">{p.category}</span>
                        {p.certificate && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#8B5CF6]/30 px-2 py-0.5 rounded-full">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            Certificate
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1.5 text-lg font-semibold text-[#32292F] leading-snug">{p.title}</h3>
                      {p.summary && (
                        <p className="mt-1.5 text-[13px] text-gray-500 leading-relaxed line-clamp-2">{p.summary}</p>
                      )}

                      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          {p.lessons} {p.lessons === 1 ? 'module' : 'modules'}
                        </span>
                        {p.hours > 0 && (
                          <span className="inline-flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            {p.hours}h
                          </span>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                        {p.instructor ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-7 h-7 rounded-full bg-[#120E1A] text-white text-[9px] font-bold flex items-center justify-center shrink-0">{nameInitials(p.instructor)}</span>
                            <span className="text-xs font-medium text-[#32292F]/70 truncate">{p.instructor}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Instructor TBA</span>
                        )}
                        {p.institution && (
                          <span className="text-[11px] font-semibold text-[#32292F]/60 truncate max-w-[45%] text-right">{p.institution}</span>
                        )}
                      </div>

                      {/* Enroll — gated: signed-in learners go to the course, others to sign-up */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goToCourse(p.id); }}
                        className="mt-4 w-full py-2.5 rounded-xl bg-[#120E1A] text-white text-sm font-bold hover:bg-black transition-colors active:scale-[0.98] inline-flex items-center justify-center gap-2 group-hover:bg-[#8B5CF6] group-hover:text-white"
                      >
                        {isAuthenticated ? 'Start learning' : 'Enroll now'}
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                </div>
              ))
            )}
          </motion.div>

          <Reveal className="mt-12 text-center">
            <Link to="/register" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#120E1A] text-white text-sm font-bold hover:bg-black transition-colors active:scale-[0.98]">
              Explore all {programs.length}+ programs
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section id="how" className="relative bg-gradient-to-br from-[#120E1A] via-[#1a1025] to-[#140d1e] text-white py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#8B5CF6]/10 blur-[120px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal className="max-w-2xl mb-16">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-3 py-1.5 rounded-full">How it works</span>
            <h2 className="mt-5 text-4xl sm:text-[2.75rem] font-semibold tracking-tight">From first lesson to first job</h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-6 h-full">
                  <span className="text-4xl font-bold text-[#8B5CF6]/30">{s.n}</span>
                  <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── IMPACT STATS ───────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="text-center">
              <p className="text-4xl sm:text-5xl font-bold tracking-tight text-[#32292F]">{s.value}</p>
              <p className="mt-2 text-sm text-gray-500">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────── FOR SCHOOLS ───────────────── */}
      <section className="bg-[#f7f8fa] py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="relative rounded-[2rem] bg-gradient-to-br from-[#120E1A] to-[#140d1e] text-white p-10 sm:p-14 overflow-hidden">
              <div className="absolute -bottom-16 -right-10 w-72 h-72 rounded-full bg-[#8B5CF6]/15 blur-[90px] pointer-events-none" />
              <div className="relative grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8B5CF6]">For institutions</span>
                  <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">Bring Soma Connect to your school</h2>
                  <p className="mt-4 text-white/60 leading-relaxed max-w-lg">
                    Classes, attendance, courses, plagiarism checks and financial reports in one dashboard for your whole institution,
                    with verified outcomes you can show parents and partners.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/register" className="px-6 py-3 rounded-2xl bg-[#8B5CF6] text-white text-sm font-bold hover:bg-[#A78BFA] transition-colors">Partner with us</Link>
                    <a href="#pricing" className="px-6 py-3 rounded-2xl border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-colors">See plans</a>
                  </div>
                </div>
                <div className="space-y-3">
                  {['Unified school dashboard', 'Bulk student & staff onboarding', 'Attendance & performance analytics', 'AI-plagiarism & originality checks'].map((t) => (
                    <div key={t} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/5 px-4 py-3.5">
                        <span className="w-7 h-7 rounded-lg bg-[#8B5CF6] text-white flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      <span className="text-sm font-medium text-white/90">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── TESTIMONIALS ───────────────── */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#32292F]/50 bg-[#8B5CF6]/40 px-3 py-1.5 rounded-full">Loved by learners</span>
            <h2 className="mt-5 text-4xl sm:text-[2.75rem] font-semibold tracking-tight">Real people, real outcomes</h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <div className="h-full bg-[#f7f8fa] rounded-2xl border border-gray-100 p-7 flex flex-col">
                  <svg className="w-8 h-8 text-[#8B5CF6]" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 8c-2.5 0-4.5 2-4.5 4.5S7 17 9.5 17c.3 0 .6 0 .9-.1-.6 1.3-2 2.3-3.9 2.6l.4 1.5c3.6-.7 6.1-3.4 6.1-7.2V12.5C13 9.5 11.5 8 9.5 8zm9 0c-2.5 0-4.5 2-4.5 4.5S16 17 18.5 17c.3 0 .6 0 .9-.1-.6 1.3-2 2.3-3.9 2.6l.4 1.5c3.6-.7 6.1-3.4 6.1-7.2V12.5C22 9.5 20.5 8 18.5 8z" /></svg>
                  <p className="mt-4 text-[15px] text-gray-700 leading-relaxed flex-1">“{t.quote}”</p>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#120E1A] text-white text-xs font-bold flex items-center justify-center">{t.name.split(' ').map((w) => w[0]).join('')}</span>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── PRICING ───────────────── */}
      <section id="pricing" className="bg-[#f7f8fa] py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <Reveal className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#32292F]/50 bg-[#8B5CF6]/40 px-3 py-1.5 rounded-full">Pricing</span>
            <h2 className="mt-5 text-4xl sm:text-[2.75rem] font-semibold tracking-tight">Start free. Grow when you're ready.</h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08}>
                <div className={`h-full rounded-2xl p-8 flex flex-col ${p.featured ? 'bg-[#120E1A] text-white shadow-2xl scale-[1.03] relative' : 'bg-white border border-gray-100'}`}>
                  {p.featured && <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wide text-white bg-[#8B5CF6] px-2.5 py-1 rounded-full">Most popular</span>}
                  <p className={`text-sm font-semibold ${p.featured ? 'text-[#8B5CF6]' : 'text-gray-500'}`}>{p.name}</p>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                    {p.per && <span className={`text-sm mb-1 ${p.featured ? 'text-white/50' : 'text-gray-400'}`}>{p.per}</span>}
                  </div>
                  <p className={`mt-1 text-sm ${p.featured ? 'text-white/50' : 'text-gray-400'}`}>{p.tagline}</p>
                  <ul className="mt-6 space-y-3 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <svg className={`w-5 h-5 shrink-0 ${p.featured ? 'text-[#8B5CF6]' : 'text-emerald-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className={p.featured ? 'text-white/80' : 'text-gray-600'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {p.name === 'Institution' ? (
                    <a href="https://wa.me/250794219712?text=Hello%20Soma%20Connect%2C%20I%27m%20interested%20in%20the%20Institution%20plan" target="_blank" rel="noopener noreferrer" className="block mt-8 text-center px-6 py-3 rounded-2xl text-sm font-bold transition-colors bg-[#120E1A] text-white hover:bg-black">
                      {p.cta}
                    </a>
                  ) : (
                    <Link to="/register" className={`block mt-8 text-center px-6 py-3 rounded-2xl text-sm font-bold transition-colors ${p.featured ? 'bg-[#8B5CF6] text-white hover:bg-[#A78BFA]' : 'bg-[#120E1A] text-white hover:bg-black'}`}>
                      {p.cta}
                    </Link>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── FINAL CTA ───────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="relative rounded-[2rem] bg-[#8B5CF6] p-12 sm:p-16 text-center overflow-hidden">
              <div className="absolute -top-10 -left-8 w-40 h-40 rounded-full bg-white/25 pointer-events-none" />
              <div className="absolute -bottom-12 -right-6 w-56 h-56 rounded-full bg-[#120E1A]/5 pointer-events-none" />
              <div className="relative">
                <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">Your future starts with one lesson.</h2>
                <p className="mt-4 text-white/80 text-lg max-w-xl mx-auto">Join thousands of Rwandan learners building verified skills and getting hired.</p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link to="/register" className="px-8 py-4 rounded-2xl bg-[#120E1A] text-white text-sm font-bold hover:bg-black transition-colors active:scale-[0.98]">Create your free account</Link>
                  <Link to="/login" className="px-8 py-4 rounded-2xl bg-white/60 text-[#32292F] text-sm font-bold hover:bg-white transition-colors">Sign in</Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="bg-[#120E1A] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-2">
              <span style={{ '--clr-accent': '#8B5CF6' }}><BrandLockup /></span>
              <p className="mt-4 text-sm text-white/50 leading-relaxed max-w-xs">
                Bridging Rwandan classrooms and the global job market through AI verified excellence.
              </p>
              <div className="mt-5 flex gap-3">
                {['M22 12a10 10 0 10-11.5 9.9v-7H8v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6v1.9h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z', 'M23 4.9c-.8.4-1.7.6-2.6.8a4.5 4.5 0 002-2.5c-.9.5-1.9.9-2.9 1.1a4.5 4.5 0 00-7.7 4.1A12.8 12.8 0 013 3.6a4.5 4.5 0 001.4 6 4.5 4.5 0 01-2-.6v.1a4.5 4.5 0 003.6 4.4 4.5 4.5 0 01-2 .1 4.5 4.5 0 004.2 3.1A9 9 0 012 19.5a12.7 12.7 0 006.9 2c8.3 0 12.8-6.9 12.8-12.8v-.6c.9-.6 1.6-1.4 2.3-2.2z', 'M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zM8.5 17.5v-7H6v7h2.5zM7.2 9.3a1.4 1.4 0 100-2.8 1.4 1.4 0 000 2.8zM18 17.5v-4c0-2.1-1.1-3.1-2.6-3.1-1.2 0-1.7.7-2 1.1v-1H11v7h2.5v-3.9c0-.9.6-1.3 1.2-1.3.6 0 1.1.4 1.1 1.3v3.9H18z'].map((d, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#8B5CF6] hover:text-white text-white/60 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {FOOTER.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-white mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-sm text-white/50 hover:text-[#8B5CF6] transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40">© {year} Soma Connect Platform. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-white/40 hover:text-white">Privacy</a>
              <a href="#" className="text-xs text-white/40 hover:text-white">Terms</a>
              <a href="#" className="text-xs text-white/40 hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
