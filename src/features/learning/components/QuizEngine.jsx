import React, { useState, useEffect } from 'react';
import { quizService } from '../../../services/api';

const QuizEngine = ({ courseId, itemId, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    quizService.getQuestions(itemId).then((data) => {
      setQuestions(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [itemId]);

  if (loading) {
    return <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-400">Loading quiz…</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-sm text-gray-400">This quiz has no questions yet.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
        <div className="text-center mb-6">
          <span className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 ${result.passed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {result.passed ? (
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : (
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </span>
          <h3 className="text-lg font-bold text-[#1b1e26]">{result.passed ? 'Quiz passed!' : 'Quiz failed'}</h3>
          <p className="text-sm text-gray-500 mt-1">
            You scored <strong className="text-[#1b1e26]">{result.score}/{result.maxScore}</strong> ({Math.round(result.score / result.maxScore * 100)}%)
            {result.passed ? ' — keep up the good work!' : ' — review the material and try again.'}
          </p>
        </div>
        <div className="space-y-3">
          {result.answers.map((a, i) => (
            <div key={a.questionId} className={`rounded-xl border p-4 ${a.isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
              <p className="text-sm font-semibold text-[#1b1e26] mb-2">{i + 1}. {a.questionText}</p>
              <p className="text-xs text-gray-500">Your answer: <span className={a.isCorrect ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>{a.selectedAnswer}</span></p>
              {!a.isCorrect && <p className="text-xs text-gray-500 mt-0.5">Correct answer: <span className="text-emerald-600 font-semibold">{a.correctAnswer}</span></p>}
            </div>
          ))}
        </div>
        {result.passed && (
          <div className="mt-6 text-center">
            <button onClick={onComplete} className="px-6 py-2.5 rounded-xl bg-accent text-[#1b1e26] text-sm font-bold hover:bg-accent-hover transition-colors">Mark complete and continue</button>
          </div>
        )}
      </div>
    );
  }

  const handleSelect = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const all = questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] || '',
    }));
    setSubmitting(true);
    try {
      const res = await quizService.submitQuiz(courseId, itemId, { answers: all });
      setResult(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = questions.every((q) => answers[q.id]?.trim());

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
      <div className="flex items-center gap-2 mb-6 text-xs text-gray-400">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Answer all questions below. A passing grade is 60%.
      </div>
      <div className="space-y-5">
        {questions.map((q, i) => {
          const options = parseOptions(q.options);
          return (
            <div key={q.id}>
              <p className="text-sm font-semibold text-[#1b1e26] mb-2.5">{i + 1}. {q.questionText}</p>
              <div className="space-y-2">
                {options.map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${answers[q.id] === opt ? 'border-accent bg-accent/10' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name={`q-${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleSelect(q.id, opt)} className="w-4 h-4 accent-[#171717]" />
                    <span className="text-sm text-[#1b1e26]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={handleSubmit} disabled={!allAnswered || submitting} className="px-6 py-2.5 rounded-xl bg-[#171717] text-white text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50">
          {submitting ? 'Submitting…' : 'Submit quiz'}
        </button>
      </div>
    </div>
  );
};

const parseOptions = (raw) => {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return raw.split(',').map((s) => s.trim()).filter(Boolean); }
};

export default QuizEngine;
