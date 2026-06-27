import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';


export const LoginForm = ({ onToggleMode }) => {
  const [view, setView] = useState('login');
  const navigate = useNavigate();
  const { login } = useAuth();
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
  const [timeLeft, setTimeLeft] = useState(32);
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

  const getRedirectPath = (roles) => {
    const primaryRole = roles?.[0]?.toUpperCase();
    switch (primaryRole) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return '/admin/dashboard';
      case 'SCHOOL_ADMIN':
        return '/school/dashboard';
      case 'STUDENT':
        return '/student/dashboard';
      case 'LECTURER':
        return '/lecturer/dashboard';
      default:
        return '/admin/dashboard';
    }
  };

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
    };

    login(response.token, authUser);
    if (response.refreshToken) {
      localStorage.setItem('soma_refresh_token', response.refreshToken);
    }
    const redirectPath = getRedirectPath(authUser.roles);
    navigate(redirectPath, { replace: true });
  };

  const onSubmitCredentials = async (data) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const response = await authService.login(data.username, data.password);
      if (response?.otpRequired) {
        setOtpRequired(true);
        setPendingUsername(response.username || data.username);
        setTimeLeft(32);
        setOtpValues(Array(6).fill(''));
        setOtpStatus('idle');
        return;
      }
      saveAuthAndRedirect(response);
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to sign in');
    } finally {
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
    // Add resend API logic here
    setTimeLeft(32);
    setOtpStatus('idle');
    setOtpValues(Array(6).fill(''));
    setErrorMessage('');
    inputRefs.current[0]?.focus();
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
    const baseClasses = "w-12 h-14 border rounded-xl text-center text-xl font-bold outline-none transition-all duration-300";
    
    if (otpStatus === 'error') {
      return `${baseClasses} border-red-500 bg-red-50 text-red-700 animate-shake shadow-[0_0_10px_rgba(239,68,68,0.2)]`;
    }
    if (otpStatus === 'success') {
      return `${baseClasses} border-green-500 bg-green-50 text-green-700 shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-105`;
    }
    
    // Default / Idle state
    return `${baseClasses} border-gray-200 bg-gray-50/30 text-gray-900 focus:bg-white focus:border-[#1064ff] focus:ring-4 focus:ring-blue-50`;
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
          <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-6">
            <div className="space-y-1 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Log In</h1>
              <p className="text-sm text-gray-500">Welcome back! Please enter your details.</p>
            </div>

            <div className="space-y-6">
              {/* Username / Email Field */}
              <div className="relative border-b border-gray-300 py-2 flex items-center">
                <svg className="w-5 h-5 text-gray-400 absolute left-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  {...register('username', { required: 'Username or Email is required' })}
                  type="text"
                  placeholder="Username or Email"
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none pl-8 pr-4"
                />
                {errors.username && <p className="text-red-500 text-[10px] mt-1 absolute bottom-[-16px]">{errors.username.message}</p>}
              </div>

              {/* Password Field */}
              <div className="relative border-b border-gray-300 py-2 flex items-center">
                <svg className="w-5 h-5 text-gray-400 absolute left-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none pl-8 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
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
                {errors.password && <p className="text-red-500 text-[10px] mt-1 absolute bottom-[-16px]">{errors.password.message}</p>}
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {errorMessage}
              </p>
            )}

            <div className="flex items-center pt-4 space-x-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-[#1064ff] hover:bg-blue-700 text-white text-sm font-semibold rounded-md shadow-sm transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
              <label className="flex items-center space-x-2 cursor-pointer text-gray-500 text-sm">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1064ff] focus:ring-[#1064ff]" />
                <span>Remember</span>
              </label>
            </div>

            <div className="text-center pt-8 space-y-3 border-t border-gray-100 mt-8">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register"
                  type="button" 
                  onClick={onToggleMode} 
                  className="text-[#1064ff] hover:underline font-semibold"
                >
                  Create an account
                </Link>
              </p>
              <Link to="/forgot-password" className="text-sm text-[#1064ff] hover:underline font-medium block">Forgot your password?</Link>
            </div>
          </form>

        ) : (
          // --- OTP VERIFICATION VIEW ---
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Header Area */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#1064ff] uppercase tracking-widest">
                Two-Factor Authentication
              </h3>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Security Verification
              </h1>
              <p className="text-sm text-gray-500">
                Enter the 6-digit code sent to your registered device
              </p>
            </div>

            {/* User Display Box */}
            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 shadow-sm space-y-1.5">
              <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">
                Verifying access for
              </p>
              <p className="text-sm font-mono font-bold text-gray-900">
                {pendingUsername}
              </p>
            </div>

            {/* 6-Digit Code Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">
                6-Digit Verification Code
              </label>
              <div className="flex gap-2 justify-between">
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
              className="w-full py-3.5 bg-[#1064ff] hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-70"
            >
              {isSubmitting ? 'Verifying...' : otpStatus === 'success' ? 'Verified!' : 'Verify Access'}
            </button>

            {/* Footer Navigation & Timer */}
            <div className="border-t border-gray-100 pt-6 text-center space-y-6">
              <div className="space-y-1.5">
                <p className="text-sm text-gray-500">Didn't receive the code?</p>
                {timeLeft > 0 ? (
                  <p className="text-sm font-medium text-gray-400">
                    Resend In {timeLeft}s
                  </p>
                ) : (
                  <button 
                    onClick={handleResendCode}
                    className="text-sm font-semibold text-[#1064ff] hover:underline"
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