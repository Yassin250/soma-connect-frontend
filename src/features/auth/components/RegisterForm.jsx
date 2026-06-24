import React, { useState } from 'react';

export const RegisterPage = ({ onToggleMode }) => {
  const [selectedPath, setSelectedPath] = useState(null);
  const paths = ['Individual', 'University', 'Secondary', 'Intern'];

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <h1 className="text-4xl font-normal text-[#1660FF] mb-2">Sign Up</h1>
      <p className="text-sm text-gray-500 mb-8">Step 1 of 2: Select your path</p>

      <div className="grid grid-cols-2 gap-4">
        {paths.map((path) => (
          <button
            key={path}
            onClick={() => setSelectedPath(path)}
            className="group relative p-6 border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#1660FF] text-left"
          >
            {/* Sliding Background Layer */}
            <div 
              className={`absolute inset-0 bg-[#1660FF] transition-transform duration-500 ease-out origin-left ${
                selectedPath === path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}
            />
            
            {/* Text label that turns white when background slides in */}
            <span className={`relative font-medium transition-colors duration-300 ${
              selectedPath === path ? 'text-white' : 'text-gray-700 group-hover:text-white'
            }`}>
              {path}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Already have an account?{' '}
        <button onClick={onToggleMode} className="text-[#1660FF] font-semibold hover:underline">
          Log in
        </button>
      </p>
    </div>
  );
};