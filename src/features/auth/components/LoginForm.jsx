import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/api';
import { mockDb } from '../../../services/mockDb';

const getRoleRedirect = (user) => {
  const role = user?.role || user?.roles?.[0];

  if (role === 'ADMIN' || role === 'System Admin') return '/super-admin/approvals';
  if (role === 'SCHOOL_ADMIN') {
    const school = mockDb.getSchool(user.schoolId);
    return school?.status === 'ACTIVE' ? '/school/dashboard' : '/school/setup';
  }
  if (role === 'STUDENT') return '/student/dashboard';
  if (role === 'LECTURER') return '/school/dashboard';

  return '/admin/users';
};

const findMockUser = (username) => {
  const emailInput = username.trim().toLowerCase();
  return mockDb
    .getUsers()
    .find((user) => user.email?.toLowerCase() === emailInput || user.username?.toLowerCase() === emailInput);
};

const validateMockUserAccess = (user) => {
  if (!user) {
    return "Email address not found. Try 'admin@somaconnect.rw' for Super-Admin or register a school.";
  }

  if (user.role !== 'ADMIN' && user.schoolId) {
    const school = mockDb.getSchool(user.schoolId);
    if (school?.status === 'PENDING') {
      return `Access denied: "${school.name}" is pending manual KYC verification.`;
    }
    if (school?.status === 'REJECTED') {
      return `Access denied: "${school.name}" registry has been rejected. Contact registrar.`;
    }
  }

  return '';
};

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
<<<<<<< Updated upstream
    navigate(getRoleRedirect(authUser), { replace: true });
  };

  const loginWithMockUser = (username) => {
    const matchedUser = findMockUser(username);
    const validationError = validateMockUserAccess(matchedUser);

    if (validationError) {
      throw new Error(validationError);
    }

    login('mock-jwt-token-xyz', matchedUser);
    navigate(getRoleRedirect(matchedUser), { replace: true });
=======
    const redirectPath = authUser.roles?.some(r => (r?.name || r) === 'SUPER_ADMIN' || (r?.name || r) === 'ADMIN')
      ? '/admin/users'
      : '/admin/users';

    navigate(redirectPath, { replace: true });
>>>>>>> Stashed changes
  };

  const onSubmitCredentials = async (data) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (!data.password?.trim()) {
        loginWithMockUser(data.username);
        return;
      }

      const response = await authService.login(data.username, data.password);
      if (response?.otpRequired) {
        setOtpRequired(true);
        setPendingUsername(response.username || data.username);
        return;
      }
      saveAuthAndRedirect(response);
    } catch (error) {
      const mockUser = findMockUser(data.username);
      if (mockUser) {
        try {
          loginWithMockUser(data.username);
          return;
        } catch (mockError) {
          setErrorMessage(mockError?.message || 'Unable to sign in');
          return;
        }
      }
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
            <Link to="/register-school" className="text-[#1064ff] hover:underline font-medium">
              Register your school
            </Link>
          )}
        </p>
        <p className="text-[11px] text-gray-400">Use a password for API login, or leave it empty for local demo users.</p>
      </div>

      {!otpRequired && (
        <div className="space-y-6">
          <div className="relative border-b border-gray-300 py-2">
            <input
              {...register('username', { required: 'Username is required' })}
              type="text"
              placeholder="Username or email"
              className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none pr-8"
            />
            {errors.username && <p className="text-red-500 text-[10px] mt-1 absolute bottom-[-16px]">{errors.username.message}</p>}
          </div>

          <div className="relative border-b border-gray-300 py-2">
            <input
              {...register('password')}
              type="password"
              placeholder="Password"
              className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none pr-8"
            />
          </div>
        </div>
      )}

      {otpRequired && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            OTP sent for <span className="font-semibold">{pendingUsername}</span>.
          </p>
          <div className="relative border-b border-gray-300 py-2">
            <input
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
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
              onClick={() => {
                setOtpRequired(false);
                setOtpCode('');
              }}
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
