import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { lecturerCourseService, assignmentService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

const LecturerSubmissionsPage = () => {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradingId, setGradingId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

  useEffect(() => {
    lecturerCourseService.list()
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const assignmentItems = courses.flatMap((c) =>
    (c.modules || []).flatMap((m) =>
      (m.items || []).filter((i) => i.itemType === 'ASSIGNMENT' || i.itemType === 'QUIZ').map((i) => ({
        ...i, courseTitle: c.title, courseId: c.id,
      }))
    )
  );

  const loadSubmissions = async (item) => {
    setSelectedItem(item);
    setSubmissionsLoading(true);
    try {
      const data = await assignmentService.listSubmissions(item.courseId, item.id);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch { setSubmissions([]); }
    finally { setSubmissionsLoading(false); }
  };

  const handleGrade = async (submissionId) => {
    if (!gradeForm.score) return;
    try {
      await assignmentService.grade(selectedItem.courseId, selectedItem.id, submissionId, {
        score: parseInt(gradeForm.score),
        feedback: gradeForm.feedback || null,
      });
      toast.success('Submission graded');
      setGradingId(null);
      setGradeForm({ score: '', feedback: '' });
      loadSubmissions(selectedItem);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1b1e26]">Submissions & Grading</h1>
        <p className="text-sm text-gray-400 mt-1">Review and grade student submissions for your courses.</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : assignmentItems.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <p className="text-sm text-gray-500">No assignments or quizzes found in your courses.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {assignmentItems.map((item) => (
            <button
              key={item.id}
              onClick={() => loadSubmissions(item)}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${selectedItem?.id === item.id ? 'border-accent bg-accent/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1b1e26] truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 truncate">{item.courseTitle} · {item.itemType}</p>
                </div>
                <span className={`ml-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${item.itemType === 'ASSIGNMENT' ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>{item.itemType}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-[#1b1e26] mb-1">{selectedItem.courseTitle} — {selectedItem.title}</h2>
          <p className="text-xs text-gray-400 mb-4">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>

          {submissionsLoading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {submissions.map((s) => (
                <div key={s.id} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-[#1b1e26]">{s.learnerName}</p>
                      <p className="text-[11px] text-gray-400">Submitted {new Date(s.submittedAt).toLocaleString()}</p>
                    </div>
                    {s.score != null ? (
                      <span className={`text-lg font-black ${s.score >= 50 ? 'text-green-600' : 'text-red-500'}`}>{s.score}/100</span>
                    ) : (
                      <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full">Ungraded</span>
                    )}
                  </div>
                  {s.content && (
                    <div className="mb-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">{s.content}</div>
                  )}
                  {s.fileUrl && (
                    <a href={s.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline mb-3">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {s.fileName || 'Download attachment'}
                    </a>
                  )}
                  {s.feedback && s.score != null && (
                    <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 italic">"{s.feedback}"</div>
                  )}
                  {gradingId === s.id ? (
                    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Score (0–100)</label>
                        <input type="number" min="0" max="100" value={gradeForm.score} onChange={(e) => setGradeForm((p) => ({ ...p, score: e.target.value }))} className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#1b1e26]/30" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Feedback</label>
                        <textarea value={gradeForm.feedback} onChange={(e) => setGradeForm((p) => ({ ...p, feedback: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#1b1e26]/30 resize-none" placeholder="Optional feedback…" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleGrade(s.id)} disabled={!gradeForm.score} className="px-4 py-1.5 rounded-lg bg-[#1b1e26] text-white text-xs font-semibold hover:bg-black disabled:opacity-50">Submit grade</button>
                        <button onClick={() => { setGradingId(null); setGradeForm({ score: '', feedback: '' }); }} className="px-4 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:text-[#1b1e26]">Cancel</button>
                      </div>
                    </div>
                  ) : s.score == null && (
                    <button onClick={() => { setGradingId(s.id); setGradeForm({ score: '', feedback: '' }); }} className="mt-2 px-4 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors">Grade</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LecturerSubmissionsPage;
