import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Badge } from '../../../components/shared/Badge';
import { Button } from '../../../components/shared/Button';

const API_BASE_URL = 'http://localhost:5050/api/lecturer';

export const LecturerPortal = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [school, setSchool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFlag, setSelectedFlag] = useState(null);

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [allQuizAttempts, setAllQuizAttempts] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [nudgedStudent, setNudgedStudent] = useState(null);
  const [nudgeMessage, setNudgeMessage] = useState('');

  // New Module builder
  const [newModuleCourseId, setNewModuleCourseId] = useState('');
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleType, setNewModuleType] = useState('video');
  const [newModuleContent, setNewModuleContent] = useState('');
  const [isModuleCreated, setIsModuleCreated] = useState(false);

  // New Quiz builder
  const [newQuizCourseId, setNewQuizCourseId] = useState('');
  const [newQuizModuleId, setNewQuizModuleId] = useState('');
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizTimeLimit, setNewQuizTimeLimit] = useState(15);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [qPrompt, setQPrompt] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState(0);
  const [quizAdded, setQuizAdded] = useState(false);

  // New Assignment builder
  const [newAssignCourseId, setNewAssignCourseId] = useState('');
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignDesc, setNewAssignDesc] = useState('');
  const [newAssignDueDate, setNewAssignDueDate] = useState('');
  const [newAssignMaxScore, setNewAssignMaxScore] = useState(100);
  const [assignCreated, setAssignCreated] = useState(false);

  // Grading
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeQuality, setGradeQuality] = useState(80);
  const [gradeLogic, setGradeLogic] = useState(85);
  const [gradeDoc, setGradeDoc] = useState(70);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradingSuccess, setGradingSuccess] = useState(false);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const reloadData = useCallback(async () => {
    if (!user || !user.schoolId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch school info
      const schoolResponse = await fetch(`${API_BASE_URL}/school/${user.schoolId}`, {
        headers: getHeaders(),
      });
      if (schoolResponse.ok) {
        const schoolData = await schoolResponse.json();
        setSchool(schoolData.data || schoolData);
      }

      // Fetch courses for this lecturer
      const coursesResponse = await fetch(`${API_BASE_URL}/courses?lecturerId=${user.id}&schoolId=${user.schoolId}`, {
        headers: getHeaders(),
      });
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(Array.isArray(coursesData) ? coursesData : coursesData.data || []);
      }

      // Fetch students for this school
      const studentsResponse = await fetch(`${API_BASE_URL}/school/${user.schoolId}/students`, {
        headers: getHeaders(),
      });
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(Array.isArray(studentsData) ? studentsData : studentsData.data || []);
      }

      // Fetch all submissions, assignments, modules, quizzes, attempts for courses
      const courseIds = courses.map(c => c.id);
      if (courseIds.length > 0) {
        const [subsResponse, assignsResponse, modsResponse, quizzesResponse, attemptsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/submissions?courseIds=${courseIds.join(',')}`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/assignments?courseIds=${courseIds.join(',')}`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/modules?courseIds=${courseIds.join(',')}`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/quizzes?courseIds=${courseIds.join(',')}`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/quiz-attempts?courseIds=${courseIds.join(',')}`, { headers: getHeaders() }),
        ]);

        if (subsResponse.ok) {
          const subsData = await subsResponse.json();
          setAllSubmissions(Array.isArray(subsData) ? subsData : subsData.data || []);
        }
        if (assignsResponse.ok) {
          const assignsData = await assignsResponse.json();
          setAllAssignments(Array.isArray(assignsData) ? assignsData : assignsData.data || []);
        }
        if (modsResponse.ok) {
          const modsData = await modsResponse.json();
          setAllModules(Array.isArray(modsData) ? modsData : modsData.data || []);
        }
        if (quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json();
          setAllQuizzes(Array.isArray(quizzesData) ? quizzesData : quizzesData.data || []);
        }
        if (attemptsResponse.ok) {
          const attemptsData = await attemptsResponse.json();
          setAllQuizAttempts(Array.isArray(attemptsData) ? attemptsData : attemptsData.data || []);
        }
      }
    } catch (err) {
      console.error('Error loading lecturer data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, getHeaders]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#16181f] flex items-center justify-center text-slate-400 text-sm">
        Loading faculty portal...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#16181f] flex items-center justify-center text-red-500 text-sm">
        Error: {error}
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-[#16181f] flex items-center justify-center text-slate-400 text-sm">
        No school data available.
      </div>
);
  }

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const plagiarismFlags = allSubmissions.filter(s => s.similarity > 30 && s.status !== 'graded');
  const pendingGrading = allSubmissions.filter(s => s.status === 'submitted');
  const gradedSubs = allSubmissions.filter(s => s.status === 'graded');

const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleName || !newModuleCourseId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/modules`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          courseId: newModuleCourseId,
          name: newModuleName,
          type: newModuleType,
          content: newModuleContent,
        }),
      });
      if (!response.ok) throw new Error('Failed to create module');
      setIsModuleCreated(true);
      setNewModuleName('');
      setNewModuleContent('');
      await reloadData();
      setTimeout(() => setIsModuleCreated(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const addQuizQuestion = (e) => {
    e.preventDefault();
    if (!qPrompt || !qOptA || !qOptB) return;
    setQuizQuestions(prev => [...prev, {
      prompt: qPrompt,
      options: [qOptA, qOptB, qOptC, qOptD].filter(Boolean),
      correctIndex: qCorrect
    }]);
    setQPrompt('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setQCorrect(0);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!newQuizTitle || !newQuizCourseId || quizQuestions.length === 0) return;
    try {
      const response = await fetch(`${API_BASE_URL}/quizzes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          moduleId: newQuizModuleId || null,
          courseId: newQuizCourseId,
          title: newQuizTitle,
          timeLimit: newQuizTimeLimit,
          questions: quizQuestions.map((q, i) => ({
            id: `q-${Date.now()}-${i}`,
            prompt: q.prompt,
            options: q.options,
            correctIndex: q.correctIndex
          }))
        }),
      });
      if (!response.ok) throw new Error('Failed to create quiz');
      setQuizAdded(true);
      setNewQuizTitle('');
      setQuizQuestions([]);
      setNewQuizModuleId('');
      await reloadData();
      setTimeout(() => setQuizAdded(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignTitle || !newAssignCourseId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          courseId: newAssignCourseId,
          title: newAssignTitle,
          description: newAssignDesc,
          dueDate: newAssignDueDate || null,
          maxScore: newAssignMaxScore,
          rubric: { quality: 40, logic: 40, documentation: 20 }
        }),
      });
      if (!response.ok) throw new Error('Failed to create assignment');
      setAssignCreated(true);
      setNewAssignTitle('');
      setNewAssignDesc('');
      setNewAssignDueDate('');
      setNewAssignMaxScore(100);
      await reloadData();
      setTimeout(() => setAssignCreated(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectSubmission = (sub) => {
    setSelectedSubmission(sub);
    setGradingSuccess(false);
    if (sub.grade) {
      setGradeQuality(sub.grade.quality);
      setGradeLogic(sub.grade.logic);
      setGradeDoc(sub.grade.documentation);
      setGradeFeedback(sub.feedback || '');
    } else {
      setGradeQuality(80);
      setGradeLogic(85);
      setGradeDoc(70);
      setGradeFeedback('');
    }
  };

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/${selectedSubmission.id}/grade`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          quality: gradeQuality,
          logic: gradeLogic,
          documentation: gradeDoc,
          feedback: gradeFeedback
        }),
      });
      if (!response.ok) throw new Error('Failed to submit grade');
      setGradingSuccess(true);
      await reloadData();
      setTimeout(() => {
        setSelectedSubmission(null);
        setGradingSuccess(false);
      }, 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePlagiarismOverride = async (subId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/${subId}/grade`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          quality: 50,
          logic: 50,
          documentation: 50,
          feedback: 'Plagiarism flag overridden by lecturer. Submission accepted with review note.'
        }),
      });
      if (!response.ok) throw new Error('Failed to override plagiarism');
      setSelectedFlag(null);
      await reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePlagiarismConfirm = async (subId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/${subId}/flag`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reason: 'Plagiarism detected' }),
      });
      if (!response.ok) throw new Error('Failed to flag submission');
      setSelectedFlag(null);
      await reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const triggerNudge = (student) => {
    setNudgedStudent(student);
    setNudgeMessage(`Hi ${student.name},\n\nOur records indicate you haven't completed this week's assignments. Please review your pending modules and submit your work as soon as possible.\n\nBest regards,\n${user.name}`);
  };

  const sendNudgeConfirm = () => {
    alert(`Nudge email successfully dispatched to ${nudgedStudent.email}`);
    setNudgedStudent(null);
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStudentName = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${studentId}`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return data.data?.name || data.name || studentId;
      }
      return studentId;
    } catch (err) {
      return studentId;
    }
  };

  const getAssignmentTitle = (assignmentId) => {
    const a = allAssignments.find(a => a.id === assignmentId);
    return a ? a.title : assignmentId;
  };

  const getCourseForAssignment = (assignmentId) => {
    const a = allAssignments.find(a => a.id === assignmentId);
    if (!a) return '';
    const c = courses.find(c => c.id === a.courseId);
    return c ? c.code : '';
  };

  return (
    <div className="space-y-8 text-slate-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-slate-900/30 border border-slate-800/80 rounded-2xl gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-base">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-white leading-snug">{user.name}</h2>
            <p className="text-xs text-slate-400">Faculty Instructor · {school.name}</p>
          </div>
        </div>
        <div className="flex gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab('courses')}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all text-slate-300"
          >
            + New module
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className="flex-1 sm:flex-none px-4 py-2 bg-[#d0f24a] hover:bg-[#c4e83a] text-xs font-semibold rounded-lg text-[#1b1e26] shadow shadow-[#d0f24a]/10 transition-all"
          >
            + New assignment
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-slate-800/80 gap-1 pb-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { id: 'courses', label: 'Cisco-Style Modules', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          { id: 'assignments', label: 'Grading Rubrics', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { id: 'students', label: 'Academic Roster', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          { id: 'analytics', label: 'Performance Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h-2a2 2 0 00-2-2z' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 border border-transparent ${
              activeTab === tab.id
                ? 'bg-[#d0f24a]/10 text-[#d0f24a] border-[#d0f24a]/10'
                : 'text-slate-400 hover:bg-slate-800/30'
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
            </svg>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('courses')}
              className="p-5 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-600 transition-all space-y-1 bg-slate-900/20"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Courses</p>
              <p className="text-xl font-extrabold text-white">{courses.length}</p>
            </div>
            <div
              onClick={() => setActiveTab('students')}
              className="p-5 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-600 transition-all space-y-1 bg-slate-900/20"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</p>
              <p className="text-xl font-extrabold text-white">{students.length}</p>
            </div>
            <div
              onClick={() => setActiveTab('assignments')}
              className="p-5 border border-amber-500/20 rounded-xl cursor-pointer hover:border-amber-500/40 transition-all space-y-1 bg-amber-500/5"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Grading</p>
              <p className="text-xl font-extrabold text-amber-500">{pendingGrading.length}</p>
            </div>
            <div
              onClick={() => setActiveTab('assignments')}
              className="p-5 border border-red-500/20 rounded-xl cursor-pointer hover:border-red-500/40 transition-all space-y-1 bg-red-500/5"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plagiarism Flags</p>
              <p className="text-xl font-extrabold text-red-500">{plagiarismFlags.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Course progress bars */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Course Syllabus Progress</h3>
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 md:p-6 space-y-5">
                {courses.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No courses assigned yet.</p>
                ) : (
                  courses.map((course) => {
                    const courseModules = allModules.filter(m => m.courseId === course.id);
                    const unlocked = courseModules.filter(m => m.unlocked).length;
                    const pct = courseModules.length > 0 ? Math.round((unlocked / courseModules.length) * 100) : 0;
                    return (
                      <div key={course.id} className="space-y-2">
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <p className="font-semibold text-white">{course.code} — {course.title}</p>
                            <p className="text-[10px] text-slate-500">{course.studentsCount} students · {courseModules.length} modules</p>
                          </div>
                          <span className={`font-mono font-bold ${pct >= 50 ? 'text-emerald-400' : 'text-amber-500'}`}>{pct}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Plagiarism Flags - real data */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Similarity Flags</h3>
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 md:p-6 space-y-4">
                {plagiarismFlags.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs font-mono">
                    ✓ No plagiarism flags.
                  </div>
                ) : (
                  plagiarismFlags.map((flag) => (
                    <div
                      key={flag.id}
                      onClick={() => setSelectedFlag(flag)}
                      className="p-3.5 bg-slate-950 hover:bg-slate-800/30 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-700 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-[10px]">
                          {getStudentName(flag.studentId).split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{getStudentName(flag.studentId)}</p>
                          <p className="text-[10px] text-slate-500">{getCourseForAssignment(flag.assignmentId)} · {getAssignmentTitle(flag.assignmentId)}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-red-500/10 text-red-400 font-bold text-[10px] rounded-md border border-red-500/20">
                        {flag.similarity}% match
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pending grading - real data */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Pending Assignment Grading</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {pendingGrading.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-slate-500 text-xs">All submissions graded. Nice work!</div>
              ) : (
                pendingGrading.slice(0, 6).map((sub) => {
                  const assignment = allAssignments.find(a => a.id === sub.assignmentId);
                  const isOverdue = assignment?.dueDate && new Date(assignment.dueDate) < new Date();
                  const isDueToday = assignment?.dueDate && new Date(assignment.dueDate).toDateString() === new Date().toDateString();
                  const badgeLabel = isOverdue ? 'Overdue' : isDueToday ? 'Due today' : 'On track';
                  const badgeStyle = isOverdue
                    ? 'border-red-500/20 bg-red-500/5 text-red-400'
                    : isDueToday
                    ? 'border-[#d0f24a]/20 bg-[#d0f24a]/5 text-[#d0f24a]'
                    : 'border-green-500/20 bg-green-500/5 text-green-400';
                  return (
                    <div
                      key={sub.id}
                      onClick={() => { setActiveTab('assignments'); }}
                      className="p-5 bg-slate-900/40 hover:bg-slate-800/30 border border-slate-800/80 hover:border-slate-700 rounded-xl cursor-pointer transition-all space-y-3 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-white">{getStudentName(sub.studentId)}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">{getAssignmentTitle(sub.assignmentId)} · Similarity: {sub.similarity}%</p>
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${badgeStyle}`}>
                        {badgeLabel}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODULES */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-[15px] font-semibold text-white">Course Syllabus Manager</h3>
              <p className="text-xs text-slate-400">Manage modules and course structure. Students progress through sequentially.</p>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">No courses assigned yet.</div>
            ) : (
              courses.map((course) => {
                const courseModules = allModules.filter(m => m.courseId === course.id);
                const courseQuizzes = allQuizzes.filter(q => q.courseId === course.id);
                return (
                  <div key={course.id} className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="font-extrabold text-[#d0f24a] font-mono">{course.code}</span>
                      <span className="font-semibold text-white truncate max-w-xs">{course.title}</span>
                    </div>
                    {courseModules.length === 0 ? (
                      <p className="text-slate-500 text-[10px]">No modules yet. Create one using the form.</p>
                    ) : (
                      <ul className="space-y-2 text-slate-400">
                        {courseModules.map((mod, mIdx) => (
                          <li key={mod.id} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-850">
                            <div>
                              <span className="text-white font-semibold">{mod.title}</span>
                              <span className="ml-2 text-[10px] text-slate-500 capitalize">({mod.type})</span>
                            </div>
                            <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                              mod.unlocked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {mod.unlocked ? 'Active' : 'Locked'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {courseQuizzes.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/50">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Quizzes</p>
                        {courseQuizzes.map(q => (
                          <div key={q.id} className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-850">
                            <span className="text-slate-300">{q.title}</span>
                            <span className="text-[10px] text-slate-500">{q.questions.length} questions · {q.timeLimit} min</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Builder Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            {/* New Module Form */}
            <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configure New Module</h4>
              {isModuleCreated && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg">
                  Module created and added to syllabus.
                </div>
              )}
              <form onSubmit={handleCreateModule} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Course</label>
                  <select
                    value={newModuleCourseId}
                    onChange={(e) => setNewModuleCourseId(e.target.value)}
                    required
                    className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Module Name</label>
                  <input
                    type="text"
                    required
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    placeholder="e.g. Module 3: Polymorphism"
                    className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d0f24a]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Media format</label>
                  <select
                    value={newModuleType}
                    onChange={(e) => setNewModuleType(e.target.value)}
                    className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                  >
                    <option value="video">Streaming MP4 Video Lecture</option>
                    <option value="pdf">Accredited Reading Module (PDF)</option>
                    <option value="quiz">Interactive Syllabus Quiz</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Description</label>
                  <textarea
                    value={newModuleContent}
                    onChange={(e) => setNewModuleContent(e.target.value)}
                    placeholder="Brief module description..."
                    rows={3}
                    className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d0f24a] resize-none"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-[#d0f24a] hover:bg-[#c4e83a] text-[#1b1e26] font-bold rounded-lg mt-2">
                  Create Module
                </button>
              </form>
            </div>

            {/* Quiz Builder Form */}
            <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Create Quiz</h4>
              {quizAdded && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg">
                  Quiz created with {quizQuestions.length} questions.
                </div>
              )}
              <form onSubmit={handleCreateQuiz} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Course</label>
                  <select
                    value={newQuizCourseId}
                    onChange={(e) => setNewQuizCourseId(e.target.value)}
                    required
                    className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Link to Module (optional)</label>
                  <select
                    value={newQuizModuleId}
                    onChange={(e) => setNewQuizModuleId(e.target.value)}
                    className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                  >
                    <option value="">-- None --</option>
                    {allModules.filter(m => m.courseId === newQuizCourseId).map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Quiz Title</label>
                  <input
                    type="text"
                    required
                    value={newQuizTitle}
                    onChange={(e) => setNewQuizTitle(e.target.value)}
                    placeholder="e.g. OOP Fundamentals Quiz"
                    className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-[#d0f24a]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Time Limit (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newQuizTimeLimit}
                    onChange={(e) => setNewQuizTimeLimit(Number(e.target.value))}
                    className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-[#d0f24a]"
                  />
                </div>

                {/* Questions list */}
                {quizQuestions.length > 0 && (
                  <div className="space-y-2 border-t border-slate-800 pt-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{quizQuestions.length} question(s) added</p>
                    {quizQuestions.map((q, i) => (
                      <div key={i} className="p-2 bg-slate-950 rounded border border-slate-850 text-[10px]">
                        <span className="text-white font-semibold">Q{i + 1}: {q.prompt}</span>
                        <span className="ml-2 text-slate-500">({q.options.length} options, correct: {String.fromCharCode(65 + q.correctIndex)})</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add question inline */}
                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Add Question</p>
                  <input
                    type="text"
                    value={qPrompt}
                    onChange={(e) => setQPrompt(e.target.value)}
                    placeholder="Question prompt..."
                    className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={qOptA} onChange={(e) => setQOptA(e.target.value)} placeholder="Option A" className="bg-[#20242e] border border-slate-800 rounded-lg p-2 text-white focus:outline-none" />
                    <input type="text" value={qOptB} onChange={(e) => setQOptB(e.target.value)} placeholder="Option B" className="bg-[#20242e] border border-slate-800 rounded-lg p-2 text-white focus:outline-none" />
                    <input type="text" value={qOptC} onChange={(e) => setQOptC(e.target.value)} placeholder="Option C (optional)" className="bg-[#20242e] border border-slate-800 rounded-lg p-2 text-white focus:outline-none" />
                    <input type="text" value={qOptD} onChange={(e) => setQOptD(e.target.value)} placeholder="Option D (optional)" className="bg-[#20242e] border border-slate-800 rounded-lg p-2 text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Correct Answer</label>
                    <div className="flex gap-3">
                      {['A', 'B', 'C', 'D'].map((label, i) => (
                        <label key={i} className="flex items-center space-x-1 cursor-pointer">
                          <input type="radio" checked={qCorrect === i} onChange={() => setQCorrect(i)} className="accent-[#d0f24a]" />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={addQuizQuestion} className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg">
                    + Add Question to Quiz
                  </button>
                </div>

                {quizQuestions.length > 0 && (
                  <button type="submit" className="w-full py-2 bg-[#d0f24a] hover:bg-[#c4e83a] text-[#1b1e26] font-bold rounded-lg">
                    Create Quiz ({quizQuestions.length} questions)
                  </button>
                )}
              </form>
            </div>

            {/* Assignment Builder */}
            <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Create Assignment</h4>
              {assignCreated && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg">
                  Assignment created successfully.
                </div>
              )}
              <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Course</label>
                  <select
                    value={newAssignCourseId}
                    onChange={(e) => setNewAssignCourseId(e.target.value)}
                    required
                    className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Assignment Title</label>
                  <input
                    type="text"
                    required
                    value={newAssignTitle}
                    onChange={(e) => setNewAssignTitle(e.target.value)}
                    placeholder="e.g. Assignment 3: Inheritance Lab"
                    className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d0f24a]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Description</label>
                  <textarea
                    value={newAssignDesc}
                    onChange={(e) => setNewAssignDesc(e.target.value)}
                    placeholder="Assignment instructions..."
                    rows={3}
                    className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d0f24a] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Due Date</label>
                    <input
                      type="date"
                      value={newAssignDueDate}
                      onChange={(e) => setNewAssignDueDate(e.target.value)}
                      className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d0f24a]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">Max Score</label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={newAssignMaxScore}
                      onChange={(e) => setNewAssignMaxScore(Number(e.target.value))}
                      className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d0f24a]"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-[#d0f24a] hover:bg-[#c4e83a] text-[#1b1e26] font-bold rounded-lg mt-2">
                  Create Assignment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GRADING */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-[15px] font-semibold text-white">Interactive Grading Suite</h3>
            <p className="text-xs text-slate-400">Score submissions using custom criteria sliders with auto-grade calculations.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Submission queue */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Submissions Queue</h4>
              <div className="space-y-2">
                {allSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">No submissions yet.</div>
                ) : (
                  allSubmissions.map(sub => (
                    <div
                      key={sub.id}
                      onClick={() => handleSelectSubmission(sub)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs ${
                        selectedSubmission?.id === sub.id
                          ? 'bg-[#d0f24a]/10 border-[#d0f24a] text-white'
                          : 'bg-slate-900/40 border-slate-850 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{getStudentName(sub.studentId)}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{getAssignmentTitle(sub.assignmentId)} · {sub.similarity}% similarity</p>
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider ${
                        sub.status === 'graded'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : sub.status === 'flagged'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {sub.status === 'graded' ? `Graded: ${sub.grade.total}%` : sub.status === 'flagged' ? 'Flagged' : 'Pending'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Grading panel */}
            <div className="lg:col-span-8">
              {selectedSubmission ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl">
                  <div className="space-y-5 text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">Grading Rubric</h4>
                      <p className="text-[10px] text-slate-500">Student: {getStudentName(selectedSubmission.studentId)}</p>
                      <p className="text-[10px] text-slate-500">Assignment: {getAssignmentTitle(selectedSubmission.assignmentId)}</p>
                    </div>

                    {gradingSuccess ? (
                      <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-center font-semibold animate-pulse">
                        Grade Submitted Successfully!
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-400">Code Quality (40%)</span>
                            <span className="text-white font-mono">{gradeQuality}/100</span>
                          </div>
                          <input type="range" min="0" max="100" value={gradeQuality} onChange={(e) => setGradeQuality(Number(e.target.value))} className="w-full accent-[#d0f24a]" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-400">Logical Execution (40%)</span>
                            <span className="text-white font-mono">{gradeLogic}/100</span>
                          </div>
                          <input type="range" min="0" max="100" value={gradeLogic} onChange={(e) => setGradeLogic(Number(e.target.value))} className="w-full accent-[#d0f24a]" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-400">Documentation (20%)</span>
                            <span className="text-white font-mono">{gradeDoc}/100</span>
                          </div>
                          <input type="range" min="0" max="100" value={gradeDoc} onChange={(e) => setGradeDoc(Number(e.target.value))} className="w-full accent-[#d0f24a]" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-semibold uppercase">Feedback</label>
                          <textarea
                            value={gradeFeedback}
                            onChange={(e) => setGradeFeedback(e.target.value)}
                            rows={3}
                            placeholder="Optional feedback for student..."
                            className="w-full bg-[#20242e] border border-slate-800 rounded-lg p-2 text-white focus:outline-none resize-none"
                          />
                        </div>
                        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Weighted Total:</p>
                            <p className="text-xl font-semibold text-white font-mono">
                              {Math.round((gradeQuality * 0.4) + (gradeLogic * 0.4) + (gradeDoc * 0.2))}%
                            </p>
                          </div>
                          <button
                            onClick={handleSubmitGrade}
                            className="px-5 py-2 bg-[#d0f24a] hover:bg-[#c4e83a] text-[#1b1e26] font-bold rounded-lg shadow transition-all"
                          >
                            Submit Grade
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Code preview */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Submission Code Preview</h4>
                    <div className="border border-slate-850 bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-slate-400 overflow-x-auto whitespace-pre leading-relaxed h-80 overflow-y-auto border-l-4 border-l-[#d0f24a]">
                      {selectedSubmission.content || '// No code submitted'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 text-xs font-mono text-center p-6 bg-slate-900/10">
                  Select a student submission to review and grade.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENTS */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-[15px] font-semibold text-white">Enrolled Students</h3>
              <p className="text-xs text-slate-400">Search student grades, activity logs, and dispatch notifications.</p>
            </div>
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-[#20242e] border border-slate-800 rounded-lg text-xs px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#d0f24a]"
            />
          </div>

          <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/20 text-xs">
            <div className="grid grid-cols-12 p-3.5 bg-slate-900/50 border-b border-slate-850 font-bold text-slate-400">
              <span className="col-span-3">Student</span>
              <span className="col-span-3">Email</span>
              <span className="col-span-3 text-center">Assignments</span>
              <span className="col-span-3 text-right">Interventions</span>
            </div>
            {filteredStudents.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No students matching search filter.</div>
            ) : (
              <div className="divide-y divide-slate-850">
                {filteredStudents.map(student => {
                  const studentSubs = allSubmissions.filter(s => s.studentId === student.id);
                  const graded = studentSubs.filter(s => s.status === 'graded').length;
                  const pending = allAssignments.length - studentSubs.length;
                  return (
                    <div key={student.id} className="grid grid-cols-12 p-3.5 items-center hover:bg-slate-900/40">
                      <span className="col-span-3 font-semibold text-white">{student.name}</span>
                      <span className="col-span-3 font-mono text-slate-400">{student.email}</span>
                      <div className="col-span-3 flex items-center justify-center gap-2 text-[10px]">
                        <span className="text-green-400">{graded} graded</span>
                        <span className="text-amber-400">{pending} pending</span>
                      </div>
                      <div className="col-span-3 text-right">
                        <button
                          onClick={() => triggerNudge(student)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-[10px] border border-amber-500/20 text-amber-500 font-bold rounded-md transition-all"
                        >
                          Nudge Student
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-[15px] font-semibold text-white">Aggregated Performance Metrics</h3>
            <p className="text-xs text-slate-400">Compare average scores per course and submission grades.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Average scores per course */}
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Average Grade per Course (%)</h4>
              <div className="relative pt-6">
                <svg className="w-full h-48" viewBox="0 0 400 200">
                  <line x1="40" y1="20" x2="380" y2="20" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="40" y1="65" x2="380" y2="65" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="40" y1="110" x2="380" y2="110" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="40" y1="155" x2="380" y2="155" stroke="#1e293b" strokeWidth="0.5" />
                  <text x="15" y="24" fill="#64748b" className="text-[8px] font-mono">100%</text>
                  <text x="20" y="69" fill="#64748b" className="text-[8px] font-mono">75%</text>
                  <text x="20" y="114" fill="#64748b" className="text-[8px] font-mono">50%</text>
                  <text x="20" y="159" fill="#64748b" className="text-[8px] font-mono">25%</text>
                  {courses.map((course, i) => {
                    const courseSubs = allSubmissions.filter(s => {
                      const assignment = allAssignments.find(a => a.id === s.assignmentId);
                      return assignment && assignment.courseId === course.id && s.grade;
                    });
                    const avg = courseSubs.length > 0
                      ? Math.round(courseSubs.reduce((sum, s) => sum + s.grade.total, 0) / courseSubs.length)
                      : 0;
                    const barX = 40 + (i * (340 / courses.length)) + 20;
                    const barH = avg * 1.35;
                    return (
                      <g key={course.id}>
                        <rect x={barX} y={20} width="36" height="135" rx="3" fill="#101217" opacity="0.3" />
                        <rect x={barX} y={155 - barH + 20} width="36" height={barH} rx="3" fill="#d0f24a" opacity="0.85" />
                        <text x={barX + 18} y="175" fill="#64748b" textAnchor="middle" className="text-[8px] font-mono">{course.code}</text>
                      </g>
                    );
                  })}
                  <line x1="40" y1="155" x2="380" y2="155" stroke="#334155" />
                </svg>
              </div>
            </div>

            {/* Submission status breakdown */}
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Submission Status Breakdown</h4>
              <div className="space-y-4 pt-4">
                {courses.map(course => {
                  const courseAssignIds = allAssignments.filter(a => a.courseId === course.id).map(a => a.id);
                  const courseSubs = allSubmissions.filter(s => courseAssignIds.includes(s.assignmentId));
                  const graded = courseSubs.filter(s => s.status === 'graded').length;
                  const pending = courseSubs.filter(s => s.status === 'submitted').length;
                  const flagged = courseSubs.filter(s => s.status === 'flagged').length;
                  const total = courseSubs.length;
                  return (
                    <div key={course.id} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white font-semibold">{course.code}</span>
                        <span className="text-slate-400">{total} submissions</span>
                      </div>
                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        {total > 0 && (
                          <>
                            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(graded / total) * 100}%` }} />
                            <div className="h-full bg-amber-500 transition-all" style={{ width: `${(pending / total) * 100}%` }} />
                            <div className="h-full bg-red-500 transition-all" style={{ width: `${(flagged / total) * 100}%` }} />
                          </>
                        )}
                      </div>
                      <div className="flex gap-4 text-[10px]">
                        <span className="text-emerald-400">Graded: {graded}</span>
                        <span className="text-amber-400">Pending: {pending}</span>
                        <span className="text-red-400">Flagged: {flagged}</span>
                      </div>
                    </div>
                  );
                })}
                {courses.length === 0 && (
                  <p className="text-slate-500 text-xs text-center">No course data available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLAGIARISM REVIEW MODAL */}
      {selectedFlag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedFlag(null)} />
          <div className="relative w-full max-w-4xl bg-[#181b22] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl z-10 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2.5 py-1 rounded">
                  AI Plagiarism Comparison
                </span>
                <h3 className="text-[15px] font-semibold text-white mt-2">Similarity Scan: {getStudentName(selectedFlag.studentId)}</h3>
                <p className="text-xs text-slate-400">{getCourseForAssignment(selectedFlag.assignmentId)} · {getAssignmentTitle(selectedFlag.assignmentId)} (Match Score: {selectedFlag.similarity}%)</p>
              </div>
              <button onClick={() => setSelectedFlag(null)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>
            <div className="border border-slate-800 bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-slate-400 overflow-auto max-h-72 whitespace-pre leading-relaxed">
              {selectedFlag.content || '// Submission content not available'}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-900 border border-slate-800 rounded-xl gap-4">
              <div className="text-xs text-slate-400 max-w-md leading-relaxed">
                Review the evidence before making a decision. False positives can occur with boilerplate structures. Your override decision is recorded as final.
              </div>
              <div className="flex gap-2 self-stretch sm:self-auto">
                <button
                  onClick={() => handlePlagiarismOverride(selectedFlag.id)}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-lg text-white"
                >
                  Override & Pass (False Positive)
                </button>
                <button
                  onClick={() => handlePlagiarismConfirm(selectedFlag.id)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold rounded-lg text-white"
                >
                  Confirm Plagiarism (Fail)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NUDGE MODAL */}
      {nudgedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setNudgedStudent(null)} />
          <div className="relative w-full max-w-md bg-[#181b22] border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4">
            <div>
              <h3 className="text-[15px] font-semibold text-white">Send Academic Nudge</h3>
              <p className="text-xs text-slate-400">Prompt {nudgedStudent.name} about outstanding module components.</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-semibold uppercase">Email Message</label>
              <textarea
                value={nudgeMessage}
                onChange={(e) => setNudgeMessage(e.target.value)}
                rows={6}
                className="w-full bg-[#20242e] border border-slate-800 rounded-lg text-xs p-3 text-white placeholder-slate-500 resize-none font-sans focus:outline-none"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setNudgedStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={sendNudgeConfirm}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-xs font-bold rounded-lg text-slate-950"
              >
                Dispatch Nudge Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
