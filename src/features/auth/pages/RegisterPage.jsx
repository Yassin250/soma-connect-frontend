import React, { useState } from 'react';
import logo from '../../../assets/2.png';
import { motion, AnimatePresence } from 'framer-motion';

export const RegisterPage = ({ onToggleMode }) => {
  const [activePath, setActivePath] = useState(null);

  const inputStyle = "w-full bg-transparent border-b-2 border-gray-300 py-3 px-1 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#1660FF] transition-all duration-300 mb-6";

  const renderFormContent = () => {
    if (!activePath) return null;
    
    // Forms specific to your logic requirements
    const forms = {
      Individual: ["Full Name", "National ID / Passport", "Phone Number (Momo)", "Highest Education"],
      Intern: ["Current School Name", "Student ID Number", "Major / Department"],
      University: ["University Name", "Accreditation ID", "VAT/TIN Number", "Number of Students"],
      Secondary: ["School Name", "School Code (MINEDUC)", "Principal's Name", "Number of Teachers"]
    };

    return (
      <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="w-full">
        <h2 className="text-2xl font-bold text-[#1660FF] mb-6">{activePath} Details</h2>
        {forms[activePath].map((field) => <input key={field} className={inputStyle} placeholder={field} />)}
        <button className="w-full bg-[#1660FF] text-white p-3.5 rounded-lg font-bold hover:bg-blue-700">Complete Registration</button>
        <button onClick={() => setActivePath(null)} className="w-full mt-4 text-sm text-gray-500 hover:underline">Back to selection</button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans antialiased">
      {/* LEFT SIDE: Branding Panel */}
      <div className="hidden md:flex relative flex-col justify-center items-center w-3/5 bg-[#1660FF] text-white p-20 [clip-path:polygon(0_0,100%_0,88%_100%,0_100%)] z-10 overflow-hidden">
        <div className="absolute top-[20%] right-[20%] w-32 h-32 bg-white/10 rounded-3xl rotate-12 backdrop-blur-md animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-[20%] left-[10%] w-20 h-20 bg-cyan-400/20 rounded-full backdrop-blur-md animate-[bounce_8s_ease-in-out_infinite]" />
        <div className="absolute top-12 left-12"><img src={logo} alt="SomaConnect" className="h-12 w-auto brightness-0 invert" /></div>
        
        <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="max-w-md relative z-20">
          <h2 className="text-5xl font-extrabold tracking-tight">Join the Network.</h2>
          <p className="text-blue-100/80 mt-6">Select your path to get started with AI-verified excellence in Rwanda.</p>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Path Selection & Form */}
      <div className="w-full md:w-2/5 flex flex-col justify-center p-8 lg:px-20 bg-white">
        <AnimatePresence mode="wait">
          {!activePath ? (
            <motion.div key="select" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} className="w-full max-w-[400px] mx-auto">
              <h1 className="text-4xl text-[#1660FF] mb-10">Sign Up</h1>
              <div className="grid grid-cols-2 gap-4">
                {['Individual', 'University', 'Secondary', 'Intern'].map((path) => (
                  <button key={path} onClick={() => setActivePath(path)} className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#1660FF] text-gray-700 font-bold transition-all">
                    {path}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" className="w-full max-w-[400px] mx-auto">
              {renderFormContent()}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-24 text-sm text-gray-500">Already have an account? <button onClick={onToggleMode} className="text-[#1660FF] font-semibold hover:underline">Log in</button></p>
        <div className="mt-10" />
      </div>
    </div>
  );
};

export default RegisterPage;