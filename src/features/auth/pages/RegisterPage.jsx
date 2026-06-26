import React, { useState } from 'react';
import logo from '../../../assets/2.png';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../../services/api';

export const RegisterPage = ({ onToggleMode }) => {
  const [activePath, setActivePath] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    nationalId: '',
    institution: '',
    studentId: '',
    major: '',
    accreditationId: '',
    vatTin: '',
    numberOfStudents: '',
    schoolCode: '',
    principalName: '',
    numberOfTeachers: '',
  });

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        registrationPath: activePath,
      };

      if (activePath === 'Individual') {
        payload.nationalId = formData.nationalId || undefined;
        payload.highestEducation = formData.major || undefined;
      } else if (activePath === 'Intern') {
        payload.institution = formData.institution || undefined;
        payload.studentId = formData.studentId || undefined;
        payload.major = formData.major || undefined;
      } else if (activePath === 'University') {
        payload.institution = formData.institution || undefined;
        payload.accreditationId = formData.accreditationId || undefined;
        payload.vatTin = formData.vatTin || undefined;
        payload.numberOfStudents = formData.numberOfStudents ? parseInt(formData.numberOfStudents) : undefined;
      } else if (activePath === 'Secondary') {
        payload.institution = formData.institution || undefined;
        payload.schoolCode = formData.schoolCode || undefined;
        payload.principalName = formData.principalName || undefined;
        payload.numberOfTeachers = formData.numberOfTeachers ? parseInt(formData.numberOfTeachers) : undefined;
      }

      await authService.register(payload);
      setSuccessMessage('Registration successful! You can now log in.');
      setTimeout(() => {
        onToggleMode();
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "w-full bg-transparent border-b-2 border-gray-300 py-3 px-1 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#1660FF] transition-all duration-300 mb-6";

  const renderFormContent = () => {
    if (!activePath) return null;

    const forms = {
      Individual: [
        { key: 'name', label: 'Full Name' },
        { key: 'nationalId', label: 'National ID / Passport' },
        { key: 'phone', label: 'Phone Number (Momo)' },
        { key: 'email', label: 'Email Address' },
        { key: 'password', label: 'Password', type: 'password' },
        { key: 'confirmPassword', label: 'Confirm Password', type: 'password' },
        { key: 'major', label: 'Highest Education' },
      ],
      Intern: [
        { key: 'name', label: 'Full Name' },
        { key: 'institution', label: 'Current School Name' },
        { key: 'studentId', label: 'Student ID Number' },
        { key: 'email', label: 'Email Address' },
        { key: 'password', label: 'Password', type: 'password' },
        { key: 'confirmPassword', label: 'Confirm Password', type: 'password' },
        { key: 'major', label: 'Major / Department' },
        { key: 'phone', label: 'Phone Number' },
      ],
      University: [
        { key: 'name', label: 'Contact Person Name' },
        { key: 'institution', label: 'University Name' },
        { key: 'accreditationId', label: 'Accreditation ID' },
        { key: 'vatTin', label: 'VAT/TIN Number' },
        { key: 'email', label: 'Email Address' },
        { key: 'password', label: 'Password', type: 'password' },
        { key: 'confirmPassword', label: 'Confirm Password', type: 'password' },
        { key: 'numberOfStudents', label: 'Number of Students' },
      ],
      Secondary: [
        { key: 'name', label: 'Contact Person Name' },
        { key: 'institution', label: 'School Name' },
        { key: 'schoolCode', label: 'School Code (MINEDUC)' },
        { key: 'principalName', label: "Principal's Name" },
        { key: 'email', label: 'Email Address' },
        { key: 'password', label: 'Password', type: 'password' },
        { key: 'confirmPassword', label: 'Confirm Password', type: 'password' },
        { key: 'numberOfTeachers', label: 'Number of Teachers' },
      ],
    };

    return (
      <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="w-full">
        <h2 className="text-2xl font-bold text-[#1660FF] mb-6">{activePath} Registration</h2>

        {errorMessage && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="mb-4 text-xs text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{successMessage}</div>
        )}

        <form onSubmit={handleSubmitRegistration}>
          {forms[activePath].map((field) => (
            <input
              key={field.key}
              type={field.type || 'text'}
              required={field.key === 'name' || field.key === 'email' || field.key === 'password' || field.key === 'confirmPassword'}
              value={formData[field.key]}
              onChange={handleChange(field.key)}
              className={inputStyle}
              placeholder={field.label}
            />
          ))}
          <button
            type="submit"
            disabled={isSubmitting || !!successMessage}
            className="w-full bg-[#1660FF] text-white p-3.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? 'Registering...' : 'Complete Registration'}
          </button>
          <button
            type="button"
            onClick={() => { setActivePath(null); setErrorMessage(''); setSuccessMessage(''); }}
            className="w-full mt-4 text-sm text-gray-500 hover:underline"
          >
            Back to selection
          </button>
        </form>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans antialiased">
      <div className="hidden md:flex relative flex-col justify-center items-center w-3/5 bg-[#1660FF] text-white p-20 [clip-path:polygon(0_0,100%_0,88%_100%,0_100%)] z-10 overflow-hidden">
        <div className="absolute top-[20%] right-[20%] w-32 h-32 bg-white/10 rounded-3xl rotate-12 backdrop-blur-md animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-[20%] left-[10%] w-20 h-20 bg-cyan-400/20 rounded-full backdrop-blur-md animate-[bounce_8s_ease-in-out_infinite]" />
        <div className="absolute top-12 left-12"><img src={logo} alt="SomaConnect" className="h-12 w-auto brightness-0 invert" /></div>

        <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="max-w-md relative z-20">
          <h2 className="text-5xl font-extrabold tracking-tight">Join the Network.</h2>
          <p className="text-blue-100/80 mt-6">Select your path to get started with AI-verified excellence in Rwanda.</p>
        </motion.div>
      </div>

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
