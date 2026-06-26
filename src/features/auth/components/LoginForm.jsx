import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/api';

export const LoginForm = ({ onToggleMode }) => {
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
  const [otpCode, setOtpCode] = useState('');

  const saveAuthAndRedirect = (response) => {
    if (!response?.token) {
      throw new Error('Token missing from authentication response');
    }

    const authUser = {
      id: response.id,
      name: response.name,
      username: response.username,
      email: response.email,
      role: response.role,
      roles: response.roles || [],
      permissions: response.permissions || [],
    };

    login(response.token, authUser);
    if (response.refreshToken) {
      localStorage.setItem('soma_refresh_token', response.refreshToken);
    }

    const role = authUser.role || (Array.isArray(authUser.roles) ? authUser.roles[0] : null);
    const roleName = typeof role === 'string' ? role : role?.name;

    if (roleName === 'ADMIN' || roleName === 'SUPER_ADMIN' || roleName === 'System Admin') {
      navigate('/admin/users', { replace: true });
    } else if (roleName === 'SCHOOL_ADMIN') {
      navigate('/admin/users', { replace: true });
    } else if (roleName === 'STUDENT') {
      navigate('/admin/users', { replace: true });
    } else if (roleName === 'LECTURER') {
      navigate('/admin/users', { replace: true });
    } else {
      navigate('/admin/users', { replace: true });
    }
  };

  const onSubmitCredentials = async (data) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await authService.login(data.username, data.password);
      if (response?.otpRequired) {
        setOtpRequired(true);
        setPendingUsername(response.username || data.username);
        return;
      }
      saveAuthAndRedirect(response);
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!pendingUsername || !otpCode.trim()) {
      setErrorMessage('OTP is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const response = await authService.verifyOtp(pendingUsername, otpCode.trim());
      saveAuthAndRedirect(response);
    } catch (error) {
      setErrorMessage(error?.message || 'OTP verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitCredentials)} className="w-full max-w-sm mx-auto space-y-6">
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl font-normal text-[#1064ff] mb-2">Log In</h1>
        <p className="text-xs text-gray-500">
          Don't have an account?{' '}
          {onToggleMode ? (
            <button type="button" onClick={onToggleMode} className="text-[#1064ff] hover:underline font-medium">
              Create an account
            </button>
          ) : (
            <a href="/login" className="text-[#1064ff] hover:underline font-medium">
              Register
            </a>
          )}
        </p>
        <p className="text-[11px] text-gray-400">It will take less than a minute.</p>
      </div>

      {!otpRequired && (
        <div className="space-y-6">
          <div className="relative border-b border-gray-300 py-2">
            <input
              {...register('username', { required: 'Username is required' })}
              type="text"
              placeholder="Username"
              className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none pr-8"
            />
            {errors.username && <p className="text-red-500 text-[10px] mt-1 absolute bottom-[-16px]">{errors.username.message}</p>}
          </div>

          <div className="relative border-b border-gray-300 py-2">
            <input
              {...register('password', { required: 'Password is required' })}
              type="password"
              placeholder="Password"
              className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none pr-8"
            />
            {errors.password && <p className="text-red-500 text-[10px] mt-1 absolute bottom-[-16px]">{errors.password.message}</p>}
          </div>
        </div>
      )}

      {otpRequired && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">OTP sent for <span className="font-semibold">{pendingUsername}</span>.</p>
          <div className="relative border-b border-gray-300 py-2">
            <input
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              type="text"
              maxLength={6}
              placeholder="Enter OTP code"
              className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none pr-8 tracking-widest"
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {errorMessage}
        </p>
      )}

      <div className="flex items-center pt-4 space-x-6">
        {!otpRequired ? (
          <>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 bg-[#1064ff] hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors disabled:opacity-70"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
            <label className="flex items-center space-x-2 cursor-pointer text-gray-500 text-xs">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-[#1064ff]" />
              <span>Remember</span>
            </label>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isSubmitting}
              className="px-8 py-2 bg-[#1064ff] text-white text-sm font-medium rounded shadow-sm disabled:opacity-70"
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => { setOtpRequired(false); setOtpCode(''); }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Back to login
            </button>
          </>
        )}
      </div>

      <div className="text-center pt-8">
        <a href="#" className="text-xs text-[#1064ff] hover:underline">Forgot your password?</a>
      </div>
    </form>
  );
};
