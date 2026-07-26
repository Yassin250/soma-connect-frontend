import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const API_BASE_URL = 'http://localhost:5050/api/school';

export const StudentJoinPortal = () => {
  const { schoolSlug } = useParams();
  const navigate = useNavigate();
  
  const [school, setSchool] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const emailInput = watch('email');

  const loadSchool = useCallback(async () => {
    if (!schoolSlug) return;
    try {
      const response = await fetch(`${API_BASE_URL}/slug/${schoolSlug}`);
      if (response.ok) {
        const data = await response.json();
        setSchool(data.data || data);
      } else {
        setErrorMsg('Invalid join link. Please verify with your registrar or rector.');
      }
    } catch (err) {
      setErrorMsg('Invalid join link. Please verify with your registrar or rector.');
    }
  }, [schoolSlug]);

  useEffect(() => {
    loadSchool();
  }, [loadSchool]);

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');

    // double check email domain suffix match
    const emailDomain = data.email.substring(data.email.lastIndexOf('@') + 1);
    if (emailDomain.toLowerCase() !== school?.domain?.toLowerCase()) {
      setErrorMsg(`Institutional verification failed: Email must end with @${school?.domain} to match ${school?.name}'s registry.`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${school.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          role: 'STUDENT',
        }),
      });
      if (!response.ok) throw new Error('Enrollment failed');
      setSuccessMsg('Account verified and enrolled successfully! You can now log into SomaConnect.');
    } catch (err) {
      setErrorMsg(err.message || 'Enrollment failed.');
    }
  };

  // Helper check to show warning alert on the fly
  const showDomainWarning = emailInput && 
    emailInput.includes('@') && 
    !emailInput.toLowerCase().endsWith(`@${school?.domain.toLowerCase()}`);

  if (errorMsg && !school) {
    return (
      <div className="min-h-screen bg-[#16181f] text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-xl space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 font-bold text-lg">✕</div>
          <h2 className="text-xl font-bold">Registry Verification Error</h2>
          <p className="text-xs text-slate-400">{errorMsg}</p>
          <button onClick={() => navigate('/login')} className="px-4 py-2 bg-slate-800 text-xs font-semibold rounded hover:bg-slate-700 transition-all">Back to Login</button>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-[#16181f] flex items-center justify-center text-slate-400">
        Locating school registry records...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#16181f] text-white flex items-center justify-center p-6 antialiased">
      <div className="relative w-full max-w-md bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        
        {/* Header decoration */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto text-accent font-bold text-lg uppercase">
            {school.name.substring(0, 2)}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Student Self-Enrollment</h2>
          <p className="text-xs text-slate-400">Join the verified workspace of <strong className="text-slate-200">{school.name}</strong></p>
        </div>

        {successMsg ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto text-green-400 text-lg">✓</div>
            <p className="text-xs text-slate-300 leading-relaxed">{successMsg}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover text-xs font-bold rounded-lg text-[#1b1e26] shadow"
            >
              Sign In to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-medium leading-relaxed">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                placeholder="e.g. Ganza Kenny"
                className="w-full bg-[#20242e] border border-slate-850 rounded-lg text-xs px-3 py-2.5 text-white focus:outline-none focus:border-accent"
              />
              {errors.name && <p className="text-[9px] text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Institutional Email</label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Provide a valid email address'
                  }
                })}
                type="email"
                placeholder={`e.g. g.kenny@${school.domain}`}
                className="w-full bg-[#20242e] border border-slate-850 rounded-lg text-xs px-3 py-2.5 text-white focus:outline-none focus:border-accent"
              />
              {errors.email && <p className="text-[9px] text-red-400">{errors.email.message}</p>}
            </div>

            {/* Warning alert shown dynamically if typing wrong domain */}
            {showDomainWarning && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs rounded-lg leading-relaxed">
                ⚠️ **Domain Mismatch:** SomaConnect requires student emails to end with **@{school.domain}** to match this school's directory.
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <input
                {...register('password', { 
                  required: 'Password is required', 
                  minLength: { value: 6, message: 'Password must have at least 6 characters' }
                })}
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#20242e] border border-slate-850 rounded-lg text-xs px-3 py-2.5 text-white focus:outline-none focus:border-accent"
              />
              {errors.password && <p className="text-[9px] text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-accent hover:bg-accent-hover text-xs font-semibold rounded-lg shadow-md transition-all text-[#1b1e26]"
            >
              Verify & Complete Registration
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-slate-500 text-[10px]">
          By enrolling, you agree to SomaConnect's academic integrity policies.
        </div>
      </div>
    </div>
  );
};
