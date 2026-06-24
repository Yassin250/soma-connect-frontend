import React from 'react';
import logo from '../../../assets/2.png';
import { motion } from 'framer-motion';
import { LoginForm } from "../components/LoginForm";
import { useAuth } from '../../../context/AuthContext';

export const LoginPage = ({ onToggleMode }) => {
  const { logout } = useAuth();

  React.useEffect(() => {
    // Keep login entry behavior aligned with e-proc flow.
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen w-full flex bg-white font-sans antialiased select-none">
      <div className="hidden md:flex relative flex-col justify-center items-center w-3/5 bg-[#1660FF] text-white p-20 [clip-path:polygon(0_0,100%_0,88%_100%,0_100%)] z-10 overflow-hidden">
        <div className="absolute top-[20%] right-[20%] w-32 h-32 bg-white/10 rounded-3xl rotate-12 backdrop-blur-md animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-[20%] left-[10%] w-20 h-20 bg-cyan-400/20 rounded-full backdrop-blur-md animate-[bounce_8s_ease-in-out_infinite]" />
        <div className="absolute top-12 left-12"><img src={logo} alt="SomaConnect" className="h-12 w-auto object-contain brightness-0 invert" /></div>
        <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="max-w-md text-left transform -translate-x-10 space-y-6 relative z-20">
          <h2 className="text-5xl font-extrabold tracking-tight leading-tight">Learn with Integrity, Lead with Opportunity.</h2>
          <p className="text-blue-100/80 text-base leading-relaxed font-medium">Bridging the gap between Rwandan classrooms and the global job market through AI-verified excellence.</p>
        </motion.div>
      </div>

      <div className="w-full md:w-2/5 flex flex-col justify-center p-8 sm:p-16 lg:px-20 bg-white">
        <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="w-full max-w-[400px] mx-auto">
          <LoginForm onToggleMode={onToggleMode} />
          <div className="mt-12" />
        </motion.div>
      </div>
    </div>
  );
};
export default LoginPage;