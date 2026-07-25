import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

const QuizQuestionManagerPage = () => {
  const { itemId } = useParams();
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ questionText: '', questionType: 'MULTIPLE_CHOICE', options: '', correctAnswer: '', points: '1' });

  const loadQuestions = () => {
    setLoading(true);
    quizService.getQuestions(itemId).then((data) => {
      setQuestions(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadQuestions(); }, [itemId]);

  const resetForm = () => {
    setForm({ questionText: '', questionType: 'MULTIPLE_CHOICE', options: '', correctAnswer: '', points: '1' });
    setEditing(null);
  };

  const openEdit = (q) => {
    setForm({
      questionText: q.questionText || '',
      questionType: q.questionType || 'MULTIPLE_CHOICE',
      options: q.options || '',
      correctAnswer: q.correctAnswer || '',
      points: String(q.points || 1),
    });
    setEditing(q.id);
  };

  const handleSave = async () => {
    const payload = {
      questionText: form.questionText,
      questionType: form.questionType,
      options: form.questionType === 'MULTIPLE_CHOICE' ? form.options : null,
      correctAnswer: form.correctAnswer,
      points: parseInt(form.points) || 1,
      sortOrder: 0,
    };
    try {
      if (editing) {
        await quizService.updateQuestion(itemId, editing, payload);
        toast.success('Question updated');
      } else {
        await quizService.addQuestion(itemId, payload);
        toast.success('Question added');
      }
      resetForm();
      loadQuestions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (questionId) => {
    try {
      await quizService.deleteQuestion(itemId, questionId);
      toast.success('Question deleted');
      loadQuestions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const label = form.questionType === 'TRUE_FALSE' ? 'True/False' : 'Multiple Choice';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1b1e26]">Quiz Questions</h1>
          <p className="text-sm text-gray-400 mt-1">Add and manage questions for this quiz item.</p>
        </div>
        <Link to="/lecturer/courses" className="text-sm font-semibold text-gray-400 hover:text-[#1b1e26] transition-colors">← Back to courses</Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-bold text-[#1b1e26] mb-4">{editing ? 'Edit question' : 'Add question'}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 block mb-1">Question text</label>
            <input value={form.questionText} onChange={(e) => setForm((p) => ({ ...p, questionText: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1b1e26]/30" placeholder="Enter the question…" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Type</label>
            <select value={form.questionType} onChange={(e) => setForm((p) => ({ ...p, questionType: e.target.value, options: '', correctAnswer: '' }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1b1e26]/30">
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True / False</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Points</label>
            <input type="number" min="1" value={form.points} onChange={(e) => setForm((p) => ({ ...p, points: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1b1e26]/30" />
          </div>
          {form.questionType === 'MULTIPLE_CHOICE' && (
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1">Options (JSON array, e.g. ["Option A","Option B","Option C","Option D"])</label>
              <input value={form.options} onChange={(e) => setForm((p) => ({ ...p, options: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1b1e26]/30 font-mono" placeholder='["Option A","Option B","Option C","Option D"]' />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 block mb-1">Correct answer</label>
            <input value={form.correctAnswer} onChange={(e) => setForm((p) => ({ ...p, correctAnswer: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1b1e26]/30" placeholder={form.questionType === 'TRUE_FALSE' ? 'True or False' : 'Exactly as it appears in the options'} />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={handleSave} disabled={!form.questionText || !form.correctAnswer} className="px-5 py-2 rounded-xl bg-[#1b1e26] text-white text-sm font-semibold hover:bg-black disabled:opacity-50 transition-colors">{editing ? 'Update' : 'Add'} question</button>
          {editing && <button onClick={resetForm} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:text-[#1b1e26]">Cancel</button>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-bold text-[#1b1e26] mb-4">{questions.length} question{questions.length !== 1 ? 's' : ''}</h2>
        {loading ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : questions.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No questions yet.</p>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1b1e26]">{i + 1}. {q.questionText}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span className="font-mono font-semibold text-gray-500">{q.questionType}</span>
                      <span>·</span>
                      <span>{q.points} pt{q.points > 1 ? 's' : ''}</span>
                      {q.correctAnswer && <><span>·</span><span className="text-emerald-600 font-semibold">Answer: {q.correctAnswer}</span></>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => openEdit(q)} className="px-3 py-1 rounded-lg text-xs font-semibold text-gray-400 hover:text-[#1b1e26] hover:bg-gray-100 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(q.id)} className="px-3 py-1 rounded-lg text-xs font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">Delete</button>
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

export default QuizQuestionManagerPage;
