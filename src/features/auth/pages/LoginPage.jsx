import React from 'react';
import { LoginForm } from '../components/LoginForm';

// 1. Added onLoginSuccess destructured prop here
export const LoginPage = ({ onLoginSuccess }) => {
  return (
    // Strict full-viewport wrapper that completely forbids scrolling
    <div className="h-screen w-full bg-[#eaf2fc] flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-hidden font-sans antialiased">
      
      {/* Dynamic Card Container - Uses max-h to stay perfectly within the viewport on shorter screens */}
      <div className="w-full max-w-[1024px] h-full max-h-[620px] md:rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 bg-white">
        
        {/* Left Side Branding Panel (5/12 Cols) */}
        <div className="hidden md:flex md:col-span-5 bg-[#1064ff] p-6 lg:p-8 flex-col justify-between relative overflow-hidden select-none h-full">
          
          {/* Background Accents */}
          <div className="absolute top-[32%] left-[-15%] w-[140%] h-20 bg-white/5 rounded-full rotate-[-15deg] pointer-events-none" />
          <div className="absolute top-[42%] left-[10%] w-20 h-4 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute top-[48%] right-[-5%] w-14 h-4 bg-white/10 rounded-full pointer-events-none" />
          
          {/* Logo */}
          <div className="flex items-center space-x-2 text-white relative z-10">
            <svg className="w-5 h-7 fill-current opacity-95" viewBox="0 0 24 24">
              <path d="M4 2h3v12a5 5 0 0 0 10 0V2h3v12a8 8 0 0 1-16 0V2z" />
            </svg>
            <span className="text-lg font-semibold tracking-tight">SomaConnect</span>
          </div>

          {/* Centered Illustration - Scaled down slightly to fit tight aspect ratios */}
          <div className="relative flex justify-center items-center my-auto z-10 scale-90 lg:scale-95">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Clipboard Shadow & Base */}
              <div className="absolute w-[114px] h-[152px] bg-[#0b4ed2] rounded-2xl transform rotate-[-12deg] translate-x-1 translate-y-1 opacity-40 blur-[1px]" />
              <div className="absolute w-[114px] h-[152px] bg-[#1a4cb0] rounded-2xl transform rotate-[-12deg] shadow-lg border border-blue-400/20" />
              
              {/* Paper Surface */}
              <div className="absolute w-[98px] h-[132px] bg-white rounded-xl transform rotate-[-12deg] p-3 flex flex-col justify-between">
                <div className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 w-12 h-4 bg-[#ccdfff] rounded-t-md border-b border-blue-200" />
                
                <div className="space-y-2.5 pt-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#1064ff] font-bold text-[10px] transform rotate-[5deg]">✓</span>
                    <div className="h-1 bg-blue-500/80 rounded w-10" />
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#1064ff] font-bold text-[10px] transform scale-90">✕</span>
                    <div className="h-1 bg-gray-300 rounded w-8" />
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#1064ff] font-bold text-[10px]">✓</span>
                    <div className="h-1 bg-blue-500/80 rounded w-7" />
                  </div>
                </div>
                <div className="h-1 bg-gray-200 rounded w-1/2 self-end" />
              </div>

              {/* Floating Pen */}
              <div className="absolute bottom-4 left-[-12px] w-4 h-20 bg-[#5094ff] rounded-full transform rotate-[-42deg] shadow-md border border-white/15 flex flex-col justify-between p-0.5 overflow-hidden">
                <div className="w-full h-3 bg-blue-600 rounded-full" />
                <div className="w-full h-6 bg-white/20" />
                <div className="w-full h-1.5 bg-blue-900/30 mt-auto rounded-b-full" />
              </div>
            </div>
          </div>

          {/* Bottom Branding Text */}
          <div className="space-y-2 relative z-10">
            <h2 className="text-2xl font-light text-white tracking-wide">Welcome!</h2>
            <p className="text-blue-100/80 text-[11px] leading-relaxed max-w-xs font-light">
              Get a real intranet on top of your Office 365 environment, with SomaConnect.
            </p>
          </div>

        </div>

        {/* Right Side Form Canvas (7/12 Cols) */}
        <div className="col-span-1 md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white h-full overflow-y-auto no-scrollbar">
          {/* 2. Safely forwarding the callback handler down into the login form */}
          <LoginForm onLoginSuccess={onLoginSuccess} />
        </div>

      </div>

    </div>
  );
};