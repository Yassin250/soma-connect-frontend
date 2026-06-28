import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/shared/Button';
import { Input } from '../../../components/shared/Input';
import { Badge } from '../../../components/shared/Badge';

const API_BASE_URL = 'http://localhost:5050/api/assignment';

export const AssignmentSubmit = () => {
  const { assignmentId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [course, setCourse] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newSubmission, setNewSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    if (!assignmentId || !user) return;
    
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch assignment
        const assignmentResponse = await fetch(`${API_BASE_URL}/${assignmentId}`, {
            headers: getHeaders(),
          });
        if (assignmentResponse.ok) {
          const assignmentData = await assignmentResponse.json();
          setAssignment(assignmentData.data || assignmentData);
          
          // Fetch course
          const courseResponse = await fetch(`${API_BASE_URL}/course/${assignmentData.data?.courseId || assignmentData.courseId}`, {
            headers: getHeaders(),
          });
          if (courseResponse.ok) {
            const courseData = await courseResponse.json();
            setCourse(courseData.data || courseData);
          }
        }

        // Fetch existing submission
        const submissionsResponse = await fetch(`${API_BASE_URL}/submissions/student/${user.id}`, {
          headers: getHeaders(),
        });
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          const submissions = Array.isArray(submissionsData) ? submissionsData : submissionsData.data || [];
          const existing = submissions.find((s) => s.assignmentId === assignmentId);
          if (existing) setExistingSubmission(existing);
        }
      } catch (err) {
        console.error('Error loading assignment:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [assignmentId, user, getHeaders]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center text-slate-400">
        Loading assignment...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!assignment || !course) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center text-slate-400">
        Assignment not found.
      </div>
    );
  }

  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && !existingSubmission;
  const rubric = assignment.rubric || { quality: 40, logic: 40, documentation: 20 };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          assignmentId: assignment.id,
          studentId: user.id,
          content: code
        }),
      });
      if (!response.ok) throw new Error('Submission failed');
      const sub = await response.json();
      setNewSubmission(sub.data || sub);
      setSubmitted(true);
    } catch (err) {
      alert(err.message);
    }
  };

  if (existingSubmission && !submitted) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Assignment Already Submitted</h2>
            <p className="text-xs text-slate-400">{course.code} · {assignment.title}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <Badge variant={existingSubmission.status === 'graded' ? 'success' : existingSubmission.status === 'flagged' ? 'danger' : 'warning'}>
                {existingSubmission.status}
              </Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Similarity Score</span>
              <span className={existingSubmission.similarity > 30 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                {existingSubmission.similarity}%
              </span>
            </div>
            {existingSubmission.grade && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Grade</span>
                  <span className="text-emerald-400 font-bold text-lg">{existingSubmission.grade.total}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  <div className="text-center p-2 bg-slate-900 rounded-lg">
                    <p className="text-[9px] text-slate-500 uppercase">Quality</p>
                    <p className="font-mono font-bold text-white">{existingSubmission.grade.quality}%</p>
                  </div>
                  <div className="text-center p-2 bg-slate-900 rounded-lg">
                    <p className="text-[9px] text-slate-500 uppercase">Logic</p>
                    <p className="font-mono font-bold text-white">{existingSubmission.grade.logic}%</p>
                  </div>
                  <div className="text-center p-2 bg-slate-900 rounded-lg">
                    <p className="text-[9px] text-slate-500 uppercase">Docs</p>
                    <p className="font-mono font-bold text-white">{existingSubmission.grade.documentation}%</p>
                  </div>
                </div>
              </>
            )}
            {existingSubmission.feedback && (
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Lecturer Feedback</p>
                <p className="text-xs text-slate-300 leading-relaxed">{existingSubmission.feedback}</p>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
              Submitted: {new Date(existingSubmission.submittedAt).toLocaleString()}
            </div>
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate(-1)}>Back to Assignments</Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && newSubmission) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 text-2xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Submission Received!</h2>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Assignment</span>
              <span className="text-white">{assignment.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Similarity Score</span>
              <span className={newSubmission.similarity > 30 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {newSubmission.similarity}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <Badge variant="warning">Pending Review</Badge>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">Your assignment will be reviewed and graded by your lecturer. Check back for results.</p>
          <Button onClick={() => navigate(-1)}>Back to Assignments</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white">
      <nav className="border-b border-slate-800 bg-[#0d1224]/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>{course.code} · Assignments</span>
            </button>
            <div className="flex items-center space-x-2">
              <Badge variant="info">{course.code}</Badge>
              {isOverdue && <Badge variant="danger">Overdue</Badge>}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-xl font-bold">{assignment.title}</h1>
          <p className="text-xs text-slate-400 leading-relaxed">{assignment.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl text-center">
            <p className="text-[9px] text-slate-400 uppercase font-bold">Max Score</p>
            <p className="text-xl font-black text-white mt-1">{assignment.maxScore}</p>
          </div>
          <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl text-center">
            <p className="text-[9px] text-slate-400 uppercase font-bold">Due Date</p>
            <p className="text-sm font-bold text-white mt-1">
              {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' }) : 'No deadline'}
            </p>
          </div>
          <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl text-center">
            <p className="text-[9px] text-slate-400 uppercase font-bold">Grading Rubric</p>
            <div className="text-[10px] text-slate-300 mt-1 space-y-0.5">
              <p>Quality {rubric.quality}%</p>
              <p>Logic {rubric.logic}%</p>
              <p>Docs {rubric.documentation}%</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Your Submission (Code or Text)
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={16}
              required
              placeholder="Paste your code or assignment text here..."
              className="w-full bg-[#0c1226] border border-slate-800 rounded-xl text-xs p-4 text-white placeholder-slate-500 resize-none font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-[10px] text-amber-500 font-semibold">
              ⚠️ All submissions are checked for plagiarism via AI similarity scanning.
            </p>
            <Button type="submit" disabled={!code.trim() || isOverdue}>
              Submit Assignment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
