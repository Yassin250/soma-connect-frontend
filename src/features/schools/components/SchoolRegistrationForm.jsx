import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5050/api/admin';

export const SchoolRegistrationForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registeredDomain, setRegisteredDomain] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/schools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Registration failed');
      const newSchool = await response.json();
      const schoolData = newSchool.data || newSchool;
      setRegisteredDomain(schoolData.domain);
      setIsSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] text-white flex items-center justify-center p-6 antialiased">
        <div className="relative w-full max-w-xl bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Registration Submitted Successfully!</h2>
            <p className="text-sm text-slate-400">
              Your school has been placed in the review queue. We will run a brief KYC verification check on your domain.
            </p>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-xl text-left border border-slate-700/50 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Review Status:</span>
              <span className="text-amber-400 font-bold uppercase tracking-wider">Pending Review</span>
            </div>
            <div className="flex justify-between text-xs border-t border-slate-700/50 pt-2">
              <span className="text-slate-400">Auto-created Admin:</span>
              <span className="text-blue-400 font-mono">admin@{registeredDomain}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            *In the live pilot version, you will receive an activation email once approved. For this demo, click below to review and approve the school.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/super-admin/approvals')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all"
            >
              Simulate Super-Admin Approval Panel
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white flex flex-col md:flex-row antialiased">
      {/* Branding panel */}
      <div className="md:w-5/12 bg-gradient-to-br from-blue-700 to-indigo-900 p-8 flex flex-col justify-between relative overflow-hidden select-none">
        <div className="absolute top-[20%] left-[-10%] w-[130%] h-32 bg-white/5 rounded-full rotate-[-12deg] pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] w-48 h-48 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center space-x-2 relative z-10">
          <svg className="w-5 h-7 fill-current opacity-95 text-white" viewBox="0 0 24 24">
            <path d="M4 2h3v12a5 5 0 0 0 10 0V2h3v12a8 8 0 0 1-16 0V2z" />
          </svg>
          <span className="text-xl font-black tracking-wider uppercase text-white">SomaConnect</span>
        </div>

        <div className="my-auto py-12 relative z-10 space-y-4">
          <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] uppercase font-bold tracking-widest text-blue-200">
            For Schools & TVETs
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Bring your institution into the digital ecosystem.
          </h1>
          <p className="text-sm text-blue-100/80 leading-relaxed max-w-sm">
            Access secure module uploads, AI plagiarism checking, student portfolio credentials, and MTN/RDB employment integration.
          </p>
        </div>

        <div className="text-[10px] text-blue-200/60 relative z-10">
          © 2026 SomaConnect. Supported by RDB & ICT Chamber.
        </div>
      </div>

      {/* Form panel */}
      <div className="md:w-7/12 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-[#0c1226]">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Register Your School</h2>
            <p className="text-xs text-slate-400">Launch a dedicated instance of SomaConnect for your educators and students.</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">School Name</label>
                <input
                  {...register('name', { required: 'School name is required' })}
                  type="text"
                  placeholder="e.g. University of Rwanda"
                  className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                />
                {errors.name && <p className="text-[9px] text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Domain</label>
                <input
                  {...register('domain', {
                    required: 'Email domain is required',
                    pattern: {
                      value: /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Provide a valid domain (e.g. ur.ac.rw)'
                    }
                  })}
                  type="text"
                  placeholder="e.g. ur.ac.rw"
                  className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                />
                {errors.domain && <p className="text-[9px] text-red-500">{errors.domain.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Province / District</label>
                <input
                  {...register('location', { required: 'Location is required' })}
                  type="text"
                  placeholder="e.g. Kigali / Gasabo"
                  className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                />
                {errors.location && <p className="text-[9px] text-red-500">{errors.location.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">School Type</label>
                <select
                  {...register('type', { required: 'Type is required' })}
                  className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-slate-300"
                >
                  <option value="university">University / Higher Learning</option>
                  <option value="tvet">TVET Institute</option>
                  <option value="secondary">Secondary School</option>
                </select>
                {errors.type && <p className="text-[9px] text-red-500">{errors.type.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Primary Contact Name</label>
                <input
                  {...register('contactName', { required: 'Contact name is required' })}
                  type="text"
                  placeholder="e.g. Jean Bosco"
                  className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                />
                {errors.contactName && <p className="text-[9px] text-red-500">{errors.contactName.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contact Phone</label>
                <input
                  {...register('contactPhone', { required: 'Contact phone is required' })}
                  type="text"
                  placeholder="e.g. +250 788 123 456"
                  className="w-full bg-[#141c33] border border-slate-800 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                />
                {errors.contactPhone && <p className="text-[9px] text-red-500">{errors.contactPhone.message}</p>}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-blue-500/10 transition-all"
              >
                Submit Registration Profile
              </button>
            </div>
          </form>

          <div className="text-center pt-2 text-slate-500 text-[11px]">
            Already approved? <a href="/login" className="text-blue-400 hover:underline">Log in here</a>
          </div>
        </div>
      </div>
    </div>
  );
};
