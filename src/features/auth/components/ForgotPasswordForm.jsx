import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../../services/api';
import { ButtonLoader } from '../../../components/shared/ButtonLoader';

// Step copy lives here so the page (left panel) and form (right panel)
// can both react to the same source of truth.
//
// Backend reset is token-based (POST /admin/auth/forgot-password generates a
// reset token; POST /admin/auth/reset-password consumes it), so the flow is two
// steps: request the token, then submit token + new password.
export const FORGOT_PASSWORD_STEPS = {
  email: {
    eyebrow: 'Account recovery',
    heading: 'Forgot your password?',
    sub: "Enter the email on your account and we'll send you a secure reset link.",
  },
  reset: {
    eyebrow: 'Final step',
    heading: 'Set a new password',
    sub: 'Paste the reset token from your email, then choose a new password.',
  },
};

export const FORGOT_PASSWORD_STEP_ORDER = ['email', 'reset'];

const slideVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

// Same field recipe as LoginForm: filled rounded-2xl input with a leading icon.
const inputClass =
  'w-full rounded-2xl bg-[#f3f4f6] py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none border border-transparent transition-all focus:bg-white focus:ring-4 focus:ring-[#1b1e26]/5 focus:border-[#1b1e26]/20';
const inputWithEyeClass = `${inputClass.replace('pr-4', 'pr-11')}`;
const labelClass = 'text-[13px] font-semibold text-gray-700';
const iconWrapClass = 'absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none';
const primaryBtnClass =
  'w-full py-3.5 bg-[#d0f24a] hover:bg-[#c4e83a] text-[#1b1e26] text-sm font-bold rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70';

/**
 * @param {(step: string) => void} onStepChange  Notifies the parent page (left panel copy).
 * @param {string} [initialStep]                 'email' (default) or 'reset' for email-link entry.
 * @param {string} [initialToken]                Prefills the token field (from a ?token= deep link).
 */
export const ForgotPasswordForm = ({ onStepChange, initialStep = 'email', initialToken = '' }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(initialStep);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [info, setInfo] = useState('');

  // Step 1 — email
  const [email, setEmail] = useState('');

  // Step 2 — token + new password
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  // ── Step 1: request the reset token ──────────────────────────
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await authService.requestPasswordReset(email.trim());
      setInfo('If an account exists for that email, a reset link is on its way. Paste the token below to continue.');
      setStep('reset');
    } catch (err) {
      setErrorMessage(err?.message || 'Could not start password reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: submit token + new password ──────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!token.trim()) {
      setErrorMessage('Enter the reset token from your email');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.resetPassword({
        token: token.trim(),
        newPassword,
        confirmPassword,
      });
      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (err) {
      setErrorMessage(err?.message || 'Could not reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepIndex = FORGOT_PASSWORD_STEP_ORDER.indexOf(step);

  const EyeButton = ({ shown, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
      aria-label={shown ? 'Hide password' : 'Show password'}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {shown ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        ) : (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </>
        )}
      </svg>
    </button>
  );

  const BackLink = ({ onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-medium text-gray-400 hover:text-gray-700 flex items-center justify-center gap-2 mx-auto transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {children}
    </button>
  );

  return (
    <div className="w-full font-sans">
      {/* Mobile-only step tracker (left panel is hidden below md) */}
      <div className="flex md:hidden items-center justify-center gap-2 mb-8">
        {FORGOT_PASSWORD_STEP_ORDER.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === stepIndex ? 'w-8 bg-[#1b1e26]' : i < stepIndex ? 'w-4 bg-[#d0f24a]' : 'w-4 bg-gray-200'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Email ── */}
        {step === 'email' && (
          <motion.form
            key="email"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            onSubmit={handleRequestReset}
            className="space-y-5"
          >
            <div className="space-y-1.5 mb-8">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.18em]">
                Account recovery
              </h3>
              <h1 className="text-[28px] leading-tight font-semibold text-[#1b1e26] tracking-tight">
                Forgot password
              </h1>
              <p className="text-sm text-gray-500">Enter your email and we'll send a reset link.</p>
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="forgot-email" className={labelClass}>Email address</label>
              <div className="relative">
                <span className={iconWrapClass}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@company.com"
                  required
                  autoFocus
                  className={inputClass}
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                {errorMessage}
              </p>
            )}

            <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className={primaryBtnClass}>
              <span className="inline-flex items-center justify-center gap-2.5 min-h-[20px]">
                {isSubmitting && <ButtonLoader size={18} className="text-[#1b1e26]" />}
                <span>{isSubmitting ? 'Sending…' : 'Send reset link'}</span>
              </span>
            </button>

            <div className="border-t border-gray-100 pt-6 text-center space-y-4">
              <button
                type="button"
                onClick={() => { setErrorMessage(''); setStep('reset'); }}
                className="text-sm font-semibold text-[#1b1e26] hover:underline block mx-auto"
              >
                I already have a reset token
              </button>
              <BackLink onClick={() => navigate('/login')}>Back to login</BackLink>
            </div>
          </motion.form>
        )}

        {/* ── STEP 2: Token + new password ── */}
        {step === 'reset' && (
          <motion.form
            key="reset"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            onSubmit={handleResetPassword}
            className="space-y-5"
          >
            <div className="space-y-1.5 mb-8">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.18em]">
                Final step
              </h3>
              <h1 className="text-[28px] leading-tight font-semibold text-[#1b1e26] tracking-tight">
                Set new password
              </h1>
              <p className="text-sm text-gray-500">Paste your reset token and choose a strong password.</p>
            </div>

            {info && (
              <p className="text-xs text-[#1b1e26] bg-[#d0f24a]/15 border border-[#d0f24a]/50 rounded-xl px-3.5 py-2.5">
                {info}
              </p>
            )}

            {/* Reset token */}
            <div className="space-y-1.5">
              <label htmlFor="reset-token" className={labelClass}>Reset token</label>
              <div className="relative">
                <span className={iconWrapClass}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </span>
                <input
                  id="reset-token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token from your email"
                  required
                  autoFocus={!initialToken}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <label htmlFor="reset-new-password" className={labelClass}>New password</label>
              <div className="relative">
                <span className={iconWrapClass}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="reset-new-password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={inputWithEyeClass}
                />
                <EyeButton shown={showNew} onToggle={() => setShowNew(!showNew)} />
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label htmlFor="reset-confirm-password" className={labelClass}>Confirm new password</label>
              <div className="relative">
                <span className={iconWrapClass}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <input
                  id="reset-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={inputWithEyeClass}
                />
                <EyeButton shown={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                {errorMessage}
              </p>
            )}

            <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className={primaryBtnClass}>
              <span className="inline-flex items-center justify-center gap-2.5 min-h-[20px]">
                {isSubmitting && <ButtonLoader size={18} className="text-[#1b1e26]" />}
                <span>{isSubmitting ? 'Resetting…' : 'Reset password'}</span>
              </span>
            </button>

            <div className="border-t border-gray-100 pt-6 text-center">
              <BackLink onClick={() => { setErrorMessage(''); setStep('email'); }}>Start over</BackLink>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPasswordForm;
