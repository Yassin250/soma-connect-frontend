import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLockup } from '../../../components/shared/Brand';
import { ButtonLoader } from '../../../components/shared/ButtonLoader';
import { authService } from '../../../services/api';

const inputClass =
  'w-full rounded-2xl bg-[#f3f4f6] py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none border border-transparent transition-all focus:bg-white focus:ring-4 focus:ring-[#32292F]/5 focus:border-[#32292F]/20';
const labelClass = 'text-[13px] font-semibold text-gray-700';

const Field = ({ label, icon, children }) => (
  <div className="space-y-1.5">
    <label className={labelClass}>{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">{icon}</svg>
      </span>
      {children}
    </div>
  </div>
);

export const LearnerRegisterPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '';

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const year = new Date().getFullYear();

  const loginTo = next ? `/login?next=${encodeURIComponent(next)}` : '/login';
  const goToLogin = () => navigate(loginTo, { replace: true, state: { justRegistered: true } });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const pwMatch = form.confirmPassword.length === 0 ? null : form.password === form.confirmPassword;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!pwMatch) { setError('Passwords do not match.'); return; }
    setSubmitting(true);
    try {
      await authService.registerLearner({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      // Auto-redirect to login after successful registration
      setTimeout(() => goToLogin(), 1500);
    } catch (err) {
      setError(err.message || 'Could not create your account');
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white antialiased overflow-hidden">
      {/* Left brand panel */}
      <div className="hidden md:flex md:w-[52%] relative flex-col justify-between bg-gradient-to-br from-[#20242e] via-[#181b22] to-[#101217] text-white p-12 lg:p-20 overflow-hidden [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)] z-10">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#99E1D9]/20 blur-[100px]" />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-[#39435a]/40 blur-[100px]" />
        <div className="absolute top-[16%] right-[7%] w-44 h-44 rounded-[2.5rem] border border-white/10 rotate-[18deg]" />
        <div className="absolute top-[23%] right-[3%] w-11 h-11 rounded-2xl bg-[#99E1D9]/25 rotate-12" />
        <div className="relative z-10">
          <Link to="/" aria-label="Soma Connect home"><BrandLockup /></Link>
        </div>
        <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="relative z-10 max-w-xl space-y-6">
          <h1 className="text-[2.75rem] xl:text-[3.5rem] font-semibold tracking-tight leading-[1.12]">Start learning today.</h1>
          <p className="text-white/60 text-base lg:text-lg leading-relaxed max-w-md">
            Create your free account, enroll in industry-built programs, and prove your skills with AI-verified work.
          </p>
        </motion.div>
        <div className="relative z-10">
          <p className="text-xs text-white/35">© {year} Soma Connect Platform. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel — centering lives on an inner min-h-full wrapper so
          tall content scrolls naturally instead of clipping at the top (the
          classic justify-center + overflow trap) or leaving dead space below. */}
      <div className="w-full md:w-[48%] bg-white overflow-y-auto">
        <div className="min-h-full flex flex-col justify-center p-8 sm:p-12 lg:px-24">
        <div className="md:hidden mb-10">
          <Link to="/" aria-label="Soma Connect home"><BrandLockup dark /></Link>
        </div>

        <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="w-full max-w-md mx-auto">
          <div className="space-y-1.5 mb-8">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.18em]">Create your account</h3>
            <h1 className="text-[28px] leading-tight font-semibold text-[#32292F] tracking-tight">Join as a learner</h1>
            <p className="text-sm text-gray-500">Free to start — enroll in any program in minutes.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <Field label="Full name" icon={<path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />}>
              <input type="text" required value={form.name} onChange={set('name')} placeholder="e.g. Ganza Kenny" className={inputClass} />
            </Field>

            <Field label="Email address" icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}>
              <input type="email" required value={form.email} onChange={set('email')} placeholder="hello@email.com" className={inputClass} />
            </Field>

            <Field label="Password" icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}>
              <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={set('password')} placeholder="At least 8 characters" className={`${inputClass} pr-11`} />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPw ? 'Hide password' : 'Show password'}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  {showPw
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L3 3m6.88 6.88L21 21" />
                    : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}
                </svg>
              </button>
            </Field>

            <Field label="Confirm password" icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}>
              <input
                type={showPw ? 'text' : 'password'} required value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password"
                className={`${inputClass} ${pwMatch === false ? 'border-red-300 focus:border-red-300 focus:ring-red-100' : pwMatch === true ? 'border-emerald-300 focus:border-emerald-300 focus:ring-emerald-100' : ''}`}
              />
            </Field>

            {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}

            <button
              type="submit" disabled={submitting} aria-busy={submitting}
              className={`w-full py-3.5 bg-[#99E1D9] hover:bg-[#b0ebe4] text-[#32292F] text-sm font-bold rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed ${submitting ? 'opacity-95' : ''}`}
            >
              <span className="inline-flex items-center justify-center gap-2.5 min-h-[20px]">
                {submitting && <ButtonLoader size={18} className="text-[#32292F]" />}
                <span>{submitting ? 'Creating account…' : 'Create free account'}</span>
              </span>
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="text-[#32292F] hover:underline font-bold">Sign in</Link>
            </p>
            <p className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
              Registering an institution?{' '}
              <Link to="/register/institution" className="text-[#32292F]/70 hover:text-[#32292F] hover:underline font-semibold">Register a school</Link>
            </p>
          </form>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LearnerRegisterPage;
