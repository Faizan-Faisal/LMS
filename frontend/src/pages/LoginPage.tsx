import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginInstructor } from '../api/instructorAuthApi';
import { loginStudent } from '../api/studentAuthApi';
import { loginAdmin } from '../api/adminAuthApi';
import { toast } from 'react-toastify';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  // Check for both 'type' and 'role' in the query string
  const params = new URLSearchParams(location.search);
  const userType = params.get('type') || params.get('role') || 'student';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      switch (userType) {
        case 'admin':
          const adminData = await loginAdmin(username, password);
          toast.success('Login successful!');
          sessionStorage.setItem('adminToken', adminData.admin_id || '1');
          sessionStorage.removeItem('instructorToken');
          sessionStorage.removeItem('studentToken');
          navigate('/admin');
          break;
        case 'instructor':
          const instructorData = await loginInstructor(username, password);
          console.log('Instructor login successful:', instructorData);
          toast.success('Login successful!');
          sessionStorage.setItem('instructorToken', instructorData.access_token);
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('studentToken');
          navigate('/instructor');
          break;
        case 'student':
          const studentData = await loginStudent(username, password);
          console.log('Student login successful:', studentData);
          toast.success('Login successful!');
          sessionStorage.setItem('studentToken', studentData.access_token);
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('instructorToken');
          navigate('/student');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail || 'An unexpected error occurred during login.');
      } else {
        setError('An unexpected error occurred during login.');
      }
      toast.error(error);
    }
  };

  // Dynamic styles and icons for each portal
  const portalStyles = {
    admin: {
      gradient: 'from-purple-500 via-pink-500 to-purple-800',
      button: 'bg-gradient-to-r from-purple-600 to-pink-600',
      icon: (
        <svg className="h-14 w-14 text-purple-700 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" /></svg>
      ),
      label: 'Admin Portal',
      text: 'text-purple-800',
    },
    instructor: {
      gradient: 'from-blue-500 via-cyan-400 to-blue-800',
      button: 'bg-gradient-to-r from-blue-600 to-cyan-500',
      icon: (
        <svg className="h-14 w-14 text-blue-700 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 7v-6m0 0l-9-5m9 5l9-5" /></svg>
      ),
      label: 'Instructor Portal',
      text: 'text-blue-800',
    },
    student: {
      gradient: 'from-green-500 via-lime-400 to-green-800',
      button: 'bg-gradient-to-r from-green-600 to-lime-500',
      icon: (
        <svg className="h-14 w-14 text-green-700 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 7v-6m0 0l-9-5m9 5l9-5" /></svg>
      ),
      label: 'Student Portal',
      text: 'text-green-800',
    },
  };
  const portal = portalStyles[userType as keyof typeof portalStyles] || portalStyles.student;

  // User icon for username field
  const userIcon = (
    <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className={`rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br ${portal.gradient} p-1`}>
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center">
            <div className="flex flex-col items-center mb-6">
              {portal.icon}
              <h2 className={`text-3xl font-extrabold mb-1 mt-3 tracking-tight ${portal.text}`}>{portal.label}</h2>
              <p className="text-base text-gray-600 font-medium">Welcome back! Please login to your account.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <div>
                <label htmlFor="username" className="block text-base font-semibold text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-300 focus:border-transparent text-base transition duration-200"
                    placeholder="Enter your username"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-300 focus:border-transparent text-base transition duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {error && (
                   <div className="text-red-500 text-base text-center bg-red-50 p-3 rounded-lg font-semibold">{error}</div>
                  )}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-base text-gray-700">Remember me</label>
                  </div>
                  <a href="#" className="text-base text-blue-600 hover:text-blue-800 font-semibold">Forgot password?</a>
                  </div>
              <button
                type="submit"
                className={`w-full py-3 px-3 rounded-xl text-xl font-bold text-white shadow-lg transform transition-transform duration-200 ${portal.button} hover:scale-105 hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-400`}
              >
                Sign In
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => navigate('/')} className="text-base text-gray-600 hover:text-gray-800 font-semibold">← Back to Home</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 

