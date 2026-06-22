import React from 'react';
import { useForm } from 'react-hook-form';

export const LoginForm = ({ onLoginSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log("Credentials validated safely:", data);
    if (onLoginSuccess) {
      onLoginSuccess(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm mx-auto space-y-6">
      
      {/* Header Area */}
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl font-normal text-[#1064ff] mb-2">Log In</h1>
        <p className="text-xs text-gray-500">
          Don't have an account? <a href="#" className="text-[#1064ff] hover:underline font-medium">Create an account</a>
        </p>
        <p className="text-[11px] text-gray-400">It will take less than a minute.</p>
      </div>

      {/* Input Fields */}
      <div className="space-y-6">
        
        {/* Username */}
        <div className="relative border-b border-gray-300 py-2">
          <input 
            {...register('username', { required: 'Username is required' })} 
            type="text"
            placeholder="Username" 
            className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none pr-8"
          />
          <span className="absolute right-0 top-2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          {errors.username && (
            <p className="text-red-500 text-[10px] mt-1 absolute bottom-[-16px]">{errors.username.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative border-b border-gray-300 py-2">
          <input 
            {...register('password', { required: 'Password is required' })} 
            type="password"
            placeholder="Password" 
            className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none pr-8"
          />
          <span className="absolute right-0 top-2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
          {errors.password && (
            <p className="text-red-500 text-[10px] mt-1 absolute bottom-[-16px]">{errors.password.message}</p>
          )}
        </div>

      </div>

      {/* Button & Checkbox inline */}
      <div className="flex items-center pt-4 space-x-6">
        <button 
          type="submit" 
          className="px-8 py-2 bg-[#1064ff] hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors"
        >
          Sign in
        </button>
        <label className="flex items-center space-x-2 cursor-pointer text-gray-500 text-xs">
          <input 
            type="checkbox" 
            className="w-3.5 h-3.5 rounded border-gray-300 text-[#1064ff] focus:ring-[#1064ff]" 
          />
          <span>Remember password</span>
        </label>
      </div>

      {/* Forget Password link */}
      <div className="text-center pt-8">
        <a href="#" className="text-xs text-[#1064ff] hover:underline">Forgot your password?</a>
      </div>

    </form>
  );
};