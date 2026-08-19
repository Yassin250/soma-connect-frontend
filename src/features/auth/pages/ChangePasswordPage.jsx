import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../../../assets/2.png';
import { authService } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const inputWrap =
  'relative border-b border-gray-300 py-2 flex items-center focus-within:border-[#3D7FFF] transition-colors';
const inputBase =
  'w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none pl-8 pr-10';

const EyeButton = ({ shown, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-0 text-gray-400 hover:text-gray-600 focus:outline-none"
    aria-label={shown ? 'Hide password' : 'Show password'}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
        d={shown
          ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
          : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'}
      />
    </svg>
  </button>
);

/**
 * Forced first-login password change. The backend flags freshly-provisioned or
 * reset accounts with isPasswordChanged=false and 403s every protected call
 * (PASSWORD_CHANGE_REQUIRED) until the password is changed here.
 */
const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (newPassword === oldPassword) {
      setErrorMessage('New password must be different from the current one');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.changePassword({ oldPassword, newPassword, confirmPassword });
      // Password changed on the server — clear the pre-change session and have
      // the user sign in fresh with their new credentials.
      logout();
      navigate('/login', { replace: true, state: { passwordChanged: true } });
    } catch (error) {
      setErrorMessage(error?.message || 'Could not change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans antialiased">
      <div className="hidden md:flex relative flex-col justify-center items-center w-3/5 bg-[#0A0A0A] text-white p-20 [clip-path:polygon(0_0,100%_0,88%_100%,0_100%)] z-10 overflow-hidden">
        <div className="absolute top-[20%] right-[20%] w-32 h-32 bg-white/10 rounded-3xl rotate-12 backdrop-blur-md animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-[20%] left-[10%] w-20 h-20 bg-[#3D7FFF]/20 rounded-full backdrop-blur-md animate-[bounce_8s_ease-in-out_infinite]" />
        <div className="absolute top-12 left-12">
          <img src={logo} alt="SomaConnect" className="h-12 w-auto object-contain brightness-0 invert" />
        </div>
        <div className="max-w-md text-left transform -translate-x-10 space-y-6 relative z-20">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3D7FFF] mb-3">Secure your account</p>
          <h2 className="text-5xl font-extrabold tracking-tight leading-tight">One quick step before you start.</h2>
          <p className="text-white/80 text-base leading-relaxed font-medium mt-4">
            Choose a new password to replace the temporary one you signed in with.
          </p>
        </div>
      </div>

      <div className="w-full md:w-2/5 flex flex-col justify-center p-8 sm:p-16 lg:px-20 bg-white">
        <motion.form
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          onSubmit={handleSubmit}
          className="w-full max-w-[400px] mx-auto space-y-6"
        >
          <div className="space-y-1 mb-8">
            <h1 className="text-[21px] font-semibold text-gray-900 tracking-tight mb-2">Change your password</h1>
            <p className="text-sm text-gray-500">You must set a new password before continuing.</p>
          </div>

          {/* Current password */}
          <div className={inputWrap}>
            <svg className="w-5 h-5 text-gray-400 absolute left-0 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Current password"
              required
              autoFocus
              className={inputBase}
            />
            <EyeButton shown={showOld} onToggle={() => setShowOld(!showOld)} />
          </div>

          {/* New password */}
          <div className={inputWrap}>
            <svg className="w-5 h-5 text-gray-400 absolute left-0 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              required
              className={inputBase}
            />
            <EyeButton shown={showNew} onToggle={() => setShowNew(!showNew)} />
          </div>

          {/* Confirm new password */}
          <div className={inputWrap}>
            <svg className="w-5 h-5 text-gray-400 absolute left-0 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className={inputBase}
            />
            <EyeButton shown={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
          </div>

          {errorMessage && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-[#0A0A0A] hover:bg-black text-white text-[13px] font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-70"
          >
            {isSubmitting ? 'Saving…' : 'Change password'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { logout(); navigate('/login', { replace: true }); }}
              className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
