import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { REFRESH_TOKEN_KEY } from '../../../services/apiClient';
import { Link } from 'react-router-dom';
import { ButtonLoader } from '../../../components/shared/ButtonLoader';
import { dashboardPathForRoles } from '../../../utils/dashboardPath';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Keep the button loader on screen long enough to read as a smooth transition,
// even when the API answers in a few milliseconds (otherwise it just flickers).
const MIN_LOADER_MS = 600;

export const LoginForm = ({ onToggleMode }) => {
  const [view, setView] = useState('login');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // One-off confirmation after landing back here from reset / forced change.
  const successMessage = location.state?.passwordReset
    ? 'Password reset successfully. Please sign in with your new password.'
    : location.state?.passwordChanged
    ? 'Password changed successfully. Please sign in with your new password.'
    : '';
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [pendingUsername, setPendingUsername] = useState('');
  
  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP specific state
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(60);
  const [otpStatus, setOtpStatus] = useState('idle'); // 'idle', 'error', 'success'
  const inputRefs = useRef([]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!otpRequired || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpRequired, timeLeft]);

  // Drop the cursor into the first code box the moment the OTP view appears.
  useEffect(() => {
    if (!otpRequired) return;
    const id = setTimeout(() => inputRefs.current[0]?.focus(), 50);
    return () => clearTimeout(id);
  }, [otpRequired]);

  const saveAuthAndRedirect = (response) => {
    if (!response?.token) {
      throw new Error('Token missing from authentication response');
    }

    const authUser = {
      id: response.id,
      name: response.name,
      username: response.username,
      email: response.email,
      roles: response.roles || [],
      permissions: response.permissions || [],
      entityId: response.entityId || null,
      entityName: response.entityName || null,
      entityType: response.entityType || null,
      // The school area is keyed on schoolId, but the backend identifies an entity
      // admin's institution as entityId — bridge the two so SchoolRoute/data calls work.
      schoolId: response.schoolId || response.entityId || null,
      entityApprovalStatus: response.entityApprovalStatus || null,
      entityRejectionReason: response.entityRejectionReason || null,
    };

    login(response.token, authUser);
    if (response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }

    // First-login accounts must change their password before anything else —
    // the backend's PasswordChangeFilter 403s every other call until they do.
    if (response.isPasswordChanged === false) {
      navigate('/change-password', { replace: true });
      return;
    }

    // A pending / rejected institution can still sign in, but its admins are
    // held on the blocked screen instead of the school portal until a super
    // admin approves it.
    const primaryRole = (authUser.roles?.[0] || '').toUpperCase();
    const isEntityAdmin = primaryRole === 'ENTITY_ADMIN' || primaryRole === 'SCHOOL_ADMIN';
    if (isEntityAdmin && (authUser.entityApprovalStatus === 'PENDING' || authUser.entityApprovalStatus === 'REJECTED')) {
      navigate('/school/blocked', { replace: true });
      return;
    }

    // A ?next= (e.g. a course a learner clicked before signing in) wins over the
    // role's default home, so they resume exactly where they intended.
    const next = new URLSearchParams(location.search).get('next');
    const redirectPath = next || dashboardPathForRoles(authUser);
    navigate(redirectPath, { replace: true });
  };

  const onSubmitCredentials = async (data) => {
    setIsSubmitting(true);
    setErrorMessage('');
    const startedAt = Date.now();
    try {
      const response = await authService.login(data.email, data.password);
      // Let the spinner breathe before we transition away or show the OTP view.
      const remaining = MIN_LOADER_MS - (Date.now() - startedAt);
      if (remaining > 0) await sleep(remaining);

      if (response?.otpRequired) {
        setOtpRequired(true);
        setPendingUsername(response.username || data.email);
        setTimeLeft(60);
        setOtpValues(Array(6).fill(''));
        setOtpStatus('idle');
        setIsSubmitting(false);
        return;
      }

      // On success we navigate away; keep the loader spinning through the unmount.
      saveAuthAndRedirect(response);
    } catch (error) {
      const remaining = MIN_LOADER_MS - (Date.now() - startedAt);
      if (remaining > 0) await sleep(remaining);
      setErrorMessage(error?.message || 'Unable to sign in');
      setIsSubmitting(false);
    }
  };

  // Dedicated execution function to handle the API call
  const executeOtpVerification = async (codeToVerify) => {
    if (!pendingUsername || codeToVerify.length < 6) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setOtpStatus('idle');

    try {
      const response = await authService.verifyOtp(pendingUsername, codeToVerify);
      
      // Trigger success animation
      setOtpStatus('success');
      
      // Delay redirection slightly so the user can enjoy the green success state
      setTimeout(() => {
        saveAuthAndRedirect(response);
      }, 800);

    } catch (error) {
      // Trigger error shake animation
      setOtpStatus('error');
      setErrorMessage(error?.message || 'OTP verification failed');
      
      // Reset status after shake completes to allow re-entry
      setTimeout(() => {
        setOtpStatus('idle');
        setOtpValues(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }, 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpClick = () => {
    executeOtpVerification(otpValues.join(''));
  };

  const handleResendCode = async () => {
    if (!pendingUsername) return;
    setErrorMessage('');
    setOtpStatus('idle');
    setOtpValues(Array(6).fill(''));
    try {
      await authService.resendOtp(pendingUsername);
      setTimeLeft(60);
      inputRefs.current[0]?.focus();
    } catch (error) {
      setErrorMessage(error?.message || 'Could not resend the code');
    }
  };

  // OTP Input Handlers
  const handleOtpChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtpValues = [...otpValues];
    let completedCode = '';
    
    // Handle pasting a full code
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split('');
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtpValues[index + i] = char;
      });
      setOtpValues(newOtpValues);
      completedCode = newOtpValues.join('');
      
      const focusIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    } else {
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      completedCode = newOtpValues.join('');
      
      // Move to next input automatically
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    // Auto-verify if all 6 digits are filled
    if (completedCode.length === 6) {
      executeOtpVerification(completedCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      handleVerifyOtpClick();
    }
  };

  // Dynamic styling based on the verification status
  const getOtpInputClasses = () => {
    const baseClasses = "w-11 h-14 sm:w-12 border rounded-xl text-center text-xl font-semibold text-[#0A0A0A] caret-[#0A0A0A] outline-none transition-all duration-200";

    if (otpStatus === 'error') {
      return `${baseClasses} border-red-400 bg-red-50 text-red-600 animate-shake shadow-[0_0_10px_rgba(239,68,68,0.15)]`;
    }
    if (otpStatus === 'success') {
      return `${baseClasses} border-[#3D7FFF] bg-[#3D7FFF]/20 text-[#0A0A0A] shadow-[0_0_14px_rgba(61,127,255,0.5)] scale-105`;
    }

    return `${baseClasses} border-gray-200 bg-gray-50/60 hover:border-[#3D7FFF] hover:bg-[#3D7FFF]/10 focus:bg-white focus:border-[#0A0A0A] focus:ring-4 focus:ring-[#3D7FFF]/40`;
  };
const toggleView = () => {
    setView(prev => prev === 'login' ? 'register' : 'login');
  };
  return (
    <>
      {/* Inject custom shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>

      <div className="w-full max-w-md mx-auto font-sans">
        {!otpRequired ? (
          // --- STANDARD LOGIN VIEW ---
          <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-5">
            <div className="space-y-1.5 mb-8">
              <h1 className="text-[28px] leading-tight font-semibold text-[#0A0A0A] tracking-tight">Welcome back!</h1>
              <p className="text-sm text-gray-500">Enter your details to access your dashboard.</p>
            </div>

            {successMessage && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">
                {successMessage}
              </p>
            )}

            {/* Username Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-[13px] font-semibold text-gray-700">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </span>
                <input
                  id="login-email"
                  {...register('email', { required: 'Email is required' })}
                  type="text"
                  placeholder="Enter your username"
                  className={`w-full rounded-2xl bg-[#f3f4f6] py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none border transition-all focus:bg-white focus:ring-4 focus:ring-[#0A0A0A]/5 ${errors.email ? 'border-red-300' : 'border-transparent focus:border-[#0A0A0A]/20'}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[11px] font-medium">Username is required</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-[13px] font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-[13px] font-medium text-gray-500 hover:text-[#0A0A0A] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full rounded-2xl bg-[#f3f4f6] py-3.5 pl-11 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none border transition-all focus:bg-white focus:ring-4 focus:ring-[#0A0A0A]/5 ${errors.password ? 'border-red-300' : 'border-transparent focus:border-[#0A0A0A]/20'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[11px] font-medium">{errors.password.message}</p>}
            </div>

            {errorMessage && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                {errorMessage}
              </p>
            )}

            <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
              <input type="checkbox" className="peer sr-only" />
              <span className="w-5 h-5 rounded-full border-2 border-[#0A0A0A]/20 bg-white text-transparent peer-checked:bg-[#3D7FFF] peer-checked:border-[#3D7FFF] peer-checked:text-white transition-all duration-150 flex items-center justify-center">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm text-gray-600">Keep me logged in</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className={`w-full py-3.5 bg-[#3D7FFF] hover:bg-[#5C96FF] text-white text-sm font-bold rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed ${
                isSubmitting ? 'btn-loading-glow opacity-95' : ''
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2.5 min-h-[20px]">
                {isSubmitting && <ButtonLoader size={18} className="text-white" />}
                <span className={isSubmitting ? 'opacity-90' : ''}>
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </span>
              </span>
            </button>

            <p className="text-center text-sm text-gray-500 pt-4">
              Don't have an account?{' '}
              <Link
                to="/register"
                onClick={onToggleMode}
                className="text-[#0A0A0A] hover:underline font-bold"
              >
                Create an account
              </Link>
            </p>
          </form>

        ) : (
          // --- OTP VERIFICATION VIEW ---
          <div className="space-y-7 animate-in fade-in zoom-in-95 duration-300">
            {/* Header Area */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.18em]">
                Two-Factor Authentication
              </h3>
              <h1 className="text-[28px] leading-tight font-semibold text-[#0A0A0A] tracking-tight">
                Security verification
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed pt-1">
                Enter the 6-digit code sent to{' '}
                <span className="font-medium text-[#0A0A0A] break-all">{pendingUsername}</span>
              </p>
            </div>

            {/* 6-Digit Code Input */}
            <div className="space-y-2.5">
              <label className="text-[13px] font-semibold text-gray-700">
                Verification code
              </label>
              <div className="flex gap-2 sm:gap-2.5 justify-between">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={6}
                    value={digit}
                    disabled={isSubmitting || otpStatus === 'success'}
                    onChange={(e) => handleOtpChange(index, e)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={getOtpInputClasses()}
                  />
                ))}
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-center font-medium animate-in fade-in slide-in-from-top-2">
                {errorMessage}
              </p>
            )}

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyOtpClick}
              disabled={isSubmitting || otpValues.join('').length < 6 || otpStatus === 'success'}
              aria-busy={isSubmitting}
              className={`w-full py-3.5 bg-[#3D7FFF] hover:bg-[#5C96FF] text-white text-sm font-bold rounded-xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-70 ${
                isSubmitting ? 'btn-loading-glow' : ''
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2.5 min-h-[20px]">
                {isSubmitting && <ButtonLoader size={18} className="text-white" />}
                <span>
                  {isSubmitting ? 'Verifying...' : otpStatus === 'success' ? 'Verified!' : 'Verify Access'}
                </span>
              </span>
            </button>

            {/* Footer Navigation & Timer */}
            <div className="border-t border-gray-100 pt-6 text-center space-y-6">
              <div className="space-y-1.5">
                <p className="text-sm text-gray-500">Didn't receive the code?</p>
                {timeLeft > 0 ? (
                  <p className="text-sm font-medium text-gray-400">
                    Resend in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </p>
                ) : (
                  <button
                    onClick={handleResendCode}
                    className="text-sm font-semibold text-[#0A0A0A] hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setOtpRequired(false)}
                className="text-sm font-medium text-gray-400 hover:text-gray-700 flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back To Login
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};