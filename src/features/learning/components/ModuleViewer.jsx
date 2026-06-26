import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mockDb } from '../../../services/mockDb';
import { Button } from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';

export const ModuleViewer = () => {
  const { moduleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    if (moduleId) {
      const mod = mockDb.getModule(moduleId);
      if (mod) {
        setModule(mod);
        const c = mockDb.getCourse(mod.courseId);
        setCourse(c);
        const quizzes = mockDb.getQuizzesByModule(mod.id);
        if (quizzes.length > 0) setQuiz(quizzes[0]);
      }
    }
  }, [moduleId]);

  if (!module || !course) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center text-slate-400">
        Loading module content...
      </div>
    );
  }

  const allModules = mockDb.getModulesByCourse(course.id);
  const currentIdx = allModules.findIndex((m) => m.id === module.id);
  const prevModule = currentIdx > 0 ? allModules[currentIdx - 1] : null;
  const nextModule = currentIdx < allModules.length - 1 ? allModules[currentIdx + 1] : null;

  const typeIcon = {
    video: 'M15 10l4.553-2.276A1 1 0 0121 10.618V13.382a1 1 0 01-1.447.894L15 12M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    pdf: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    quiz: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  };

  const handleMarkComplete = () => {
    if (nextModule && !nextModule.unlocked) {
      mockDb.updateModule(nextModule.id, { unlocked: true });
      setModule({ ...module });
    }
  };

  const isLecturer = user?.role === 'LECTURER';

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white">
      {/* Top Nav */}
      <nav className="border-b border-slate-800 bg-[#0d1224]/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>{course.code} · {course.title}</span>
            </button>
            <div className="flex items-center space-x-2">
              <Badge variant="info">Module {currentIdx + 1}/{allModules.length}</Badge>
              <Badge variant={module.unlocked ? 'success' : 'warning'}>
                {module.unlocked ? 'Unlocked' : 'Locked'}
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
        {/* Module Header */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={typeIcon[module.type] || typeIcon.video} />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{module.title}</h1>
              <p className="text-xs text-slate-400 capitalize">{module.type} Content</p>
            </div>
          </div>
        </div>

        {/* Module Content */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6">
          {module.type === 'video' && (
            <div>
              <div className="w-full aspect-video bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-400">Video lecture player</p>
                  <p className="text-[10px] text-slate-500">In production, video streams from cloud storage here</p>
                </div>
              </div>
              <div className="mt-6 prose prose-invert prose-sm max-w-none">
                <h3 className="text-sm font-bold text-white mb-3">Lecture Notes</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{module.content}</p>
              </div>
            </div>
          )}

          {module.type === 'pdf' && (
            <div>
              <div className="w-full h-96 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-3">
                  <svg className="w-12 h-12 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-xs text-slate-400">PDF document viewer</p>
                  <p className="text-[10px] text-slate-500">In production, PDF renders inline here</p>
                </div>
              </div>
              <div className="mt-6 prose prose-invert prose-sm max-w-none">
                <h3 className="text-sm font-bold text-white mb-3">Document Summary</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{module.content}</p>
              </div>
            </div>
          )}

          {module.type === 'quiz' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">{module.content}</p>
              {quiz ? (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-white">{quiz.title}</h4>
                    <p className="text-[10px] text-slate-400">{quiz.questions.length} questions · {quiz.timeLimit} minute time limit</p>
                  </div>
                  {!isLecturer && (
                    <Button onClick={() => navigate(`/student/quiz/${quiz.id}`)}>
                      Start Quiz
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs text-slate-400">
                  No quiz has been created for this module yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          {prevModule ? (
            <Button variant="ghost" onClick={() => navigate(`/student/module/${prevModule.id}`)}>
              <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous Module
            </Button>
          ) : <div />}

          {!isLecturer && nextModule && !nextModule.unlocked && module.unlocked && (
            <Button variant="success" onClick={handleMarkComplete}>
              Mark Complete & Unlock Next
            </Button>
          )}

          {nextModule?.unlocked && (
            <Button onClick={() => navigate(`/student/module/${nextModule.id}`)}>
              Next Module
              <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
