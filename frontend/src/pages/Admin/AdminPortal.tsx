import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaUsers, FaUserGraduate, FaBook, FaBars, FaHome, FaChalkboardTeacher, FaBuilding, FaClipboardList, FaBullhorn, FaChartBar, FaCog, FaSignOutAlt } from 'react-icons/fa';
import ManageInstructors from './ManageInstructors';
import ManageStudents from './ManageStudents';
import ManageSections from './ManageSections';
import ManageSettings from './ManageSettings';
import ManageCourses from './ManageCourses';
import ManageDepartments from './ManageDepartments';
import ManageAnnouncements from './ManageAnnouncements';
// Import API functions
import { getInstructors } from '../../api/instructorapi';
import { getStudents } from '../../api/studentapi';
import { getdepartments } from '../../api/departmentapi';
import { getCourses } from '../../api/courseapi';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: (<FaHome className="h-5 w-5 mr-2" />) },
  { label: 'Manage Instructors', path: '/admin/instructors', icon: (<FaChalkboardTeacher className="h-5 w-5 mr-2" />) },
  { label: 'Manage Students', path: '/admin/students', icon: (<FaUserGraduate className="h-5 w-5 mr-2" />) },
  { label: 'Manage Departments', path: '/admin/departments', icon: (<FaBuilding className="h-5 w-5 mr-2" />) },
  { label: 'Manage Courses', path: '/admin/courses', icon: (<FaBook className="h-5 w-5 mr-2" />) },
  { label: 'Manage Sections', path: '/admin/sections', icon: (<FaClipboardList className="h-5 w-5 mr-2" />) },
  { label: 'Announcements', path: '/admin/announcements', icon: (<FaBullhorn className="h-5 w-5 mr-2" />) },
  { label: 'Reports', path: '#', icon: (<FaChartBar className="h-5 w-5 mr-2" />) },
  { label: 'Settings', path: '/admin/settings', icon: (<FaCog className="h-5 w-5 mr-2" />) },
  { label: 'Logout', path: '#', icon: (<FaSignOutAlt className="h-5 w-5 mr-2" />) },
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
        <FaUsers className="h-12 w-12" />
      ),
      color: 'bg-gradient-to-br from-blue-200 to-blue-400',
      textColor: 'text-gray-800'
    },
    {
      label: 'Total Students',
      value: studentCount,
      icon: (
        <FaUserGraduate className="h-12 w-12" />
      ),
      color: 'bg-gradient-to-br from-red-200 to-red-400',
      textColor: 'text-gray-800'
    },
    {
      label: 'Total Courses',
      value: courseCount,
      icon: (
        <FaBook className="h-12 w-12" />
      ),
      color: 'bg-gradient-to-br from-green-200 to-green-400',
      textColor: 'text-gray-800'
    },
    {
      label: 'Total Departments',
      value: departmentCount,
      icon: (
        <FaBars className="h-12 w-12" />
      ),
      color: 'bg-gradient-to-br from-purple-200 to-purple-400',
      textColor: 'text-gray-800'
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
                    <div className="text-lg font-semibold ${card.textColor}">{card.label}</div>
                    <div className="mt-2 text-3xl font-extrabold ${card.textColor}">{card.value}</div>
                  </div>
                ))}
              </div>
            </>
          } />
          <Route path="instructors" element={<ManageInstructors />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="departments" element={<ManageDepartments />} />
          <Route path="courses" element={<ManageCourses />} />
          <Route path="sections" element={<ManageSections />} />
          <Route path="settings" element={<ManageSettings />} />
          <Route path="announcements" element={<ManageAnnouncements />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPortal; 