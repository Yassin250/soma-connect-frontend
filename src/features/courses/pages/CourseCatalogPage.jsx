import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { publicCourseService, learnerCourseService } from '../../../services/api';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

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

const EnrollCodeModal = ({ open, courseTitle, onSubmit, onClose }) => {
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const refs = Array.from({ length: 6 }, () => React.useRef());

  if (!open) return null;

  const focusNext = (idx) => { if (idx < 5) refs[idx + 1].current?.focus(); };
  const focusPrev = (idx) => { if (idx > 0) refs[idx - 1].current?.focus(); };

  const handleChange = (idx, value) => {
    setError('');
    const c = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 1);
    const next = [...digits];
    next[idx] = c;
    setDigits(next);
    if (c) focusNext(idx);

    const full = next.join('');
    if (full.length === 6) {
      onSubmit(full);
      setDigits(Array(6).fill(''));
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx]) focusPrev(idx);
    if (e.key === 'Enter') {
      const full = digits.join('');
      if (full.length === 6) {
        onSubmit(full);
        setDigits(Array(6).fill(''));
      } else {
        setError('Please enter all 6 characters of the enrollment code');
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const next = Array(6).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    setError('');
    if (pasted.length === 6) {
      onSubmit(pasted);
      setDigits(Array(6).fill(''));
    } else if (pasted.length > 0) {
      refs[pasted.length].current?.focus();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-[#1b1e26] mb-1">Enrollment Code Required</h2>
        <p className="text-sm text-gray-400 mb-6">Enter the 6-character code to enroll in <strong className="text-[#1b1e26]">{courseTitle}</strong></p>

        {error && <p className="text-sm text-red-500 mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex items-center justify-center gap-2.5 mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              autoFocus={i === 0}
              className="w-12 h-13 text-center text-xl font-bold font-mono tracking-wider text-[#1b1e26] bg-[#f7f8fa] border-2 border-[#1b1e26]/10 rounded-xl focus:border-[#d0f24a] focus:ring-2 focus:ring-[#d0f24a]/25 focus:outline-none transition-all uppercase"
            />
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => { setDigits(Array(6).fill('')); setError(''); onClose(); }} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-[#1b1e26] hover:bg-gray-100 transition-all">Cancel</button>
          <button onClick={() => { const full = digits.join(''); if (full.length === 6) { onSubmit(full); setDigits(Array(6).fill('')); } else setError('Please enter all 6 characters'); }} className="px-5 py-2.5 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black transition-all">Enroll</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const CourseCatalogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [codeModalCourse, setCodeModalCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = user
          ? await learnerCourseService.listCatalog()
          : await publicCourseService.list();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  const categories = ['All', ...new Set(courses.map((c) => c.category || 'Uncategorized').filter(Boolean))];

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.summary?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || (c.category || 'Uncategorized') === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleExplore = (course) => {
    if (user && course.enrollmentCode) {
      setCodeModalCourse(course);
    } else {
      navigate(`/learning/course/${course.id}`);
    }
  };

  const handleEnrollWithCode = async (code) => {
    if (!codeModalCourse) return;
    try {
      await learnerCourseService.enrollWithCode(codeModalCourse.id, code);
      navigate(`/learning/course/${codeModalCourse.id}`);
    } catch (err) {
      // error will be shown by the course learning page if enrollment fails
      navigate(`/learning/course/${codeModalCourse.id}`);
    }
    setCodeModalCourse(null);
  };

  return (
    <>
    <div>
        <motion.div {...fadeUp} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Course Catalog</h1>
          <p className="mt-2 text-gray-500 text-sm sm:text-base">Explore all available programs and start learning today.</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-2xl bg-white border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#1b1e26]/20 focus:ring-4 focus:ring-[#1b1e26]/5 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1b1e26] text-white shadow-md'
                    : 'bg-white text-[#1b1e26]/55 border border-gray-200 hover:text-[#1b1e26] hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black transition-colors">
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <p className="text-gray-500 text-sm">No courses match your criteria.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <motion.div
                key={course.id}
                {...fadeUp}
                onClick={() => handleExplore(course)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleExplore(course); }}
                className="group cursor-pointer flex flex-col h-full rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-[0_16px_44px_rgba(27,30,38,0.13)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`relative h-32 bg-gradient-to-br ${gradFor(course.title)}`}>
                  {course.coverImageUrl && (
                    <>
                      <img src={course.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </>
                  )}
                  <div className="absolute inset-0 p-4 flex items-start justify-between">
                    {course.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-white bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        {course.category}
                      </span>
                    )}
                    {course.certificateEnabled && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-[#1b5e20] bg-[#d0f24a]/90 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Certificate
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-[#1b1e26] leading-snug line-clamp-2">
                    {course.title}
                    {course.enrollmentCode && (
                      <span className="ml-2 inline-block text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full align-middle">Code</span>
                    )}
                  </h3>
                  {course.summary && (
                    <p className="mt-1.5 text-xs text-gray-500 leading-relaxed line-clamp-2">{course.summary}</p>
                  )}

                  <div className="mt-auto pt-4">
                    {course.instructorName && (
                      <p className="text-xs text-gray-400 mb-2 truncate">by {course.instructorName}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      {course.moduleCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          {course.moduleCount} {course.moduleCount === 1 ? 'module' : 'modules'}
                        </span>
                      )}
                      {course.estimatedHours > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          {course.estimatedHours}h
                        </span>
                      )}
                    </div>

                    <div className="w-full py-2.5 rounded-xl bg-[#1b1e26] text-white text-xs font-bold text-center group-hover:bg-black transition-colors inline-flex items-center justify-center gap-1.5">
                      Enroll now
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <EnrollCodeModal
        open={!!codeModalCourse}
        courseTitle={codeModalCourse?.title}
        onSubmit={handleEnrollWithCode}
        onClose={() => setCodeModalCourse(null)}
      />
    </>
  );
};

export default CourseCatalogPage;
