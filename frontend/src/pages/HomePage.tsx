import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import universityLogo from '../numl_logo.png';
import universityLogo from '../numl_logo (2).png';

const HomePage = () => {
  const navigate = useNavigate();

  const fullText = "NATIONAL UNIVERSITY OF MODERN LANGUAGES";
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[index]);
        setIndex((prev) => prev + 1);
      }, 75); // Adjust delay as needed for speed
      return () => clearTimeout(timeout);
    }
  }, [index, fullText]);

  const loginOptions = [
    {
      title: 'Student Login',
      icon: (
        // <svg className="w-14 h-14 mx-auto mb-2 text-lmsblue" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25v-1.5A2.25 2.25 0 016.75 16.5h10.5a2.25 2.25 0 012.25 2.25v1.5" /></svg>
        <svg className="w-14 h-14 mx-auto mb-2 text-lmsblue" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25c2.485 0 4.5-2.015 4.5-4.5S14.485 5.25 12 5.25 7.5 7.265 7.5 9.75s2.015 4.5 4.5 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 20.25v-1.5A2.25 2.25 0 0017.25 16.5h-10.5A2.25 2.25 0 004.5 18.75v1.5" /></svg>
      ),
      description: 'Access your courses, assignments, and grades    STUDENT PORTAL' ,
      color: 'bg-lmsblue',
      role: 'student',
    },
    {
      title: 'Instructor Login',
      icon: (
        <svg className="w-14 h-14 mx-auto mb-2 text-lmsblue" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25c2.485 0 4.5-2.015 4.5-4.5S14.485 5.25 12 5.25 7.5 7.265 7.5 9.75s2.015 4.5 4.5 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 20.25v-1.5A2.25 2.25 0 0017.25 16.5h-10.5A2.25 2.25 0 004.5 18.75v1.5" /></svg>
      ),
      description: 'Manage your courses and student progress    INSTRUCTOR PORTAL',
      color: 'bg-lmsblue',
      role: 'instructor',
    },
    {
      title: 'Admin Login',
      icon: (
        // <svg className="w-14 h-14 mx-auto mb-2 text-lmsblue-dark" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 20.25v-1.5A2.25 2.25 0 0017.25 16.5h-10.5A2.25 2.25 0 004.5 18.75v1.5" /></svg>
        <svg className="w-14 h-14 mx-auto mb-2 text-lmsblue" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25c2.485 0 4.5-2.015 4.5-4.5S14.485 5.25 12 5.25 7.5 7.265 7.5 9.75s2.015 4.5 4.5 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 20.25v-1.5A2.25 2.25 0 0017.25 16.5h-10.5A2.25 2.25 0 004.5 18.75v1.5" /></svg>      
      ),
      description: 'System administration and management      ADMIN PORTAL',
      color: 'bg-lmsblue',
      role: 'admin',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-lmsblue-dark to-lmsblue pt-24 pb-16 overflow-y-auto">
      <img src={universityLogo} alt="National University of Modern Languages Logo" className="mx-auto max-w-[200px] mb-8" />
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-wide whitespace-nowrap drop-shadow">
          {displayedText}
        </h1>
        <h2 className="text-md md:text-lg text-white/80 tracking-widest font-semibold">NUML LMS</h2>
      </div>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {loginOptions.map((option) => (
          <div
            key={option.title}
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform duration-200 group"
          >
            <svg className="w-12 h-12 mx-auto mb-1 text-lmsblue" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25c2.485 0 4.5-2.015 4.5-4.5S14.485 5.25 12 5.25 7.5 7.265 7.5 9.75s2.015 4.5 4.5 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 20.25v-1.5A2.25 2.25 0 0017.25 16.5h-10.5A2.25 2.25 0 004.5 18.75v1.5" /></svg>
            <h3 className="text-xl font-bold text-gray-800 mb-1.5 text-center">{option.title}</h3>
            <p className="text-gray-500 text-sm text-center mb-4">{option.description}</p>
            <button
              className={`w-full py-2 px-6 rounded-lg text-white font-semibold shadow-md transition duration-200 ${option.color} hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-lmsblue`}
              onClick={() => navigate(`/login?role=${option.role}`)}
            >
              Login
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage; 