import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLockup } from '../../../components/shared/Brand';
import { ButtonLoader } from '../../../components/shared/ButtonLoader';
import { entityRegistrationService } from '../../../services/api';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MIN_LOADER_MS = 600;

const Wordmark = ({ dark = false }) => <span style={{ '--clr-accent': '#3D7FFF' }}><BrandLockup dark={dark} /></span>;

const ENTITY_CARDS = [
  {
    key: 'PRIMARY',
    title: 'Primary',
    desc: 'Register a primary school',
    icon: 'M12 14l9-5-9-5-9 5 9 5z',
  },
  {
    key: 'SECONDARY',
    title: 'Secondary',
    desc: 'Register a secondary school',
    icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0v6',
  },
  {
    key: 'UNIVERSITY',
    title: 'University',
    desc: 'Register a university',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5',
  },
];

const ENTITY_PLACEHOLDERS = {
  PRIMARY: {
    name: 'e.g. GS Kacyiru',
    contactPersonEmail: 'headteacher@school.rw',
    address: 'e.g. Kicukiro, Kigali',
    website: 'https://www.gskacyiru.rw',
    code: 'e.g. PRI-001',
  },
  SECONDARY: {
    name: 'e.g. G.S. Saint Joseph',
    contactPersonEmail: 'principal@school.rw',
    address: 'e.g. Nyarugenge, Kigali',
    website: 'https://www.stjosephs.rw',
    code: 'e.g. SEC-001',
  },
  UNIVERSITY: {
    name: 'e.g. University of Rwanda',
    contactPersonEmail: 'registrar@university.rw',
    address: 'e.g. Huye Campus, Southern Province',
    website: 'https://www.ur.ac.rw',
    code: 'e.g. UNI-001',
  },
};

const inputClass =
  'w-full rounded-2xl bg-[#f3f4f6] py-3.5 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none border border-transparent transition-all focus:bg-white focus:border-[#0A0A0A]/20 focus:ring-4 focus:ring-[#0A0A0A]/5';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('START'); // START | VERIFY_OTP | COMPLETE
  const [selectedType, setSelectedType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [registrationId, setRegistrationId] = useState(null);
  const [emailForOtp, setEmailForOtp] = useState('');
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(60);
  const [otpStatus, setOtpStatus] = useState('idle'); // 'idle', 'error', 'success'
  const inputRefs = useRef([]);

  const [startForm, setStartForm] = useState({
    name: '',
    contactPersonPhone: '',
    contactPersonEmail: '',
    password: '',
    confirmPassword: '',
  });

  const [completeForm, setCompleteForm] = useState({
    address: '',
    website: '',
    code: '',
  });

  const year = new Date().getFullYear();
  const entityPlaceholders = ENTITY_PLACEHOLDERS[selectedType] || ENTITY_PLACEHOLDERS.UNIVERSITY;
  const passwordsMatch =
    startForm.confirmPassword.length === 0 ? null : startForm.password === startForm.confirmPassword;

  const canSubmitStart = useMemo(
    () =>
      selectedType &&
      startForm.name &&
      startForm.contactPersonPhone &&
      startForm.contactPersonEmail &&
      startForm.password &&
      startForm.confirmPassword &&
      passwordsMatch === true,
    [selectedType, startForm, passwordsMatch]
  );

  const canSubmitComplete = useMemo(
    () => completeForm.address && completeForm.code,
    [completeForm]
  );

  useEffect(() => {
    if (step !== 'VERIFY_OTP' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  useEffect(() => {
    if (step !== 'VERIFY_OTP') return;
    const focusTimeout = setTimeout(() => inputRefs.current[0]?.focus(), 50);
    return () => clearTimeout(focusTimeout);
  }, [step]);

  const handleStart = async (event) => {
    event.preventDefault();
    if (!canSubmitStart) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    const startedAt = Date.now();
    try {
      const payload = {
        type: selectedType,
        name: startForm.name.trim(),
        contactPersonPhone: startForm.contactPersonPhone.trim(),
        contactPersonEmail: startForm.contactPersonEmail.trim().toLowerCase(),
        password: startForm.password,
        confirmPassword: startForm.confirmPassword,
      };
      const response = await entityRegistrationService.start({
        ...payload,
      });

      // Keep loader visible for smooth transition
      const remaining = MIN_LOADER_MS - (Date.now() - startedAt);
      if (remaining > 0) await sleep(remaining);

      setRegistrationId(response.registrationId);
      setEmailForOtp(response.contactPersonEmail || payload.contactPersonEmail);
      setOtpValues(Array(6).fill(''));
      setTimeLeft(60);
      setOtpStatus('idle');
      setStep('VERIFY_OTP');
      setSuccessMessage('OTP sent successfully. Check your email.');
    } catch (error) {
      setErrorMessage(error.message || 'Could not start registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeOtpVerification = async (otpCode) => {
    if (!registrationId || otpCode.length < 6) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setOtpStatus('idle');
    const startedAt = Date.now();

    try {
      await entityRegistrationService.verifyOtp({
        registrationId,
        otp: otpCode.trim(),
      });

      // Trigger success animation
      setOtpStatus('success');

      // Delay transition so user can enjoy the green success state
      setTimeout(() => {
        const remaining = MIN_LOADER_MS - (Date.now() - startedAt);
        if (remaining > 0) {
          setTimeout(() => {
            setStep('COMPLETE');
            setSuccessMessage('OTP verified. Complete the remaining details.');
          }, remaining);
        } else {
          setStep('COMPLETE');
          setSuccessMessage('OTP verified. Complete the remaining details.');
        }
      }, 800);
    } catch (error) {
      // Trigger error shake animation
      setOtpStatus('error');
      setErrorMessage(error.message || 'Could not verify OTP');
      setTimeLeft(0);

      // Reset status after shake completes
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

  const handleVerifyOtpSubmit = (event) => {
    event.preventDefault();
    handleVerifyOtpClick();
  };

  const handleResendOtp = async () => {
    if (!registrationId) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await entityRegistrationService.resendOtp({ registrationId });
      setOtpValues(Array(6).fill(''));
      setTimeLeft(60);
      inputRefs.current[0]?.focus();
      setSuccessMessage('OTP resent successfully.');
    } catch (error) {
      setErrorMessage(error.message || 'Could not resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (event) => {
    event.preventDefault();
    if (!registrationId || !canSubmitComplete) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    const startedAt = Date.now();
    try {
      const website = completeForm.website.trim();
      await entityRegistrationService.complete({
        registrationId,
        address: completeForm.address.trim(),
        website: website || null,
        code: completeForm.code.trim().toUpperCase(),
      });

      // Show completion modal
      setShowCompletionModal(true);

      // Auto-redirect after showing modal
      setTimeout(() => {
        const remaining = MIN_LOADER_MS - (Date.now() - startedAt);
        if (remaining > 0) {
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, remaining);
        } else {
          navigate('/login', { replace: true });
        }
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message || 'Could not complete registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, event) => {
    const value = event.target.value;
    if (Number.isNaN(Number(value))) return;

    const nextValues = [...otpValues];
    let completedCode = '';

    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      pastedDigits.forEach((digit, offset) => {
        const target = index + offset;
        if (target < 6) nextValues[target] = digit;
      });
      setOtpValues(nextValues);
      completedCode = nextValues.join('');
      const focusIndex = Math.min(index + pastedDigits.length, 5);
      inputRefs.current[focusIndex]?.focus();
    } else {
      nextValues[index] = value;
      setOtpValues(nextValues);
      completedCode = nextValues.join('');
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    // Auto-verify if all 6 digits are filled
    if (completedCode.length === 6 && completedCode.replace(/\D/g, '').length === 6) {
      executeOtpVerification(completedCode);
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);

    if (digits.length > 0) {
      const nextValues = [...otpValues];
      digits.forEach((digit, index) => {
        nextValues[index] = digit;
      });
      setOtpValues(nextValues);

      if (digits.length === 6) {
        inputRefs.current[5]?.focus();
        // Auto-submit after a brief moment
        setTimeout(() => {
          executeOtpVerification(nextValues.join(''));
        }, 100);
      } else {
        inputRefs.current[Math.min(digits.length, 5)]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'Enter') {
      handleVerifyOtpClick();
    }
  };

  const getOtpInputClasses = () => {
    const baseClasses = 'w-11 h-14 sm:w-12 border rounded-xl text-center text-xl font-semibold text-[#0A0A0A] caret-[#0A0A0A] outline-none transition-all duration-200';

    if (otpStatus === 'error') {
      return `${baseClasses} border-red-400 bg-red-50 text-red-600 animate-shake shadow-[0_0_10px_rgba(239,68,68,0.15)]`;
    }
    if (otpStatus === 'success') {
      return `${baseClasses} border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_0_14px_rgba(16,185,129,0.35)] scale-105`;
    }

    return `${baseClasses} border-gray-200 bg-gray-50/60 hover:border-[#3D7FFF] hover:bg-[#3D7FFF]/10 focus:bg-white focus:border-[#0A0A0A] focus:ring-4 focus:ring-[#3D7FFF]/40`;
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

    <div className="h-screen w-full flex bg-white antialiased overflow-hidden">
      <div className="hidden md:flex md:w-[52%] relative flex-col justify-between bg-gradient-to-br from-[#0A0A0A] via-[#0d0d12] to-[#08080a] text-white p-12 lg:p-20 overflow-hidden [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)] z-10">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#3D7FFF]/20 blur-[100px]" />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-[#0A0A0A]/40 blur-[100px]" />
        <div className="absolute top-[16%] right-[7%] w-44 h-44 rounded-[2.5rem] border border-white/10 rotate-[18deg]" />
        <div className="absolute top-[29%] right-[15%] w-24 h-24 rounded-[1.5rem] bg-white/[0.05] backdrop-blur-md -rotate-6" />
        <div className="absolute top-[23%] right-[3%] w-11 h-11 rounded-2xl bg-[#3D7FFF]/25 rotate-12" />
        <div className="absolute bottom-24 left-6 w-24 h-24 rounded-full border border-white/[0.08]" />

        <div className="relative z-10">
          <Link to="/" className="inline-block" aria-label="Go to Soma Connect landing page">
            <Wordmark />
          </Link>
        </div>

        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 max-w-xl space-y-6"
        >
          <h1 className="text-[2.75rem] xl:text-[3.5rem] font-semibold tracking-tight leading-[1.12]">
            Learn with Integrity, Lead with Opportunity.
          </h1>
          <p className="text-white/60 text-base lg:text-lg leading-relaxed max-w-md">
            Bridging the gap between Rwandan classrooms and the global job market through AI-verified excellence.
          </p>
        </motion.div>

        <div className="relative z-10">
          <p className="text-xs text-white/35">© {year} Soma Connect Platform. All rights reserved.</p>
        </div>
      </div>

      {/* Centering lives on an inner min-h-full wrapper so tall steps scroll
          naturally instead of clipping at the top (justify-center + overflow trap). */}
      <div className="w-full md:w-[48%] bg-white overflow-y-auto">
        <div className="min-h-full flex flex-col justify-center p-8 sm:p-12 lg:px-20">
        <div className="md:hidden mb-10">
          <Link to="/" className="inline-block" aria-label="Go to Soma Connect landing page">
            <Wordmark dark />
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {step === 'START' && !selectedType ? (
              <motion.div
                key="select-type"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="space-y-1.5 mb-8">
                  <h1 className="text-[28px] leading-tight font-semibold text-[#0A0A0A] tracking-tight">Choose entity type</h1>
                  <p className="text-sm text-gray-500">Step 1 of 3 — select one of the cards below.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {ENTITY_CARDS.map((card) => (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => setSelectedType(card.key)}
                      className="group text-left p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#0A0A0A] hover:bg-[#3D7FFF]/[0.06] transition-all duration-200"
                    >
                      <span className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-[#3D7FFF] flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-[#0A0A0A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d={card.icon} />
                        </svg>
                      </span>
                      <p className="mt-3 text-sm font-semibold text-[#0A0A0A]">{card.title}</p>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{card.desc}</p>
                    </button>
                  ))}
                </div>

              </motion.div>
            ) : null}

            {step === 'START' && selectedType ? (
              <motion.form
                key="start-form"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleStart}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedType(null)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-[#0A0A0A] transition-colors mb-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to cards
                  </button>
                  <h1 className="text-[28px] leading-tight font-semibold text-[#0A0A0A] tracking-tight">Entity details</h1>
                  <p className="text-sm text-gray-500">Step 2 of 3 — fill initial details and set password.</p>
                </div>

                <div className="px-4 py-2 rounded-xl bg-[#3D7FFF]/20 border border-[#3D7FFF]/40 text-sm font-semibold text-[#0A0A0A]">
                  Selected Type: {selectedType}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Name</label>
                  <input
                    value={startForm.name}
                    onChange={(event) => setStartForm({ ...startForm, name: event.target.value })}
                    className={inputClass}
                    placeholder={entityPlaceholders.name}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Contact Person Phone</label>
                    <input
                      value={startForm.contactPersonPhone}
                      onChange={(event) => setStartForm({ ...startForm, contactPersonPhone: event.target.value })}
                      className={inputClass}
                      placeholder="+2507..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Contact Person Email</label>
                    <input
                      type="email"
                      value={startForm.contactPersonEmail}
                      onChange={(event) => setStartForm({ ...startForm, contactPersonEmail: event.target.value })}
                      className={inputClass}
                      placeholder={entityPlaceholders.contactPersonEmail}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Password</label>
                    <input
                      type="password"
                      value={startForm.password}
                      onChange={(event) => setStartForm({ ...startForm, password: event.target.value })}
                      className={inputClass}
                      placeholder="At least 8 characters"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Repeat Password</label>
                    <input
                      type="password"
                      value={startForm.confirmPassword}
                      onChange={(event) => setStartForm({ ...startForm, confirmPassword: event.target.value })}
                      className={`${inputClass} ${
                        passwordsMatch === false
                          ? 'border-red-300 focus:border-red-300 focus:ring-red-100'
                          : passwordsMatch === true
                            ? 'border-green-300 focus:border-green-300 focus:ring-green-100'
                            : ''
                      }`}
                      placeholder="Repeat your password"
                    />
                  </div>
                </div>

                {passwordsMatch === false && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    Passwords do not match.
                  </p>
                )}
                {passwordsMatch === true && (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                    Passwords match.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmitStart}
                  aria-busy={isSubmitting}
                  className={`w-full py-3.5 bg-[#3D7FFF] hover:bg-[#5C96FF] text-white text-sm font-bold rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed ${
                    isSubmitting ? 'btn-loading-glow opacity-95' : ''
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2.5 min-h-[20px]">
                    {isSubmitting && <ButtonLoader size={18} className="text-white" />}
                    <span className={isSubmitting ? 'opacity-90' : ''}>
                      {isSubmitting ? 'Sending OTP...' : 'Continue'}
                    </span>
                  </span>
                </button>
              </motion.form>
            ) : null}

            {step === 'VERIFY_OTP' ? (
              <motion.form
                key="otp-step"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleVerifyOtpSubmit}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.18em]">
                    Registration Verification
                  </h3>
                  <h1 className="text-[28px] leading-tight font-semibold text-[#0A0A0A] tracking-tight">Verify OTP</h1>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Enter the 6-digit code sent to{' '}
                    <span className="font-semibold text-[#0A0A0A] break-all">{emailForOtp}</span>.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[13px] font-semibold text-gray-700">Verification code</label>
                  <div className="flex gap-2 sm:gap-2.5 justify-between">
                    {otpValues.map((digit, index) => (
                      <input
                        key={`register-otp-${index}`}
                        ref={(element) => {
                          inputRefs.current[index] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        disabled={isSubmitting || otpStatus === 'success'}
                        onChange={(event) => handleOtpChange(index, event)}
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        onPaste={handleOtpPaste}
                        className={getOtpInputClasses()}
                      />
                    ))}
                  </div>
                </div>

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
                      {isSubmitting ? 'Verifying...' : otpStatus === 'success' ? 'Verified!' : 'Verify & Continue'}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting || timeLeft > 0}
                  className="w-full py-3 border border-gray-300 text-[#0A0A0A] text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-70"
                >
                  {timeLeft > 0 ? `Resend in ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}` : 'Resend OTP'}
                </button>
              </motion.form>
            ) : null}

            {step === 'COMPLETE' ? (
              <motion.form
                key="complete-step"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleComplete}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <h1 className="text-[28px] leading-tight font-semibold text-[#0A0A0A] tracking-tight">Complete profile</h1>
                  <p className="text-sm text-gray-500">Fill the remaining entity details.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Address</label>
                  <input
                    value={completeForm.address}
                    onChange={(event) => setCompleteForm({ ...completeForm, address: event.target.value })}
                    className={inputClass}
                    placeholder={entityPlaceholders.address}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Website</label>
                  <input
                    value={completeForm.website}
                    onChange={(event) => setCompleteForm({ ...completeForm, website: event.target.value })}
                    className={inputClass}
                    placeholder={entityPlaceholders.website}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-700">Code</label>
                  <input
                    value={completeForm.code}
                    onChange={(event) =>
                      setCompleteForm({ ...completeForm, code: event.target.value.toUpperCase() })
                    }
                    className={inputClass}
                    placeholder={entityPlaceholders.code}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmitComplete}
                  aria-busy={isSubmitting}
                  className={`w-full py-3.5 bg-[#3D7FFF] hover:bg-[#5C96FF] text-white text-sm font-bold rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed ${
                    isSubmitting ? 'btn-loading-glow opacity-95' : ''
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2.5 min-h-[20px]">
                    {isSubmitting && <ButtonLoader size={18} className="text-white" />}
                    <span className={isSubmitting ? 'opacity-90' : ''}>
                      {isSubmitting ? 'Finishing...' : 'Complete Registration'}
                    </span>
                  </span>
                </button>
              </motion.form>
            ) : null}
          </AnimatePresence>

          {errorMessage && (
            <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="mt-4 text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
              {successMessage}
            </p>
          )}

          <div className="mt-6">
            <p className="text-sm text-gray-500 text-center mb-3">Already have an account?</p>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center py-3.5 bg-[#3D7FFF] hover:bg-[#5C96FF] text-white text-sm font-bold rounded-2xl transition-all"
            >
              Log in
            </Link>
          </div>
        </div>
        </div>
      </div>

      {/* Success Modal - Shows after registration completion */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15, stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mx-auto"
              >
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#0A0A0A]">
                  Registration Received!
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Your institution has been registered and is now pending approval. A platform administrator will review it shortly — you can sign in once it is approved.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-4"
              >
                <p className="text-sm text-gray-500">
                  Redirecting to login...
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default RegisterPage;
