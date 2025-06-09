import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ManageInstructors from './ManageInstructors';
import ManageStudents from './ManageStudents';
import ManageSections from './ManageSections';
import ManageSettings from './ManageSettings';
import ManageCourses from './ManageCourses';
// Import API functions
import { getInstructors } from '../../api/instructorapi';
import { getStudents } from '../../api/studentapi';
import { getdepartments } from '../../api/departmentapi';
import { getCourses } from '../../api/courseapi';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" /></svg>
  ) },
  { label: 'Manage Instructors', path: '/admin/instructors', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ) },
  { label: 'Manage Students', path: '/admin/students', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" /></svg>
  ) },
  { label: 'Manage Departments', path: '/admin/departments', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" /></svg>
  ) },
  { label: 'Manage Courses', path: '/admin/courses', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0 0H3" /></svg>
  ) },
  { label: 'Manage Sections', path: '/admin/sections', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
  ) },
  { label: 'Announcements', path: '#', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6m14 0a2 2 0 01-2 2H7a2 2 0 01-2-2m14 0V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6m14 0v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" /></svg>
  ) },
  { label: 'Reports', path: '#', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2h-2a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>
  ) },
  { label: 'Settings', path: '/admin/settings', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19a7 7 0 100-14 7 7 0 000 14z" /></svg>
  ) },
  { label: 'Logout', path: '#', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
  ) },
];

const AdminPortal: React.FC = () => {
  const location = useLocation();
  const [instructorCount, setInstructorCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);

  // Fetch counts on component mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [instructorsRes, studentsRes, departmentsRes, coursesRes] = await Promise.all([
          getInstructors(),
          getStudents(),
          getdepartments(),
          getCourses(),
        ]);

        setInstructorCount(instructorsRes.data.length); // Assuming API returns an array
        setStudentCount(studentsRes.data.length); // Assuming API returns an array
        setDepartmentCount(departmentsRes.data.length); // Assuming API returns an array
        setCourseCount(coursesRes.data.length); // Assuming API returns an array

      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
        // Optionally show a toast error here
      }
    };

    fetchCounts();
  }, []); // Empty dependency array means this effect runs once on mount

  // Updated dashboardCards to use state and enhanced styling with gradients, borders, and centered content
  const dashboardCards = [
    {
      label: 'Total Instructors',
      value: instructorCount,
      icon: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17.25a.75.75 0 00-.26-.615l-5.396-4.593A8.75 8.75 0 003 16.5V18h9v-.75a.75.75 0 00-.26-.615z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 11.25v-1.5a3.75 3.75 0 10-7.5 0v1.5m7.5 0L21 21m-3-9L18 21m-3 0l-3 0m0 0h-2.25m-1.5 0h-2.25m-1.5 0h-2.25M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      ),
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
      textColor: 'text-white'
    },
    {
      label: 'Total Students',
      value: studentCount,
      icon: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" /></svg>
      ),
      color: 'bg-gradient-to-br from-red-400 to-red-600',
      textColor: 'text-white'
    },
    {
      label: 'Total Courses',
      value: courseCount,
      icon: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.247m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.247" /></svg>
      ),
      color: 'bg-gradient-to-br from-green-400 to-green-600',
      textColor: 'text-white'
    },
    {
      label: 'Total Departments',
      value: departmentCount,
      icon: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
      ),
      color: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      textColor: 'text-white'
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col py-6 px-4">
        <div className="text-2xl font-extrabold mb-8 tracking-wide">LMS Admin</div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item, idx) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg hover:bg-slate-700 transition font-medium ${location.pathname === item.path ? 'bg-slate-700' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={
            <>
              {/* Top Bar */}
              <div className="bg-white rounded-xl shadow p-6 mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-1">Welcome, Admin</h1>
                </div>
                <div className="bg-slate-200 rounded-full p-3">
                  <svg className="h-7 w-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              </div>
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {dashboardCards.map(card => (
                  <div key={card.label} className={`rounded-xl shadow ${card.color} border border-white p-8 flex flex-col items-center transition hover:scale-105`}>
                    <div className={`h-12 w-12 mb-4 ${card.textColor}`}>
                      {card.icon}
                    </div>
                    <div className="text-lg font-semibold text-white">{card.label}</div>
                    <div className="mt-2 text-3xl font-extrabold text-white">{card.value}</div>
                  </div>
                ))}
              </div>
            </>
          } />
          <Route path="instructors" element={<ManageInstructors />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="courses" element={<ManageCourses />} />
          <Route path="sections" element={<ManageSections />} />
          <Route path="settings" element={<ManageSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPortal; 