import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mockDb } from '../../../services/mockDb';
import { Button } from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';

export const QuizEngine = () => {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (quizId) {
      const q = mockDb.getQuiz(quizId);
      if (q) {
        setQuiz(q);
        setTimeLeft(q.timeLimit * 60);
        const c = mockDb.getCourse(q.courseId);
        setCourse(c);
        const existingAttempts = mockDb.getQuizAttemptsByStudent(user.id);
        const existing = existingAttempts.find((a) => a.quizId === quizId);
        if (existing) {
          setResult(existing);
          setCompleted(true);
        }
      }
    }
  }, [quizId, user]);

  useEffect(() => {
    if (!started || completed) return;
    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [started, completed, timeLeft]);

  if (!quiz || !course) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center text-slate-400">
        Loading quiz...
      </div>
    );
  }

  const question = quiz.questions[currentQ];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSubmitQuiz = () => {
    try {
      const attempt = mockDb.submitQuizAttempt({
        quizId: quiz.id,
        studentId: user.id,
        answers
      });
      setResult(attempt);
      setCompleted(true);
    } catch (err) {
      alert(err.message);
    }
  };

  if (completed && result) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
            result.score >= 70 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'
          }`}>
            <span className={`text-3xl font-black ${result.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {result.score}%
            </span>
          </div>
          <h2 className="text-xl font-bold">{result.score >= 70 ? 'Quiz Passed!' : 'Review Recommended'}</h2>
          <p className="text-xs text-slate-400">
            {course.code} · {quiz.title}
          </p>

          <div className="space-y-3 text-left bg-slate-950 p-4 rounded-xl border border-slate-800">
            {quiz.questions.map((q, idx) => {
              const userAnswer = result.answers[q.id];
              const isCorrect = userAnswer === q.correctIndex;
              return (
                <div key={q.id} className="space-y-1 pb-3 border-b border-slate-800 last:border-0 last:pb-0">
                  <p className="text-xs text-slate-300 font-semibold">{idx + 1}. {q.prompt}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Your answer: {q.options[userAnswer] ?? 'Not answered'}
                    </span>
                    {!isCorrect && (
                      <span className="text-[10px] text-emerald-400">
                        Correct: {q.options[q.correctIndex]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button onClick={() => navigate(-1)}>Back to Course</Button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">{quiz.title}</h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <p className="text-slate-400">Questions</p>
              <p className="text-xl font-bold text-white">{quiz.questions.length}</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <p className="text-slate-400">Time Limit</p>
              <p className="text-xl font-bold text-white">{quiz.timeLimit} min</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">Once started, the timer cannot be paused. Make sure you are ready.</p>
          <Button size="lg" onClick={() => setStarted(true)}>Start Quiz</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white">
      {/* Timer bar */}
      <nav className="border-b border-slate-800 bg-[#0d1224]/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-blue-400 text-[10px] font-bold">{course.code}</span>
              <span className="text-xs text-slate-300 font-semibold">{quiz.title}</span>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${
              timeLeft < 60 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-xs font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">
        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center">
          {quiz.questions.map((q, idx) => (
            <div
              key={q.id}
              className={`w-8 h-1.5 rounded-full cursor-pointer transition-all ${
                idx === currentQ ? 'bg-blue-500' : answers[q.id] != null ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              onClick={() => setCurrentQ(idx)}
            />
          ))}
        </div>

        {/* Question */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Question {currentQ + 1} of {quiz.questions.length}
            </span>
            <h2 className="text-lg font-bold text-white mt-2">{question.prompt}</h2>
          </div>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setAnswers({ ...answers, [question.id]: idx })}
                className={`w-full text-left p-4 border rounded-xl transition-all flex items-center space-x-3 ${
                  answers[question.id] === idx
                    ? 'bg-blue-600/10 border-blue-500/30 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  answers[question.id] === idx
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                    : 'border-slate-600 text-slate-500'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-xs">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>

          {currentQ < quiz.questions.length - 1 ? (
            <Button onClick={() => setCurrentQ(currentQ + 1)}>
              Next
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          ) : (
            <Button variant="success" onClick={handleSubmitQuiz}>
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
