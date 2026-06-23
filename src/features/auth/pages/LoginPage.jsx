import React, { useState, useEffect } from 'react';
import { LoginForm } from '../components/LoginForm';
import logo from '../../../assets/2.png'; 

export const LoginPage = ({ onLoginSuccess }) => {
  const slides = [
    {
      title: "Connect Your Workspace",
      description: "Transform your team's day-to-day with a centralized hub built directly over your existing Office 365 cloud environment."
    },
    {
      title: "Work Harder, Smarter",
      description: "Access shared assets, track corporate benchmarks, and build a unified directory that bridges cross-functional communication."
    },
    {
      title: "Your True Intranet",
      description: "Empower your organization with localized knowledge management platforms, real-time sync networks, and custom portals."
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Helper function to render the specific graphic for each active slide state
  const renderIllustration = () => {
    switch (currentSlide) {
      case 0:
        return (
          /* Slide 1: Clipboard & Pen Checklist Graphic */
          <div className="relative w-48 h-48 flex items-center justify-center animate-fadeIn">
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
        );
      case 1:
        return (
          /* Slide 2: Analytics Tracking Dashboard Graphic */
          <div className="relative w-48 h-48 flex items-center justify-center animate-fadeIn">
            <div className="absolute w-[140px] h-[110px] bg-[#1a4cb0] rounded-xl shadow-lg border border-blue-400/20 p-3 flex flex-col justify-between">
              <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                <div className="h-2 bg-white/40 rounded w-12" />
                <div className="h-2 bg-blue-400 rounded w-6" />
              </div>
              {/* Bar charts */}
              <div className="flex items-end space-x-2 h-12 pt-2 justify-center">
                <div className="w-3 bg-gray-300/40 rounded-t-sm h-[40%]" />
                <div className="w-3 bg-white/80 rounded-t-sm h-[75%]" />
                <div className="w-3 bg-blue-400 rounded-t-sm h-[95%] shadow-md shadow-blue-500/50" />
                <div className="w-3 bg-white/50 rounded-t-sm h-[60%]" />
              </div>
            </div>
            {/* Floating metric indicator card */}
            <div className="absolute top-4 right-0 bg-white rounded-lg p-2 shadow-xl border border-gray-100 flex items-center space-x-1.5 transform rotate-[6deg]">
              <span className="text-green-500 text-xs font-bold">↑</span>
              <div className="h-2.5 bg-blue-600 rounded w-8" />
            </div>
          </div>
        );
      case 2:
        return (
          /* Slide 3: Connected Node Hub Portal Graphic */
          <div className="relative w-48 h-48 flex items-center justify-center animate-fadeIn">
            {/* Center hub node */}
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-blue-400 z-10">
              <div className="w-8 h-8 bg-blue-600 rounded-full opacity-90" />
            </div>
            
            {/* Connection Paths */}
            <div className="absolute w-28 h-0.5 bg-white/30 rotate-[35deg]" />
            <div className="absolute w-28 h-0.5 bg-white/30 rotate-[-45deg]" />
            
            {/* Branch nodes */}
            <div className="absolute top-6 left-6 w-7 h-7 bg-[#5094ff] rounded-full border border-white/50 shadow" />
            <div className="absolute bottom-8 left-4 w-6 h-6 bg-[#ccdfff] rounded-full shadow" />
            <div className="absolute top-8 right-6 w-8 h-8 bg-white/20 rounded-full border border-white/20 backdrop-blur-sm" />
            <div className="absolute bottom-6 right-8 w-7 h-7 bg-blue-400 rounded-full shadow" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-[#eaf2fc] flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-hidden font-sans tracking-tight antialiased">
      
      <div className="w-full max-w-[1024px] h-full max-h-[620px] md:rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 bg-white">
        
        {/* Left Side Branding Panel (5/12 Cols) */}
        <div className="hidden md:flex md:col-span-5 bg-[#1064ff] p-6 lg:p-8 flex-col justify-between relative overflow-hidden select-none h-full">
          
          {/* Background Accents */}
          <div className="absolute top-[32%] left-[-15%] w-[140%] h-20 bg-white/5 rounded-full rotate-[-15deg] pointer-events-none" />
          <div className="absolute top-[42%] left-[10%] w-20 h-4 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute top-[48%] right-[-5%] w-14 h-4 bg-white/10 rounded-full pointer-events-none" />
          
          {/* Logo Brand Container */}
          <div className="flex items-center space-x-2 text-white relative z-10">
            <img 
              src={logo} 
              alt="SomaConnect Logo" 
              className="h-12 w-auto object-contain brightness-0 invert" 
            />
          </div>

          {/* Centered Illustration - Now fully responsive to state */}
          <div className="relative flex justify-center items-center my-auto z-10 scale-90 lg:scale-95">
            {renderIllustration()}
          </div>

          {/* Dynamic Animated Slideshow Section */}
          <div className="relative z-10 space-y-4 min-h-[140px] flex flex-col justify-end">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight leading-none">
                {slides[currentSlide].title}
              </h2>
              <p className="text-blue-100/90 text-sm font-medium leading-relaxed max-w-sm">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* Slider Indicator Navigation Dots */}
            <div className="flex items-center space-x-2 pt-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                    index === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Right Side Form Canvas */}
        <div className="col-span-1 md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white h-full overflow-y-auto no-scrollbar">
          <LoginForm onLoginSuccess={onLoginSuccess} />
        </div>

      </div>

    </div>
  );
};