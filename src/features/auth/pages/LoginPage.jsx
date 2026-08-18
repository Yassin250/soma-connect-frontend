import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LoginForm } from "../components/LoginForm";
import { BrandLockup } from '../../../components/shared/Brand';

const Wordmark = ({ dark = false }) => <span style={{ '--clr-accent': '#8B5CF6' }}><BrandLockup dark={dark} /></span>;

export const LoginPage = ({ onToggleMode }) => {
  const year = new Date().getFullYear();
  return (
    <div className="h-screen w-full flex bg-white antialiased overflow-hidden">

      {/* Left — full-bleed dark brand panel with diagonal edge */}
      <div className="hidden md:flex md:w-[52%] relative flex-col justify-between bg-gradient-to-br from-[#120E1A] via-[#1a1025] to-[#140d1e] text-white p-12 lg:p-20 overflow-hidden [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)] z-10">
        {/* Ambient glow — violet brand accent up top, cool depth toward the middle */}
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#8B5CF6]/20 blur-[100px]" />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-[#120E1A]/40 blur-[100px]" />

        {/* Floating glass shapes near the diagonal */}
        <div className="absolute top-[16%] right-[7%] w-44 h-44 rounded-[2.5rem] border border-white/10 rotate-[18deg]" />
        <div className="absolute top-[29%] right-[15%] w-24 h-24 rounded-[1.5rem] bg-white/[0.05] backdrop-blur-md -rotate-6" />
        <div className="absolute top-[23%] right-[3%] w-11 h-11 rounded-2xl bg-[#8B5CF6]/25 rotate-12" />
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

      {/* Right — form panel, fills remaining height */}
      <div className="w-full md:w-[48%] flex flex-col justify-center p-8 sm:p-16 lg:px-24 bg-white overflow-y-auto">
        {/* Mobile-only brand mark (left panel is hidden below md) */}
        <div className="md:hidden mb-10">
          <Link to="/" className="inline-block" aria-label="Go to Soma Connect landing page">
            <Wordmark dark />
          </Link>
        </div>

        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-md mx-auto"
        >
          <LoginForm onToggleMode={onToggleMode} />
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
