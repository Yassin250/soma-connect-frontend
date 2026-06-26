import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDb } from '../../../services/mockDb';
import { useAuth } from '../../../context/AuthContext';
import { LecturerPortal } from './LecturerPortal';

export const SchoolAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [school, setSchool] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const isLecturer = user && user.role === 'LECTURER';
  
  // Roster lists
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  // Form states for manual additions on dashboard
  const [showAddLec, setShowAddLec] = useState(false);
  const [newLecName, setNewLecName] = useState('');
  const [newLecEmail, setNewLecEmail] = useState('');

  const [showAddStud, setShowAddStud] = useState(false);
  const [newStudName, setNewStudName] = useState('');
  const [newStudEmail, setNewStudEmail] = useState('');

  const reloadData = () => {
    if (user && user.schoolId) {
      const sch = mockDb.getSchool(user.schoolId);
      if (sch) {
        setSchool(sch);
        setMetrics(mockDb.getSchoolMetrics(user.schoolId));
        setLecturers(mockDb.getUsersBySchool(user.schoolId).filter(u => u.role === 'LECTURER'));
        setStudents(mockDb.getUsersBySchool(user.schoolId).filter(u => u.role === 'STUDENT'));
        setCourses(mockDb.getCoursesBySchool(user.schoolId));
      }
    }
  };

  useEffect(() => {
    reloadData();
  }, [user]);

  if (!school || !metrics) {
    if (isLecturer) {
      return (
        <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center text-slate-400">
          Loading faculty portal...
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center p-6 text-slate-400">
        Loading admin dashboard instance...
      </div>
    );
  }

  if (isLecturer) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] text-zinc-100 flex flex-col">
        <nav className="border-b border-slate-800 bg-[#0d1224]/50 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-black text-blue-500 tracking-wider uppercase">SomaConnect</span>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-800 border border-slate-700 text-slate-355 rounded uppercase">
                  Faculty Hub
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white">{user.name}</p>
                  <p className="text-[9px] text-slate-500 font-mono uppercase">{user.role}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <LecturerPortal />
        </main>
      </div>
    );
  }

  const handleAddLecturer = (e) => {
    e.preventDefault();
    if (!newLecName || !newLecEmail) return;
    try {
      mockDb.addUser({
        name: newLecName,
        email: newLecEmail,
        role: 'LECTURER',
        schoolId: school.id
      });
      setNewLecName('');
      setNewLecEmail('');
      setShowAddLec(false);
      reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudName || !newStudEmail) return;
    try {
      mockDb.addUser({
        name: newStudName,
        email: newStudEmail,
        role: 'STUDENT',
        schoolId: school.id
      });
      setNewStudName('');
      setNewStudEmail('');
      setShowAddStud(false);
      reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveUser = (userId) => {
    if (confirm('Are you sure you want to remove this user from the directory?')) {
      mockDb.removeUser(userId);
      reloadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white antialiased flex flex-col md:flex-row">
      
      {/* Sidebar navigation */}
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
                {school.type} Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {[
              { id: 'overview', label: 'Overview Metrics', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
              { id: 'lecturers', label: 'Faculty Directory', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
              { id: 'students', label: 'Student Directory', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
              { id: 'assignments', label: 'Coursework & Grades', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              { id: 'subscription', label: 'Billing & Plan', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }
            ].map((tab) => (
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
          <div className="flex justify-between items-center text-xs">
            <div className="truncate pr-2">
              <p className="font-semibold text-white truncate">{user?.name}</p>
              <span className="text-[9px] font-mono text-slate-500">School Admin</span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-[10px] bg-slate-800/80 hover:bg-red-950 hover:text-red-400 border border-slate-700/50 hover:border-red-900 px-2 py-1 rounded transition-all shrink-0"
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        
        {/* Top welcome */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Administrator Command Console
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Welcome back, Rector's Office
            </h1>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded border border-slate-800">
            Term: {school.academicYear || 'Not Configured'}
          </span>
        </div>

        {/* CONDITIONAL PORTAL BODY */}

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Students</span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-extrabold text-white">{metrics.enrolledStudents}</span>
                  <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded font-semibold">Active</span>
                </div>
              </div>

              <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Faculty Members</span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-extrabold text-white">{metrics.lecturersCount}</span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-semibold">Verified</span>
                </div>
              </div>

              <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Running Courses</span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-extrabold text-white">{metrics.coursesCount}</span>
                  <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-semibold">LMS modules</span>
                </div>
              </div>

              <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submission Rates</span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-extrabold text-white">{metrics.submissionRate}%</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">Originality</span>
                </div>
              </div>
            </div>

            {/* Courses & Activity split grids */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LMS modules summary */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Course Sub-Instances</h3>
                <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/20 text-xs">
                  <div className="grid grid-cols-12 p-3.5 bg-slate-900/50 border-b border-slate-850 font-bold text-slate-400">
                    <span className="col-span-3">Code</span>
                    <span className="col-span-6">Title</span>
                    <span className="col-span-3 text-right">Students</span>
                  </div>
                  {courses.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 font-mono">No active courses.</div>
                  ) : (
                    <div className="divide-y divide-slate-850">
                      {courses.map(course => (
                        <div key={course.id} className="grid grid-cols-12 p-3.5 items-center hover:bg-slate-900/40">
                          <span className="col-span-3 font-semibold text-blue-400 font-mono">{course.code}</span>
                          <span className="col-span-6 text-white truncate pr-2">{course.title}</span>
                          <span className="col-span-3 text-right text-slate-400 font-mono">{course.studentsCount} Enrolled</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Activity log */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Instance Activity Log</h3>
                <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-4 text-xs">
                  {metrics.recentActivity.map(activity => (
                    <div key={activity.id} className="flex justify-between items-start gap-4">
                      <div className="space-y-0.5">
                        <p className="text-slate-300 font-semibold">{activity.action}</p>
                        <p className="text-[10px] text-slate-500">{activity.time}</p>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: FACULTY DIRECTORY */}
        {activeTab === 'lecturers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Faculty Members Registry</h3>
                <p className="text-xs text-slate-400">Configure and verify lecturer accounts assigned to upload modules.</p>
              </div>
              <button
                onClick={() => setShowAddLec(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded-lg text-white shadow-lg transition-all"
              >
                + Add Lecturer
              </button>
            </div>

            {showAddLec && (
              <form onSubmit={handleAddLecturer} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 max-w-md">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">New Faculty Credentials</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      required
                      value={newLecName}
                      onChange={(e) => setNewLecName(e.target.value)}
                      placeholder="e.g. Christian R."
                      className="w-full bg-[#141c33] border border-slate-850 rounded-lg text-xs px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      required
                      value={newLecEmail}
                      onChange={(e) => setNewLecEmail(e.target.value)}
                      placeholder={`e.g. c.rw@${school.domain}`}
                      className="w-full bg-[#141c33] border border-slate-850 rounded-lg text-xs px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddLec(false)} className="px-3 py-1.5 bg-slate-800 text-xs rounded text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-xs rounded text-white">Save Account</button>
                </div>
              </form>
            )}

            <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/20 text-xs">
              <div className="grid grid-cols-12 p-3.5 bg-slate-900/50 border-b border-slate-850 font-bold text-slate-400">
                <span className="col-span-4">Full Name</span>
                <span className="col-span-5">Official Email</span>
                <span className="col-span-3 text-right">Directory Actions</span>
              </div>
              {lecturers.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No lecturers registered.</div>
              ) : (
                <div className="divide-y divide-slate-850">
                  {lecturers.map(lec => (
                    <div key={lec.id} className="grid grid-cols-12 p-3.5 items-center hover:bg-slate-900/40">
                      <span className="col-span-4 font-semibold text-white">{lec.name}</span>
                      <span className="col-span-5 font-mono text-slate-400">{lec.email}</span>
                      <div className="col-span-3 text-right">
                        <button
                          onClick={() => handleRemoveUser(lec.id)}
                          className="px-2.5 py-1 bg-red-950/20 hover:bg-red-950 text-[10px] border border-red-900/30 hover:border-red-900 text-red-400 font-semibold rounded transition-all"
                        >
                          Revoke Access
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT DIRECTORY */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Enrolled Student Directory</h3>
                <p className="text-xs text-slate-400">Review system workspace profile registrations for verification tagging.</p>
              </div>
              <button
                onClick={() => setShowAddStud(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded-lg text-white shadow-lg transition-all"
              >
                + Register Student
              </button>
            </div>

            {showAddStud && (
              <form onSubmit={handleAddStudent} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 max-w-md">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">New Student Registry Profile</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      required
                      value={newStudName}
                      onChange={(e) => setNewStudName(e.target.value)}
                      placeholder="e.g. Ganza Kenny"
                      className="w-full bg-[#141c33] border border-slate-850 rounded-lg text-xs px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      required
                      value={newStudEmail}
                      onChange={(e) => setNewStudEmail(e.target.value)}
                      placeholder={`e.g. g.kenny@${school.domain}`}
                      className="w-full bg-[#141c33] border border-slate-850 rounded-lg text-xs px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddStud(false)} className="px-3 py-1.5 bg-slate-800 text-xs rounded text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-xs rounded text-white">Save Profile</button>
                </div>
              </form>
            )}

            <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/20 text-xs">
              <div className="grid grid-cols-12 p-3.5 bg-slate-900/50 border-b border-slate-850 font-bold text-slate-400">
                <span className="col-span-4">Full Name</span>
                <span className="col-span-5">Email Address</span>
                <span className="col-span-3 text-right">Status Checks</span>
              </div>
              {students.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No students enrolled. Use setup link to invite them.</div>
              ) : (
                <div className="divide-y divide-slate-850">
                  {students.map(stud => (
                    <div key={stud.id} className="grid grid-cols-12 p-3.5 items-center hover:bg-slate-900/40">
                      <span className="col-span-4 font-semibold text-white">{stud.name}</span>
                      <span className="col-span-5 font-mono text-slate-400">{stud.email}</span>
                      <div className="col-span-3 text-right flex items-center justify-end gap-2">
                        <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                          Verified
                        </span>
                        <button
                          onClick={() => handleRemoveUser(stud.id)}
                          className="text-slate-500 hover:text-red-400 font-bold text-xs px-2"
                          title="Remove from directory"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ROLE ISOLATION - COURSEWORK & GRADES */}
        {activeTab === 'assignments' && (
          <div className="relative border border-amber-500/20 bg-amber-500/5 rounded-2xl p-8 md:p-12 text-center space-y-6 overflow-hidden">
            
            {/* Background design lock */}
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/5 rounded-full pointer-events-none" />
            
            <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div className="max-w-md mx-auto space-y-3">
              <h3 className="text-lg font-bold text-white tracking-tight">Access Restricted for Academic Integrity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                As a School Administrator, your clearance covers portal billing, account syncs, and directory registry auditing.
              </p>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-left text-[11px] text-amber-500 leading-relaxed font-semibold">
                🔒 System Policy Check: Detailed assignment resources, submitted student source files, similarity scans, and grades belong exclusively to assigned Lecturers and enrolled students. 
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BILLING & PLAN */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold">Billing & Active Plan</h3>
              <p className="text-xs text-slate-400">Review subscription metrics and pricing tiers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded">
                      Active
                    </span>
                    <h4 className="text-xl font-black text-white mt-2">Kigali Pilot Track</h4>
                  </div>
                  <span className="text-2xl font-black text-white">$0 <span className="text-xs font-normal text-slate-400">/ mo</span></span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Subsidized pilot plan sponsored by ICT Chamber for verified higher education registries in Kigali.
                </p>
                <hr className="border-slate-800" />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Next Renewal:</span>
                  <span className="font-semibold text-white">September 2026</span>
                </div>
              </div>

              <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Enterprise Scale Capabilities</h4>
                <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                  <li>• Custom domain white-labeling (e.g. connect.ur.ac.rw)</li>
                  <li>• Automated certificate storage on private ledgers</li>
                  <li>• Dedicated direct API pipelines for matching engine queries</li>
                  <li>• Plagiarism scan credit top-ups</li>
                </ul>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
