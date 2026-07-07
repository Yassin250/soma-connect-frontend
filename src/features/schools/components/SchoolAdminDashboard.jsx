import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { LecturerPortal } from './LecturerPortal';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import logo from '../../../assets/2.png';

const API_BASE_URL = 'http://localhost:5050/api/school';

export const SchoolAdminDashboard = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [school, setSchool] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const isLecturer = user && user.roles?.[0]?.toUpperCase() === 'LECTURER';
  
  // Roster lists
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  // Search & filter states matching UI inputs
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for manual additions
  const [showAddLec, setShowAddLec] = useState(false);
  const [newLecName, setNewLecName] = useState('');
  const [newLecEmail, setNewLecEmail] = useState('');

  const [showAddStud, setShowAddStud] = useState(false);
  const [newStudName, setNewStudName] = useState('');
  const [newStudEmail, setNewStudEmail] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const reloadData = useCallback(async () => {
    if (!user || !user.schoolId) return;
    
    try {
      // Fetch school info
      const schoolResponse = await fetch(`${API_BASE_URL}/${user.schoolId}`, {
        headers: getHeaders(),
      });
      if (schoolResponse.ok) {
        const schoolData = await schoolResponse.json();
        setSchool(schoolData.data || schoolData);
      }

      // Fetch metrics
      const metricsResponse = await fetch(`${API_BASE_URL}/${user.schoolId}/metrics`, {
        headers: getHeaders(),
      });
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data || metricsData);
      }

      // Fetch users
      const usersResponse = await fetch(`${API_BASE_URL}/${user.schoolId}/users`, {
        headers: getHeaders(),
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const users = Array.isArray(usersData) ? usersData : usersData.data || [];
        setLecturers(users.filter(u => u.role === 'LECTURER' || u.roles?.includes('LECTURER')));
        setStudents(users.filter(u => u.role === 'STUDENT' || u.roles?.includes('STUDENT')));
      }

      // Fetch courses
      const coursesResponse = await fetch(`${API_BASE_URL}/${user.schoolId}/courses`, {
        headers: getHeaders(),
      });
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(Array.isArray(coursesData) ? coursesData : coursesData.data || []);
      }
    } catch (err) {
      console.error('Error loading school dashboard data:', err);
    }
  }, [user, getHeaders]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  if (!school || !metrics) {
    const loadingBg = "w-screen h-screen bg-[#5429FF] flex flex-col items-center justify-center text-white font-medium";
    return (
      <div className={loadingBg}>
        <div className="animate-pulse tracking-wide text-sm uppercase">
          Loading {isLecturer ? 'Faculty Hub...' : 'Admin Workspace...'}
        </div>
      </div>
    );
  }

  if (isLecturer) {
    return (
      <div className="w-screen h-screen bg-[#F4F5FA] text-slate-800 flex flex-col overflow-hidden">
        <nav className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <img src={logo} alt="Logo" className="h-8 w-auto filter brightness-0 invert" />
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#5429FF]/10 text-[#5429FF] rounded-md uppercase tracking-wider">
                  Faculty Hub
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">{user.role}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="text-xs px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <LecturerPortal />
        </main>
      </div>
    );
  }

  const handleAddLecturer = async (e) => {
    e.preventDefault();
    if (!newLecName || !newLecEmail || !school) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${school.id}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newLecName, email: newLecEmail, role: 'LECTURER' }),
      });
      if (!response.ok) throw new Error('Failed to add lecturer');
      setNewLecName(''); setNewLecEmail(''); setShowAddLec(false);
      await reloadData();
    } catch (err) { alert(err.message); }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudName || !newStudEmail || !school) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${school.id}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newStudName, email: newStudEmail, role: 'STUDENT' }),
      });
      if (!response.ok) throw new Error('Failed to add student');
      setNewStudName(''); setNewStudEmail(''); setShowAddStud(false);
      await reloadData();
    } catch (err) { alert(err.message); }
  };

  const handleRemoveUser = (userId, userName) => {
    setConfirmDelete({
      title: 'Remove Profile',
      message: 'You are about to permanently remove this profile from the school.',
      itemName: userName,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const response = await fetch(`${API_BASE_URL}/${school.id}/users/${userId}`, {
            method: 'DELETE',
            headers: getHeaders(),
          });
          if (!response.ok) throw new Error('Failed to remove user');
          setConfirmDelete(null);
          await reloadData();
        } catch (err) { alert(err.message); }
        finally { setIsDeleting(false); }
      },
    });
  };

  const navigationItems = [
    { id: 'overview', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
    { id: 'lecturers', label: 'Faculty Roster', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'students', label: 'Student Directory', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'assignments', label: 'Applications', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'subscription', label: 'Billing & Plan', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }
  ];

  return (
    <div className="w-screen h-screen bg-[#F4F5FA] text-slate-800 antialiased flex flex-col md:flex-row overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-60 bg-[#5429FF] flex flex-col justify-between pt-8 pb-6 shrink-0 relative z-20">
        <div className="space-y-10">
          
          {/* Replaced Jobie with actual brand Logo asset */}
          <div className="flex items-center space-x-3 px-6 h-10">
            <img src={logo} alt="Soma Connect" className="h-7 w-auto object-contain object-left filter brightness-0 invert" />
          </div>

          {/* Navigation Menu Links */}
          <nav className="flex flex-col pl-4 relative">
            {navigationItems.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center space-x-3 py-4 pl-5 w-full text-xs font-bold tracking-wide transition-all duration-250 outline-none ${
                    isActive
                      ? 'bg-[#F4F5FA] text-[#5429FF] rounded-l-[2.5rem]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {/* Top Inverted Corner Curve */}
                  {isActive && (
                    <div className="absolute right-0 -top-5 w-5 h-5 bg-[#F4F5FA] before:content-[''] before:absolute before:top-0 before:left-0 before:w-5 before:h-5 before:rounded-br-[1.25rem] before:bg-[#5429FF]" />
                  )}
                  
                  {/* Icon */}
                  <svg 
                    className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'text-[#5429FF]' : 'text-white/60 group-hover:scale-105'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>

                  {/* Bottom Inverted Corner Curve */}
                  {isActive && (
                    <div className="absolute right-0 -bottom-5 w-5 h-5 bg-[#F4F5FA] before:content-[''] before:absolute before:top-0 before:left-0 before:w-5 before:h-5 before:rounded-tr-[1.25rem] before:bg-[#5429FF]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Node Info & Sign Out */}
        <div className="px-6 pt-6 border-t border-white/10">
          <div className="flex justify-between items-center text-xs">
            <div className="truncate pr-2">
              <p className="font-bold text-white truncate text-xs">{user?.name || "Administrator"}</p>
              <span className="text-[10px] text-purple-200/60 font-mono">School Admin</span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-[11px] bg-white/10 hover:bg-white text-white hover:text-[#5429FF] px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER PANEL */}
      <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto h-full">
        
        {/* TOP COMPONENT HEADER BAR */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-8 bg-[#5429FF] rounded-full" />
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Search Jobs & Directories</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{school.name}</p>
            </div>
          </div>
          
          {/* Universal Search Bar */}
          <div className="w-full lg:w-96 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus-within:border-[#5429FF] transition-all">
            <svg className="w-4 h-4 text-slate-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by name, email, or course tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-slate-700 font-medium placeholder-slate-400"
            />
          </div>
        </div>

        {/* METRICS & QUICK VIEWS BAR */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Suggestions:</span>
          <span className="px-3 py-1.5 bg-white text-slate-600 font-bold text-xs rounded-xl shadow-sm cursor-pointer border border-slate-100 hover:border-[#5429FF]">All Data</span>
          <span className="px-3 py-1.5 bg-[#5429FF] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer">Active Profiles</span>
          <span className="px-3 py-1.5 bg-white text-slate-600 font-bold text-xs rounded-xl shadow-sm cursor-pointer border border-slate-100 hover:border-[#5429FF]">Term: {school.academicYear || 'Not Configured'}</span>
        </div>

        {/* SWITCHABLE TAB INTERFACES */}

        {/* TAB 1: DASHBOARD METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Enrolled Students", value: metrics.totalStudents, label: "Active", color: "text-blue-600 bg-blue-50" },
                { title: "Faculty Members", value: metrics.totalLecturers, label: "Verified", color: "text-emerald-600 bg-emerald-50" },
                { title: "Running Courses", value: metrics.totalCourses, label: "LMS Modules", color: "text-purple-600 bg-purple-50" },
                { title: "Submission Rates", value: `${metrics.submissionRate ?? 0}%`, label: "Originality", color: "text-[#5429FF] bg-purple-50" }
              ].map((card, idx) => (
                <div key={idx} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{card.title}</span>
                  <div className="flex justify-between items-end mt-4">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</span>
                    <span className={`text-[10px] ${card.color} px-2.5 py-1 rounded-lg font-bold tracking-wide uppercase`}>
                      {card.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Active Course Sub-Instances</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold">
                        <th className="pb-3">Code</th>
                        <th className="pb-3">Title</th>
                        <th className="pb-3 text-right">Students</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {courses.length === 0 ? (
                        <tr><td colSpan="3" className="py-6 text-center text-slate-400 font-medium">No active courses.</td></tr>
                      ) : (
                        courses.map(course => (
                          <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 font-bold text-[#5429FF] font-mono">{course.code}</td>
                            <td className="py-3.5 font-semibold text-slate-800">{course.title}</td>
                            <td className="py-3.5 text-right font-bold text-slate-500 font-mono">{course.studentsCount} Enrolled</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Instance Activity Log</h3>
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {(metrics.recentActivity || []).map((activity, i) => (
                    <div key={activity.id || i} className="flex justify-between items-start gap-3 text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-slate-800 font-bold leading-tight">{activity.action}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{activity.time}</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#5429FF] mt-1 shrink-0" />
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
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div>
                <h3 className="text-base font-black text-slate-900">Faculty Members Registry</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Configure and verify lecturer accounts assigned to upload modules.</p>
              </div>
              <button
                onClick={() => setShowAddLec(!showAddLec)}
                className="px-4 py-2.5 bg-[#5429FF] hover:bg-purple-700 text-xs font-bold rounded-xl text-white shadow-md transition-all self-start sm:self-center"
              >
                {showAddLec ? 'Hide Form' : '+ Add Lecturer'}
              </button>
            </div>

            {showAddLec && (
              <form onSubmit={handleAddLecturer} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4 max-w-xl animate-fadeIn">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">New Faculty Credentials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Name</label>
                    <input
                      type="text" required value={newLecName} onChange={(e) => setNewLecName(e.target.value)}
                      placeholder="e.g. Christian R."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2.5 text-slate-800 outline-none focus:border-[#5429FF]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</label>
                    <input
                      type="email" required value={newLecEmail} onChange={(e) => setNewLecEmail(e.target.value)}
                      placeholder={`e.g. c.rw@${school.domain || 'domain.edu'}`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2.5 text-slate-800 outline-none focus:border-[#5429FF]"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddLec(false)} className="px-4 py-2 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-[#5429FF] text-white font-bold text-xs rounded-xl shadow-sm">Save Account</button>
                </div>
              </form>
            )}

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="pb-3">Full Name</th>
                    <th className="pb-3">Official Email</th>
                    <th className="pb-3 text-right">Directory Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {lecturers.length === 0 ? (
                    <tr><td colSpan="3" className="py-6 text-center text-slate-400 font-medium">No lecturers registered.</td></tr>
                  ) : (
                    lecturers.map(lec => (
                      <tr key={lec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 font-bold text-slate-900">{lec.name}</td>
                        <td className="py-4 font-mono text-slate-500 font-medium">{lec.email}</td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleRemoveUser(lec.id, lec.name)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[11px] text-red-600 font-bold rounded-xl border border-red-100 transition-all"
                          >
                            Revoke Access
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT DIRECTORY */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div>
                <h3 className="text-base font-black text-slate-900">Enrolled Student Directory</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Review system workspace profile registrations for verification tagging.</p>
              </div>
              <button
                onClick={() => setShowAddStud(!showAddStud)}
                className="px-4 py-2.5 bg-[#5429FF] hover:bg-purple-700 text-xs font-bold rounded-xl text-white shadow-md transition-all self-start sm:self-center"
              >
                {showAddStud ? 'Hide Form' : '+ Register Student'}
              </button>
            </div>

            {showAddStud && (
              <form onSubmit={handleAddStudent} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4 max-w-xl animate-fadeIn">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">New Student Registry Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Name</label>
                    <input
                      type="text" required value={newStudName} onChange={(e) => setNewStudName(e.target.value)}
                      placeholder="e.g. Ganza Kenny"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2.5 text-slate-800 outline-none focus:border-[#5429FF]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</label>
                    <input
                      type="email" required value={newStudEmail} onChange={(e) => setNewStudEmail(e.target.value)}
                      placeholder={`e.g. g.kenny@${school.domain || 'domain.edu'}`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2.5 text-slate-800 outline-none focus:border-[#5429FF]"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddStud(false)} className="px-4 py-2 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-[#5429FF] text-white font-bold text-xs rounded-xl shadow-sm">Save Profile</button>
                </div>
              </form>
            )}

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="pb-3">Full Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3 text-right">Status Checks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.length === 0 ? (
                    <tr><td colSpan="3" className="py-6 text-center text-slate-400 font-medium">No students enrolled.</td></tr>
                  ) : (
                    students.map(stud => (
                      <tr key={stud.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 font-bold text-slate-900">{stud.name}</td>
                        <td className="py-4 font-mono text-slate-500 font-medium">{stud.email}</td>
                        <td className="py-4 text-right flex items-center justify-end gap-3">
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-lg font-bold tracking-wider uppercase">
                            Verified
                          </span>
                          <button
                            onClick={() => handleRemoveUser(stud.id, stud.name)}
                            className="text-slate-400 hover:text-red-500 font-bold text-sm px-2 transition-colors"
                            title="Remove profile"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: COURSEWORK & GRADES RESTRICTION */}
        {activeTab === 'assignments' && (
          <div className="relative bg-amber-500/5 border border-amber-500/10 rounded-3xl p-8 md:p-12 text-center space-y-6 overflow-hidden max-w-3xl mx-auto">
            <div className="mx-auto w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="max-w-md mx-auto space-y-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Access Restricted for Academic Integrity</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                As a School Administrator, your clearance covers portal billing, account syncs, and directory registry auditing.
              </p>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl text-left text-xs text-amber-700 leading-relaxed font-semibold shadow-sm">
                🔒 System Policy Check: Detailed assignment resources, submitted student source files, similarity scans, and grades belong exclusively to assigned Lecturers and enrolled students.
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BILLING & SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">Billing & Active Plan</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Review subscription metrics and pricing tiers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-[#5429FF]/5 border border-[#5429FF]/10 rounded-3xl space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-[#5429FF] uppercase tracking-wider bg-[#5429FF]/10 px-2.5 py-1 rounded-lg">
                      Active
                    </span>
                    <h4 className="text-lg font-black text-slate-900 mt-3">Kigali Pilot Track</h4>
                  </div>
                  <span className="text-2xl font-black text-[#5429FF]">$0 <span className="text-xs font-normal text-slate-400">/ mo</span></span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Subsidized pilot plan sponsored by ICT Chamber for verified higher education registries in Kigali.
                </p>
                <hr className="border-slate-100" />
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Next Renewal:</span>
                  <span className="font-bold text-slate-900">September 2026</span>
                </div>
              </div>

              <div className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Enterprise Scale Capabilities</h4>
                <ul className="text-xs text-slate-600 font-medium space-y-2.5 leading-relaxed">
                  <li className="flex items-center gap-2">• Custom domain white-labeling (e.g. connect.ur.ac.rw)</li>
                  <li className="flex items-center gap-2">• Automated certificate storage on private ledgers</li>
                  <li className="flex items-center gap-2">• Dedicated direct API pipelines for matching engine queries</li>
                  <li className="flex items-center gap-2">• Plagiarism scan credit top-ups</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>

      {confirmDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDelete(null)}
          onConfirm={confirmDelete.onConfirm}
          title={confirmDelete.title}
          message={confirmDelete.message}
          itemName={confirmDelete.itemName}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};