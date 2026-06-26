import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../../services/api';

// Step copy lives here so the page (left panel) and form (right panel)
// can both react to the same source of truth.
export const FORGOT_PASSWORD_STEPS = {
  email: {
    eyebrow: 'Account recovery',
    heading: "Forgot something?",
    sub: "No problem — enter the email on your account and we'll send a reset code.",
  },
  otp: {
    eyebrow: 'Step 2 of 3',
    heading: 'Check your inbox',
    sub: 'Enter the 6-digit code we just sent you.',
  },
  newPassword: {
    eyebrow: 'Step 3 of 3',
    heading: 'Last step',
    sub: 'Choose a strong password to get back into your account.',
  },
};

const STEP_ORDER = ['email', 'otp', 'newPassword'];

const slideVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export const ForgotPasswordForm = ({ onStepChange }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');

  // Shared state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // Step 1 — email
  const [email, setEmail] = useState('');

  // Step 2 — OTP
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(60);
  const [otpStatus, setOtpStatus] = useState('idle'); // 'idle' | 'error' | 'success'
  const inputRefs = useRef([]);

  // Step 3 — new password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Let the parent page (left panel) know which step we're on
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  // OTP countdown
  useEffect(() => {
    if (step !== 'otp' || timeLeft === 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // ── Step 1: Request OTP ──────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await authService.requestPasswordReset(email);
      setPendingEmail(email);
      setStep('otp');
      setTimeLeft(60);
      setOtpValues(Array(6).fill(''));
      setOtpStatus('idle');
    } catch (err) {
      setErrorMessage(err?.message || 'Could not send reset code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────
  const executeOtpVerification = async (code) => {
    if (code.length < 6) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setOtpStatus('idle');
    try {
      await authService.verifyPasswordResetOtp(pendingEmail, code);
      setOtpStatus('success');
      setTimeout(() => setStep('newPassword'), 700);
    } catch (err) {
      setOtpStatus('error');
      setErrorMessage(err?.message || 'Invalid or expired code');
      setTimeout(() => {
        setOtpStatus('idle');
        setOtpValues(Array(6).fill(''));    
        inputRefs.current[0]?.focus();
      }, 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    const next = [...otpValues];
    let completed = '';
    if (value.length > 1) {
      value.slice(0, 6).split('').forEach((c, i) => {
        if (index + i < 6) next[index + i] = c;
      });
      setOtpValues(next);
      completed = next.join('');
      inputRefs.current[Math.min(index + value.length, 5)]?.focus();
    } else {
      next[index] = value;
      setOtpValues(next);
      completed = next.join('');
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
    if (completed.length === 6) executeOtpVerification(completed);
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === 'Enter') executeOtpVerification(otpValues.join(''));
  };

  const handleResend = async () => {
    setTimeLeft(60);
    setOtpValues(Array(6).fill(''));
    setOtpStatus('idle');
    setErrorMessage('');
    try {
      await authService.requestPasswordReset(pendingEmail);
    } catch (err) {
      setErrorMessage(err?.message || 'Could not resend code');
    }
    inputRefs.current[0]?.focus();
  };

  const getOtpInputClasses = () => {
    const base =
      'flex-1 min-w-0 aspect-square max-w-[3.2rem] border rounded-xl text-center text-lg sm:text-xl font-bold outline-none transition-all duration-300';
    if (otpStatus === 'error')
      return `${base} border-red-500 bg-red-50 text-red-700 animate-shake shadow-[0_0_10px_rgba(239,68,68,0.2)]`;
    if (otpStatus === 'success')
      return `${base} border-green-500 bg-green-50 text-green-700 shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-105`;
    return `${base} border-gray-200 bg-gray-50/30 text-gray-900 focus:bg-white focus:border-[#1660FF] focus:ring-4 focus:ring-blue-50`;
  };

  // ── Step 3: Set new password ─────────────────────────────────
  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await authService.resetPassword(pendingEmail, newPassword);
      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (err) {
      setErrorMessage(err?.message || 'Could not reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%,60%{transform:translateX(-5px)}
          40%,80%{transform:translateX(5px)}
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      <div className="w-full max-w-[400px] mx-auto font-sans">

        {/* Mobile-only step tracker — the left panel (with its own tracker)
            is hidden below md, so this keeps progress visible on phones. */}
        <div className="flex md:hidden items-center justify-center gap-2 mb-8">
          {STEP_ORDER.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === stepIndex
                  ? 'w-8 bg-[#1660FF]'
                  : i < stepIndex
                  ? 'w-4 bg-[#1660FF]/40'
                  : 'w-4 bg-gray-200'
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
              onSubmit={handleRequestOtp}
              className="space-y-6"
            >
              <div className="space-y-1 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
                  Forgot password
                </h1>
                <p className="text-sm text-gray-500">
                  Enter your email and we'll send a reset code.
                </p>
              </div>

              <div className="relative border-b border-gray-300 py-2 flex items-center">
                <svg className="w-5 h-5 text-gray-400 absolute left-0 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  autoFocus
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none pl-8 pr-4"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#1660FF] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Sending…' : 'Send reset code'}
              </button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-[#1660FF] hover:underline font-medium flex items-center gap-2 mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Back to login
                </button>
              </div>
            </motion.form>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-7 sm:space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#1660FF] uppercase tracking-widest">Password reset</h3>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Check your email</h1>
                <p className="text-sm text-gray-500">Enter the 6-digit code sent to</p>
                <p className="text-sm font-mono font-bold text-gray-900 break-all">{pendingEmail}</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">6-digit code</label>
                <div className="flex gap-1.5 sm:gap-2 justify-between">
                  {otpValues.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      disabled={isSubmitting || otpStatus === 'success'}
                      onChange={(e) => handleOtpChange(i, e)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={getOtpInputClasses()}
                    />
                  ))}
                </div>
              </div>

              {errorMessage && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-center font-medium">{errorMessage}</p>
              )}

              <button
                type="button"
                onClick={() => executeOtpVerification(otpValues.join(''))}
                disabled={isSubmitting || otpValues.join('').length < 6 || otpStatus === 'success'}
                className="w-full py-3.5 bg-[#1660FF] hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-70"
              >
                {isSubmitting ? 'Verifying…' : otpStatus === 'success' ? 'Verified ✓' : 'Verify code'}
              </button>

              <div className="border-t border-gray-100 pt-6 text-center space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Didn't receive the code?</p>
                  {timeLeft > 0 ? (
                    <p className="text-sm font-medium text-gray-400 mt-1">Resend in {timeLeft}s</p>
                  ) : (
                    <button onClick={handleResend} className="text-sm font-semibold text-[#1660FF] hover:underline mt-1">
                      Resend code
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-2 mx-auto transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Change email
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: New password ── */}
          {step === 'newPassword' && (
            <motion.form
              key="newPassword"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              onSubmit={handleSetPassword}
              className="space-y-6"
            >
              <div className="space-y-1 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">Set new password</h1>
                <p className="text-sm text-gray-500">Choose a strong password for your account.</p>
              </div>

              {/* New password */}
              <div className="relative border-b border-gray-300 py-2 flex items-center">
                <svg className="w-5 h-5 text-gray-400 absolute left-0 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                  autoFocus
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none pl-8 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-0 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d={showNew
                        ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
                    />
                  </svg>
                </button>
              </div>

              {/* Confirm password */}
              <div className="relative border-b border-gray-300 py-2 flex items-center">
                <svg className="w-5 h-5 text-gray-400 absolute left-0 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none pl-8 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d={showConfirm
                        ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
                    />
                  </svg>
                </button>
              </div>

              {errorMessage && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#1660FF] hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-70"
              >
                {isSubmitting ? 'Saving…' : 'Set new password'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};