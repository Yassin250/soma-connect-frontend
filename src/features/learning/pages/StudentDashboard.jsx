import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mockDb } from '../../../services/mockDb';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user && user.schoolId) {
      const sch = mockDb.getSchool(user.schoolId);
      if (sch) setSchool(sch);
      const data = mockDb.getStudentDashboardData(user.id);
      setDashboardData(data);
    }
  }, [user]);

  if (!school || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center text-slate-400 text-sm">
        Loading student workspace...
      </div>
    );
  }

  const { courses, summary } = dashboardData;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  const activeCourse = courses[0];
  const activeModules = activeCourse?.modules || [];
  const currentModuleIdx = activeModules.findIndex(m => m.unlocked && !activeModules.slice(m.order).every(s => s.unlocked));
  const continueModIdx = activeModules.findIndex(m => m.unlocked);
  const completedMods = activeModules.filter(m => m.unlocked);
  const courseProgress = activeCourse?.stats?.moduleProgress || 0;
  const totalXp = 1240;

  const allAssignments = courses.flatMap(c =>
    c.assignments.map(a => ({ ...a, courseCode: c.code, courseTitle: c.title, courseId: c.id }))
  );
  const pendingAssignments = allAssignments.filter(a => {
    const sub = courses.flatMap(c => c.submissions).find(s => s.assignmentId === a.id);
    return !sub;
  });

  const verifiedSkills = courses.flatMap(c => c.skills || []);
  const uniqueSkills = [...new Set(verifiedSkills)];

  const allQuizAttempts = courses.flatMap(c => c.quizAttempts);
  const bestScores = allQuizAttempts.length > 0
    ? allQuizAttempts.reduce((sum, a) => sum + a.score, 0) / allQuizAttempts.length
    : 0;

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4-1a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
    { id: 'courses', label: 'My Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'assignments', label: 'Assignments', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'jobs', label: 'Jobs & Internships', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2z' },
    { id: 'badges', label: 'Badges', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white antialiased flex flex-col md:flex-row">

      {/* ── SIDEBAR ── */}
      <div className="w-full md:w-64 bg-[#0d1224] border-r border-slate-800 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">

          {/* Logo & School context */}
          <div className="flex items-center space-x-3">
            {school.logo ? (
              <img src={school.logo} alt="Logo" className="w-8 h-8 object-contain rounded" />
            ) : (
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white uppercase text-sm">
                {school.name.substring(0, 2)}
              </div>
            )}
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white truncate">{school.name}</h2>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
                Student Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User context & Sign out */}
        <div className="border-t border-slate-800 pt-4 mt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[11px] font-bold text-blue-400 shrink-0">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[9px] font-mono text-slate-500">
                Year 2 · {school.departments?.[0] || 'Computer Science'}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/60 rounded border border-slate-700/50">
              <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="text-amber-400 font-semibold">{totalXp.toLocaleString()} XP</span>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-[10px] bg-slate-800/80 hover:bg-red-950 hover:text-red-400 border border-slate-700/50 hover:border-red-900 px-2 py-1 rounded transition-all"
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Student Learning Console
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded border border-slate-800">
            {school.name} · {school.academicYear || 'Academic Year'}
          </span>
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Courses Enrolled</span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-extrabold text-white">{summary.enrolledCourses}</span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-semibold">Active</span>
                </div>
              </div>
              <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Skills</span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-extrabold text-white">{uniqueSkills.length}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">Earned</span>
                </div>
              </div>
              <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assignments Due</span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-extrabold text-white">{summary.pendingCount}</span>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-semibold">Pending</span>
                </div>
              </div>
              <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg. Score</span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-extrabold text-white">{summary.overallAvg || 0}%</span>
                  <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-semibold">Overall</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>

              {/* LEFT COLUMN */}
              <div className="space-y-5">
                {/* Continue learning */}
                {activeCourse && (
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-white">Continue learning</p>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">In progress</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{activeCourse.title} · Module {completedMods.length} of {activeModules.length}</p>

                    <div className="mb-4">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-slate-400">Course progress</span>
                        <span className="text-xs font-semibold text-white">{courseProgress}%</span>
                      </div>
                      <div className="flex-1 h-[6px] bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${courseProgress}%` }} />
                      </div>
                    </div>

                    {activeModules.slice(0, 3).map((mod, idx) => {
                      const isCompleted = idx < completedMods.length - 1;
                      const isCurrent = !isCompleted && mod.unlocked;
                      const isLocked = !mod.unlocked;
                      return (
                        <div
                          key={mod.id}
                          onClick={() => mod.unlocked && navigate(`/student/module/${mod.id}`)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border mb-2 cursor-pointer transition-colors ${
                            isCurrent
                              ? 'border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/15'
                              : isLocked
                                ? 'opacity-40 cursor-default border-slate-800 bg-slate-900/20'
                                : 'border-slate-800 bg-slate-900/20 hover:bg-slate-800/40'
                          }`}
                        >
                          {isCurrent ? (
                            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          ) : isCompleted ? (
                            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] font-semibold ${isCurrent ? 'text-blue-300' : 'text-slate-300'}`}>{mod.title}</p>
                            <p className={`text-[11px] ${isCurrent ? 'text-blue-500' : 'text-slate-500'}`}>
                              {isCompleted
                                ? `Completed · ${mod.type}`
                                : isLocked
                                  ? 'Unlocks after previous module'
                                  : `${mod.type} content`}
                            </p>
                          </div>
                          {isCurrent && (
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/student/module/${mod.id}`); }}
                              className="text-[12px] px-2.5 py-1 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                            >
                              Continue →
                            </button>
                          )}
                          {isCompleted && <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">Done</span>}
                          {isLocked && <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-semibold">Locked</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upcoming deadlines */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-3">Upcoming deadlines</p>
                  {pendingAssignments.length === 0 && (
                    <p className="text-xs text-slate-500 py-4 text-center">No upcoming deadlines.</p>
                  )}
                  {pendingAssignments.slice(0, 4).map(a => {
                    const daysLeft = a.dueDate ? Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                    const isUrgent = daysLeft !== null && daysLeft <= 2;
                    return (
                      <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-slate-800/60 last:border-b-0">
                        <svg className={`w-[18px] h-[18px] shrink-0 ${isUrgent ? 'text-amber-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-200">{a.courseCode} – {a.title}</p>
                          <p className="text-[11px] text-slate-500">{a.description?.slice(0, 50)}{a.description?.length > 50 ? '…' : ''} · {daysLeft !== null ? `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : 'No due date'}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/student/assignment/${a.id}`)}
                          className="text-[12px] px-2.5 py-1 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shrink-0"
                        >
                          Submit →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="flex flex-col gap-5">

                {/* Verified skills */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-3">Verified skills</p>
                  {uniqueSkills.length === 0 && <p className="text-xs text-slate-500">Skills will appear as you complete courses.</p>}
                  {uniqueSkills.map((skill, idx) => (
                    <div key={idx} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border border-slate-800/60 mb-1.5 bg-slate-900/30 ${idx >= 3 ? 'opacity-40' : ''}`}>
                      {idx < 3 ? (
                        <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold ${idx < 3 ? 'text-slate-200' : 'text-slate-500'}`}>{skill}</p>
                        <p className="text-[11px] text-slate-500">{idx < 3 ? 'Verified' : 'In progress'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Job matches */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-3">Job matches</p>
                  <div className="flex items-center gap-3 py-2.5 border-b border-slate-800/60">
                    <svg className="w-[18px] h-[18px] text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-2"/><path d="M9 7h1m-1 4h1m4-4h1m-1 4h1"/></svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-200">Software intern · MTN Rwanda</p>
                      <p className="text-[11px] text-slate-500">Matches {uniqueSkills.length} of your skills</p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">Strong</span>
                  </div>
                  <div className="flex items-center gap-3 py-2.5">
                    <svg className="w-[18px] h-[18px] text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-2"/><path d="M9 7h1m-1 4h1m4-4h1m-1 4h1"/></svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-200">Junior dev · Norrsken Kigali</p>
                      <p className="text-[11px] text-slate-500">Matches {Math.max(uniqueSkills.length - 1, 0)} of your skills</p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">Good</span>
                  </div>
                </div>

                {/* Recent badges */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-3">Recent badges</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Quiz ace', color: '#BA7517', icon: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' },
                      { label: '7-day streak', color: '#D85A30', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                      { label: 'Zero plagiarism', color: '#1D9E75', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                      { label: 'Peer helper', color: '#534AB7', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                    ].map((badge, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-700/60 bg-slate-800/40 rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" stroke={badge.color} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={badge.icon}/></svg>
                        <span className="text-xs text-slate-300 font-medium">{badge.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── COURSES TAB ── */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {courses.map(course => (
              <div key={course.id} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-blue-400 text-xs font-bold">{course.code}</span>
                    <h3 className="text-lg font-bold text-white">{course.title}</h3>
                    <p className="text-xs text-slate-400">Instructor: {course.lecturerName}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${course.stats.moduleProgress >= 50 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {course.stats.moduleProgress}% Progress
                  </span>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-slate-400">Module Progress</span>
                    <span className="text-xs font-semibold text-white">{course.stats.completedModules}/{course.stats.totalModules}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${course.stats.moduleProgress >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${course.stats.moduleProgress}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Modules</p>
                  {course.modules.map((mod, idx) => (
                    <div
                      key={mod.id}
                      onClick={() => mod.unlocked && navigate(`/student/module/${mod.id}`)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-colors ${
                        mod.unlocked ? 'border-slate-700/60 bg-slate-800/30 hover:bg-slate-800/60 cursor-pointer' : 'border-slate-800/40 bg-slate-900/20 opacity-40 cursor-default'
                      }`}
                    >
                      {mod.unlocked ? (
                        <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      ) : (
                        <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-200">{mod.title}</p>
                        <p className="text-[11px] text-slate-500 capitalize">{mod.type} content</p>
                      </div>
                      {mod.unlocked ? (
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-semibold">Locked</span>
                      )}
                    </div>
                  ))}
                </div>

                {course.quizzes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quizzes</p>
                    {course.quizzes.map(quiz => {
                      const attempt = course.quizAttempts.find(a => a.quizId === quiz.id);
                      return (
                        <div
                          key={quiz.id}
                          onClick={() => !attempt && navigate(`/student/quiz/${quiz.id}`)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors ${
                            attempt
                              ? 'border-slate-800/60 bg-slate-900/20'
                              : 'border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/15 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <svg className={`w-4 h-4 shrink-0 ${attempt ? 'text-emerald-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <div>
                              <p className="text-[13px] font-semibold text-slate-200">{quiz.title}</p>
                              <p className="text-[11px] text-slate-500">{quiz.questions.length} questions · {quiz.timeLimit} min</p>
                            </div>
                          </div>
                          {attempt ? (
                            <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${attempt.score >= 70 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                              Score: {attempt.score}%
                            </span>
                          ) : (
                            <button className="text-[12px] px-2.5 py-1 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">Take Quiz</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            {courses.length === 0 && <p className="text-center text-xs text-slate-500 py-12">Not enrolled in any courses yet.</p>}
          </div>
        )}

        {/* ── ASSIGNMENTS TAB ── */}
        {activeTab === 'assignments' && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">All Assignments</p>
            {courses.flatMap(course =>
              course.assignments.map(assignment => {
                const submission = course.submissions.find(s => s.assignmentId === assignment.id);
                const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && !submission;
                const statusLabel = submission
                  ? submission.status === 'graded' ? 'Graded' : submission.status === 'flagged' ? 'Under Review' : 'Submitted'
                  : isOverdue ? 'Overdue' : 'Pending';
                const statusClass = submission
                  ? submission.status === 'graded'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : isOverdue
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-slate-800 text-slate-400';

                return (
                  <div
                    key={assignment.id}
                    onClick={() => !submission && navigate(`/student/assignment/${assignment.id}`)}
                    className={`bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 transition-colors ${!submission ? 'hover:border-blue-500/30 cursor-pointer' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-blue-400 text-[10px] font-bold">{course.code}</span>
                        <h4 className="text-sm font-bold text-white">{assignment.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-lg">{assignment.description}</p>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${statusClass}`}>{statusLabel}</span>
                    </div>
                    <div className="flex gap-6 text-[11px] text-slate-500 mt-3">
                      <span>Max: {assignment.maxScore}</span>
                      {assignment.dueDate && <span>Due: {new Date(assignment.dueDate).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' })}</span>}
                      {submission?.grade && <span className="text-emerald-400 font-semibold">Grade: {submission.grade.total}%</span>}
                      {submission?.similarity != null && (
                        <span className={submission.similarity > 30 ? 'text-red-400' : 'text-emerald-400'}>
                          Similarity: {submission.similarity}%
                        </span>
                      )}
                    </div>
                    {!submission && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/student/assignment/${assignment.id}`); }}
                        className="mt-3 text-[12px] px-3 py-1.5 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Submit Assignment
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── JOBS TAB ── */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jobs & Internships</p>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5">
              <div className="flex items-center gap-3 py-3 border-b border-slate-800/60">
                <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-2"/><path d="M9 7h1m-1 4h1m4-4h1m-1 4h1"/></svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">Software intern · MTN Rwanda</p>
                  <p className="text-xs text-slate-500">Matches {uniqueSkills.length} of your verified skills</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">Strong match</span>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-slate-800/60">
                <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-2"/><path d="M9 7h1m-1 4h1m4-4h1m-1 4h1"/></svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">Junior dev · Norrsken Kigali</p>
                  <p className="text-xs text-slate-500">Matches {Math.max(uniqueSkills.length - 1, 0)} of your verified skills</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">Good match</span>
              </div>
              <p className="text-xs text-slate-500 text-center py-4">Employer portal coming soon — schools pay to post, students are always free.</p>
            </div>
          </div>
        )}

        {/* ── BADGES TAB ── */}
        {activeTab === 'badges' && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Achievements & Badges</p>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Quiz Ace', desc: 'Score 90%+ on 3 quizzes', color: '#BA7517', icon: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' },
                  { label: '7-Day Streak', desc: 'Log in 7 days in a row', color: '#D85A30', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                  { label: 'Zero Plagiarism', desc: 'All submissions under 15% similarity', color: '#1D9E75', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                  { label: 'Peer Helper', desc: 'Help 5 classmates in forums', color: '#534AB7', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                  { label: 'Early Bird', desc: 'Submit all assignments before deadline', color: '#2563EB', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { label: 'Module Master', desc: 'Complete all modules in a course', color: '#7C3AED', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.247M12 2v8m0 0l-3-3m3 3l3-3' },
                ].map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 px-3 py-2 border border-slate-700/60 bg-slate-800/40 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke={badge.color} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={badge.icon}/></svg>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{badge.label}</p>
                      <p className="text-[10px] text-slate-500">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
