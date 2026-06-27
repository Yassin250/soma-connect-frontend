import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const API_BASE_URL = 'http://localhost:5050/api/school';

export const SchoolSetupChecklist = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  
  // Wizard state
  const [activeStep, setActiveStep] = useState(1);
  
  // Step 1: Profile State
  const [departments, setDepartments] = useState(['Computer Science', 'Information Technology']);
  const [newDept, setNewDept] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [logoPreview, setLogoPreview] = useState(null);

  // Step 2: Lecturers State
  const [lecturers, setLecturers] = useState([]);
  const [lecName, setLecName] = useState('');
  const [lecEmail, setLecEmail] = useState('');
  const [importedLecs, setImportedLecs] = useState([]);

  // Step 3: Students State
  const [students, setStudents] = useState([]);
  const [studName, setStudName] = useState('');
  const [studEmail, setStudEmail] = useState('');
  const [importedStuds, setImportedStuds] = useState([]);
  const [isCopied, setIsCopied] = useState(false);

  // Step 4: Course State
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [courseAdded, setCourseAdded] = useState(false);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  // Load school info
  useEffect(() => {
    if (user && user.schoolId) {
      fetch(`${API_BASE_URL}/${user.schoolId}`, { headers: getHeaders() })
        .then(res => res.json())
        .then(data => {
          const schoolData = data.data || data;
          setSchool(schoolData);
          // Load any already registered users
          return fetch(`${API_BASE_URL}/${user.schoolId}/users`, { headers: getHeaders() });
        })
        .then(res => res.json())
        .then(usersData => {
          const users = Array.isArray(usersData) ? usersData : usersData.data || [];
          setLecturers(users.filter(u => u.role === 'LECTURER' || u.roles?.includes('LECTURER')));
          setStudents(users.filter(u => u.role === 'STUDENT' || u.roles?.includes('STUDENT')));
        })
        .catch(err => console.error('Error loading school setup data:', err));
    }
  }, [user, getHeaders]);

  if (!school) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center p-6 text-slate-400">
        Loading onboarding registry profile...
      </div>
    );
  }

  // Helper: check completion criteria
  const addedLecturerCount = lecturers.length;
  const addedStudentCount = students.length;
  const isProfileComplete = departments.length > 0 && academicYear !== '';

  const handleAddDept = (e) => {
    e.preventDefault();
    if (newDept.trim() && !departments.includes(newDept.trim())) {
      setDepartments([...departments, newDept.trim()]);
      setNewDept('');
    }
  };

  const handleRemoveDept = (dept) => {
    setDepartments(departments.filter(d => d !== dept));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // CSV parsing simulation for Lecturers
  const handleLecCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').map(line => line.split(','));
        // Assume format: Name,Email
        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i][0] && lines[i][1]) {
            parsed.push({
              name: lines[i][0].replace(/(^"|"$)/g, '').trim(),
              email: lines[i][1].replace(/(^"|"$)/g, '').trim()
            });
          }
        }
        setImportedLecs(parsed);
      };
      reader.readAsText(file);
    }
  };

  const importLecsConfirm = async () => {
    for (const item of importedLecs) {
      try {
        const response = await fetch(`${API_BASE_URL}/${school.id}/users`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            name: item.name,
            email: item.email,
            role: 'LECTURER',
          }),
        });
        if (response.ok) {
          const added = await response.json();
          setLecturers(prev => [...prev, added.data || added]);
        }
      } catch (err) {
        console.error(err.message);
      }
    }
    setImportedLecs([]);
  };

  const handleManualAddLec = async (e) => {
    e.preventDefault();
    if (!lecName || !lecEmail) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${school.id}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: lecName,
          email: lecEmail,
          role: 'LECTURER',
        }),
      });
      if (!response.ok) throw new Error('Failed to add lecturer');
      const added = await response.json();
      setLecturers(prev => [...prev, added.data || added]);
      setLecName('');
      setLecEmail('');
    } catch (err) {
      alert(err.message);
    }
  };

  // CSV parsing simulation for Students
  const handleStudCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').map(line => line.split(','));
        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i][0] && lines[i][1]) {
            parsed.push({
              name: lines[i][0].replace(/(^"|"$)/g, '').trim(),
              email: lines[i][1].replace(/(^"|"$)/g, '').trim()
            });
          }
        }
        setImportedStuds(parsed);
      };
      reader.readAsText(file);
    }
  };

  const importStudsConfirm = async () => {
    for (const item of importedStuds) {
      try {
        const response = await fetch(`${API_BASE_URL}/${school.id}/users`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            name: item.name,
            email: item.email,
            role: 'STUDENT',
          }),
        });
        if (response.ok) {
          const added = await response.json();
          setStudents(prev => [...prev, added.data || added]);
        }
      } catch (err) {
        console.error(err.message);
      }
    }
    setImportedStuds([]);
  };

  const handleManualAddStud = async (e) => {
    e.preventDefault();
    if (!studName || !studEmail) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${school.id}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: studName,
          email: studEmail,
          role: 'STUDENT',
        }),
      });
      if (!response.ok) throw new Error('Failed to add student');
      const added = await response.json();
      setStudents(prev => [...prev, added.data || added]);
      setStudName('');
      setStudEmail('');
    } catch (err) {
      alert(err.message);
    }
  };

  const downloadCSVTemplate = (type) => {
    const headers = 'Name,Email\n';
    const sampleRows = type === 'lecturer' 
      ? 'Christian Rwabuneza,c.rwabuneza@' + school.domain + '\nMarie Claire Uwineza,m.claire@' + school.domain
      : 'Ganza Kenny,g.kenny@' + school.domain + '\nKagabo Alain,k.alain@' + school.domain;
    
    const blob = new Blob([headers + sampleRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${type}_invite_template.csv`);
    a.click();
  };

  const handleCopyJoinLink = () => {
    const link = `${window.location.origin}/join/${school.slug}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!courseCode || !courseTitle || !selectedLecturerId) {
      alert('Please fill in all course fields.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/${school.id}/courses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          code: courseCode,
          title: courseTitle,
          lecturerId: selectedLecturerId,
          skills: ['CS', 'Engineering']
        }),
      });
      if (!response.ok) throw new Error('Failed to add course');
      
      setCourseAdded(true);
      setCourseCode('');
      setCourseTitle('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleActivateSchool = async () => {
    // Check validation constraints: minimum 1 lecturer and 1 student
    if (lecturers.length < 1 || students.length < 1) {
      alert('Cannot Activate: You must enroll at least 1 Lecturer and 1 Student before setting your school active.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${school.id}/complete-setup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          logo: logoPreview,
          departments,
          academicYear
        }),
      });
      if (!response.ok) throw new Error('Failed to activate school');
      
      navigate('/school/dashboard', { replace: true });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-6 md:p-12 antialiased">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Title Block */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-400/10 px-2.5 py-1 rounded">
              Verification Approved
            </span>
            <span className="text-slate-500 text-xs">ID: {school.id}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">{school.name} Setup Workspace</h1>
          <p className="text-xs text-slate-400">
            Follow the guided checklist below to configure curriculum routes and enroll academic staff.
          </p>
        </div>

        {/* Steps Horizontal Navigation */}
        <div className="grid grid-cols-4 gap-2 border border-slate-800/80 p-2.5 rounded-xl bg-slate-900/30">
          {[
            { step: 1, label: '1. Profile Setup' },
            { step: 2, label: '2. Add Lecturers' },
            { step: 3, label: '3. Enroll Students' },
            { step: 4, label: '4. First Course' }
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setActiveStep(item.step)}
              className={`py-2 text-center text-xs font-semibold rounded-lg transition-all ${
                activeStep === item.step
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Step Content Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6">
          
          {/* STEP 1: CONFIGURE PROFILE */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold">Step 1 — General Profile Configuration</h3>
                <p className="text-xs text-slate-400">Input primary metadata identifiers for transcripts and report branding.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">School Emblem / Logo</label>
                  <div className="border border-dashed border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-3 bg-[#0d1224]/50">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="w-16 h-16 object-contain rounded" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-slate-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-uploader" />
                    <label htmlFor="logo-uploader" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold rounded cursor-pointer transition-all">
                      Choose File
                    </label>
                  </div>
                </div>

                {/* Academic Year */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Academic Year</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2025-2026"
                    className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                  />
                  <p className="text-[10px] text-slate-500">Primary active calendar range.</p>
                </div>
              </div>

              {/* Department lists */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Departments / Degrees</label>
                
                <form onSubmit={handleAddDept} className="flex gap-2">
                  <input
                    type="text"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    placeholder="e.g. Mechanical Engineering"
                    className="flex-1 bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                  />
                  <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-all">
                    Add
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-1">
                  {departments.map((dept) => (
                    <span key={dept} className="flex items-center space-x-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs border border-blue-500/20">
                      <span>{dept}</span>
                      <button type="button" onClick={() => handleRemoveDept(dept)} className="text-blue-400 hover:text-red-400 font-bold ml-1 text-[10px]">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INVITE LECTURERS */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold">Step 2 — Invite Faculty & Lecturers</h3>
                <p className="text-xs text-slate-400">Lecturers design modules, publish quizzes, and grade plagiarism-checked submissions.</p>
              </div>

              {/* Grid: CSV Bulk Import vs Manual Invitation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* CSV Import */}
                <div className="space-y-4 border-r border-slate-800/80 pr-0 md:pr-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Option A: CSV Bulk Import</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Import multiple lecturers simultaneously using a spreadsheet template.
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => downloadCSVTemplate('lecturer')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold rounded-lg transition-all text-slate-300 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Template
                    </button>
                    
                    <input type="file" accept=".csv" onChange={handleLecCSVUpload} className="hidden" id="csv-lec-uploader" />
                    <label htmlFor="csv-lec-uploader" className="px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-[10px] font-semibold text-blue-400 rounded-lg cursor-pointer transition-all border border-blue-500/20">
                      Upload Filled CSV
                    </label>
                  </div>

                  {importedLecs.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs text-slate-400 font-semibold">Parsed CSV Results ({importedLecs.length} Rows):</p>
                      <div className="max-h-36 overflow-y-auto border border-slate-800 rounded bg-slate-950 p-2 text-[10px] space-y-1 font-mono">
                        {importedLecs.map((l, i) => (
                          <div key={i} className="flex justify-between text-slate-400">
                            <span>{l.name}</span>
                            <span className="text-slate-500">{l.email}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={importLecsConfirm}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-[10px] font-bold rounded-lg text-white"
                      >
                        Enroll Parsed Faculty Members
                      </button>
                    </div>
                  )}
                </div>

                {/* Manual Invite */}
                <form onSubmit={handleManualAddLec} className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Option B: Single Invitation</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={lecName}
                      onChange={(e) => setLecName(e.target.value)}
                      placeholder="e.g. Christian Rwabuneza"
                      className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={lecEmail}
                      onChange={(e) => setLecEmail(e.target.value)}
                      placeholder={`e.g. c.rwabuneza@${school.domain}`}
                      className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300"
                  >
                    Add Lecturer
                  </button>
                </form>
              </div>

              {/* Roster list */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Registered Lecturers ({lecturers.length})</h4>
                {lecturers.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono">No lecturers added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {lecturers.map(l => (
                      <div key={l.id} className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-white">{l.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{l.email}</p>
                        </div>
                        <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Invited</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: ENROLL STUDENTS */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold">Step 3 — Enroll Students</h3>
                <p className="text-xs text-slate-400">Students complete courses, write quizzes, and request verification credentials for original work.</p>
              </div>

              {/* Registration Link (Highly requested) */}
              <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-blue-400">Unique School Join Link</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Provide this URL link directly to students for quick self-registration (email domain verification required).
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/join/${school.slug}`}
                    className="flex-1 bg-[#0c1226] border border-slate-800 rounded-lg text-xs px-3 py-1.5 text-slate-300 font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleCopyJoinLink}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white"
                  >
                    {isCopied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Grid: CSV Bulk Import vs Manual Student Addition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                
                {/* CSV Import */}
                <div className="space-y-4 border-r border-slate-800/80 pr-0 md:pr-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Option A: CSV Student Import</h4>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => downloadCSVTemplate('student')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold rounded-lg text-slate-300 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Template
                    </button>
                    
                    <input type="file" accept=".csv" onChange={handleStudCSVUpload} className="hidden" id="csv-stud-uploader" />
                    <label htmlFor="csv-stud-uploader" className="px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-[10px] font-semibold text-blue-400 rounded-lg cursor-pointer transition-all border border-blue-500/20">
                      Upload CSV
                    </label>
                  </div>

                  {importedStuds.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs text-slate-400 font-semibold">Parsed Students ({importedStuds.length} Rows):</p>
                      <div className="max-h-36 overflow-y-auto border border-slate-800 rounded bg-slate-950 p-2 text-[10px] space-y-1 font-mono">
                        {importedStuds.map((s, i) => (
                          <div key={i} className="flex justify-between text-slate-400">
                            <span>{s.name}</span>
                            <span className="text-slate-500">{s.email}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={importStudsConfirm}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-[10px] font-bold rounded-lg text-white"
                      >
                        Enroll Parsed Student Directory
                      </button>
                    </div>
                  )}
                </div>

                {/* Manual Invite */}
                <form onSubmit={handleManualAddStud} className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Option B: Single Student Addition</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={studName}
                      onChange={(e) => setStudName(e.target.value)}
                      placeholder="e.g. Ganza Kenny"
                      className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={studEmail}
                      onChange={(e) => setStudEmail(e.target.value)}
                      placeholder={`e.g. g.kenny@${school.domain}`}
                      className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300"
                  >
                    Add Student
                  </button>
                </form>
              </div>

              {/* Roster list */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Enrolled Students ({students.length})</h4>
                {students.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono">No students added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {students.map(s => (
                      <div key={s.id} className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-white">{s.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{s.email}</p>
                        </div>
                        <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Enrolled</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: FIRST COURSE */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold">Step 4 — Initialize First Course</h3>
                <p className="text-xs text-slate-400">Initialize a mock module setup to verify data isolation routes.</p>
              </div>

              {courseAdded ? (
                <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-xs flex justify-between items-center">
                  <span>✓ Course initialized successfully! Your checklist is complete.</span>
                  <button onClick={() => setCourseAdded(false)} className="underline hover:text-white">Add another</button>
                </div>
              ) : (
                <form onSubmit={handleAddCourse} className="space-y-4 max-w-md">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Course Code</label>
                    <input
                      type="text"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="e.g. CS102"
                      className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Course Title</label>
                    <input
                      type="text"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="e.g. Introduction to Java Programming"
                      className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Lecturer</label>
                    {lecturers.length === 0 ? (
                      <div className="text-xs text-amber-500 font-semibold p-2 bg-amber-500/5 border border-amber-500/10 rounded">
                        Warning: Invite at least one lecturer in Step 2 to assign them here.
                      </div>
                    ) : (
                      <select
                        value={selectedLecturerId}
                        onChange={(e) => setSelectedLecturerId(e.target.value)}
                        className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-slate-300"
                      >
                        <option value="">-- Choose Lecturer --</option>
                        {lecturers.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={lecturers.length === 0}
                    className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      lecturers.length === 0 
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    }`}
                  >
                    Save Course
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Footer controls & Activation requirements */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-slate-900/30 border border-slate-800/80 rounded-2xl gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activation Metrics Check:</h4>
            <div className="flex flex-wrap gap-x-4 text-xs">
              <span className="flex items-center space-x-1.5">
                <span className={addedLecturerCount >= 1 ? "text-green-400" : "text-amber-400"}>
                  {addedLecturerCount >= 1 ? '✓' : '✕'} Lecturers: {addedLecturerCount}/1
                </span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className={addedStudentCount >= 1 ? "text-green-400" : "text-amber-400"}>
                  {addedStudentCount >= 1 ? '✓' : '✕'} Students: {addedStudentCount}/1
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={handleActivateSchool}
            className={`px-6 py-3 font-extrabold text-xs rounded-xl shadow-lg transition-all ${
              (addedLecturerCount >= 1 && addedStudentCount >= 1)
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white cursor-pointer hover:shadow-green-500/10'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            Activate School Dashboard (Phase 4)
          </button>
        </div>

      </div>
    </div>
  );
};
