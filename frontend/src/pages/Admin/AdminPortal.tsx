import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    FaHome, 
    FaChalkboardTeacher, 
    FaUserGraduate, 
    FaBuilding, 
    FaBook, 
    FaClipboardList, 
    FaBullhorn, 
    FaChartBar, 
    FaCog, 
    FaSignOutAlt,
    FaUsers,
    FaBars
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { toast } from 'react-toastify';
import ManageInstructors from './ManageInstructors';
import ManageStudents from './ManageStudents';
import ManageSections from './ManageSections';
import ManageSettings from './ManageSettings';
import ManageCourses from './ManageCourses';
import ManageDepartments from './ManageDepartments';
import ManageReports from './ManageReports'
import ManageAnnouncements from './ManageAnnouncements';
import StudentEnrollmentManagement from './StudentEnrollmentManagement';
import Icon from '../../components/Icon';
// Import API functions
import { getInstructors } from '../../api/instructorapi';
import { getStudents } from '../../api/studentapi';
import { getdepartments } from '../../api/departmentapi';
import { getCourses } from '../../api/courseapi';

interface NavItem {
    label: string;
    path: string;
    icon: IconType;
}

interface DashboardCard {
    label: string;
    value: number;
    icon: IconType;
    color: string;
    textColor: string;
}

const navItems: NavItem[] = [
    { 
        label: 'Dashboard', 
        path: '/admin', 
        icon: FaHome
    },
    { 
        label: 'Manage Instructors', 
        path: '/admin/instructors', 
        icon: FaChalkboardTeacher
    },
    { 
        label: 'Manage Students', 
        path: '/admin/students', 
        icon: FaUserGraduate
    },
    { 
        label: 'Manage Departments', 
        path: '/admin/departments', 
        icon: FaBuilding
    },
    { 
        label: 'Manage Courses', 
        path: '/admin/courses', 
        icon: FaBook
    },
    { 
        label: 'Manage Sections', 
        path: '/admin/sections', 
        icon: FaClipboardList
    },
    { 
        label: 'Announcements', 
        path: '/admin/announcements', 
        icon: FaBullhorn
    },
    { 
        label: 'Reports', 
        path: '/admin/reports', 
        icon: FaChartBar
    },
    { 
        label: 'Settings', 
        path: '/admin/settings', 
        icon: FaCog
    },
    { 
        label: 'Logout', 
        path: '#', 
        icon: FaSignOutAlt
    },
];

const AdminPortal: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [instructorCount, setInstructorCount] = useState<number>(0);
    const [studentCount, setStudentCount] = useState<number>(0);
    const [courseCount, setCourseCount] = useState<number>(0);
    const [departmentCount, setDepartmentCount] = useState<number>(0);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        toast.info("Logged out successfully.");
        navigate('/login?role=admin');
    };

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
    const dashboardCards: DashboardCard[] = [
        {
            label: 'Instructors',
            value: instructorCount,
            icon: FaUsers,
            color: 'bg-gradient-to-br from-blue-200 to-blue-400',
            textColor: 'text-gray-800'
        },
        {
            label: 'Students',
            value: studentCount,
            icon: FaUserGraduate,
            color: 'bg-gradient-to-br from-red-200 to-red-400',
            textColor: 'text-gray-800'
        },
        {
            label: 'Courses',
            value: courseCount,
            icon: FaBook,
            color: 'bg-gradient-to-br from-green-200 to-green-400',
            textColor: 'text-gray-800'
        },
        {
            label: 'Departments',
            value: departmentCount,
            icon: FaBars,
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
                        {navItems.map((item) => {
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                            location.pathname === item.path
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-300 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon icon={item.icon} className="h-5 w-5 mr-2" />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {dashboardCards.map((card) => {
                                    return (
                                        <div key={card.label} className={`${card.color} rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center transform transition duration-300 hover:scale-105 hover:shadow-lg`}>
                                            <div className={`${card.textColor} text-lg font-medium mb-2`}>{card.label}</div>
                                            <div className={`${card.textColor} opacity-75 mb-4`}>
                                                <Icon icon={card.icon} className="h-12 w-12" />
                                            </div>
                                            <div className="text-gray-700 text-5xl font-bold">
                                                {card.value}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    } />
                    <Route path="instructors" element={<ManageInstructors />} />
                    <Route path="students" element={<ManageStudents />} />
                    <Route path="departments" element={<ManageDepartments />} />
                    <Route path="courses" element={<ManageCourses />} />
                    <Route path="sections" element={<ManageSections />} />
                    <Route path="reports" element={<ManageReports />} />
                    <Route path="settings" element={<ManageSettings />} />
                    <Route path="announcements" element={<ManageAnnouncements />} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminPortal; 