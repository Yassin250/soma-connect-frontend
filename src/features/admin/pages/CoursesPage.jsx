import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const CATEGORY_COLORS = {
  STEM: 'bg-blue-50 text-blue-700 border-blue-200',
  BUSINESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ARTS: 'bg-rose-50 text-rose-700 border-rose-200',
  HUMANITIES: 'bg-amber-50 text-amber-700 border-amber-200',
  HEALTH: 'bg-teal-50 text-teal-700 border-teal-200',
  LANGUAGE: 'bg-violet-50 text-violet-700 border-violet-200',
  default: 'bg-slate-50 text-slate-600 border-slate-200',
};

export const CoursesPage = () => {
  const { token } = useAuth();
  const API_BASE_URL = 'http://localhost:5050/api/admin';

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stats, setStats] = useState({ total: 0, active: 0, schools: 0 });
  const toast = useToast();

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (search.trim()) params.append('q', search.trim());

      const response = await fetch(`${API_BASE_URL}/courses?${params}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`Failed to fetch courses: ${response.status}`);

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.data || [];
      setCourses(items);
      setStats({
        total: items.length,
        active: items.filter((c) => c.status === 'ACTIVE' || !c.status).length,
        schools: new Set(items.map((c) => c.schoolId || c.institution)).size,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders, categoryFilter, search]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    setCategoryFilter('ALL');
  }, [search]);

  const getCategoryColor = (cat) => CATEGORY_COLORS[cat?.toUpperCase()] || CATEGORY_COLORS.default;

  const CATEGORIES = ['ALL', 'STEM', 'BUSINESS', 'ARTS', 'HUMANITIES', 'HEALTH', 'LANGUAGE'];

  return (
    <div className="space-y-8 antialiased">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
            Academic Oversight
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-2 text-slate-900">
            Course Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and manage courses across all registered institutions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Courses', value: stats.total, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', gradient: 'from-indigo-500 to-blue-500' },
          { label: 'Active', value: stats.active, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-emerald-500 to-teal-500' },
          { label: 'Institutions', value: stats.schools, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5', gradient: 'from-amber-500 to-orange-500' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{card.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-sm`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.602z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                categoryFilter === cat
                  ? 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat === 'ALL' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-mono">
            Loading course catalog...
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm font-medium">No courses found</p>
            <p className="text-xs mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {courses.map((course) => (
              <div key={course.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{course.name || course.title}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${getCategoryColor(course.category)}`}>
                        {course.category || 'General'}
                      </span>
                      {course.code && (
                        <span className="text-[10px] font-mono text-slate-400">{course.code}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      {course.institution && <span>{course.institution}</span>}
                      {course.institution && course.department && <span className="text-slate-300">|</span>}
                      {course.department && <span>{course.department}</span>}
                      <span className="text-slate-300">|</span>
                      <span>{course.credits || course.creditHours || 0} credits</span>
                    </div>
                    {course.description && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{course.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      course.status === 'ACTIVE' || !course.status
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {course.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
