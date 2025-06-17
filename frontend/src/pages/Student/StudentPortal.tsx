import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
    FaHome, 
    FaBook, 
    FaClipboardList, 
    FaBullhorn, 
    FaSignOutAlt,
    FaUserCircle,
    FaUsers,
    FaGraduationCap,
    FaRegListAlt,
    FaClipboard
} from 'react-icons/fa';
import type { IconBaseProps } from 'react-icons';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { getStudentById } from '../../api/studentapi';
import Icon from '../../components/Icon';
import Enrollment from './Enrollment';
import AttendancePage from './AttendancePage';
import ExamRecordsPage from './ExamRecordsPage';
import CourseMaterialsPage from './CourseMaterialsPage';

interface StudentProfile {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    cnic: string;
    program: string;
    section: string;
    enrollment_year: number;
    picture: string | null;
}

interface NavItem {
    label: string;
    path: string;
    icon: any; // Using any type temporarily to fix the issue
}

const navItems: NavItem[] = [
    { 
        label: 'Dashboard', 
        path: '/student', 
        icon: FaHome
    },
    {
        label: 'Course Materials',
        path: '/student/course-materials',
        icon: FaBook
    },
    {
        label: 'Attendance',
        path: '/student/attendance',
        icon: FaClipboardList
    },
    {
        label: 'Exam Records',
        path: '/student/exam-records',
        icon: FaGraduationCap
    },
    {
        label: 'Enrollment',
        path: '/student/enrollment',
        icon: FaClipboard
    },

    { 
        label: 'Announcements', 
        path: '/student/announcements', 
        icon: FaBullhorn
    },
    { 
        label: 'Logout', 
        path: '#', 
        icon: FaSignOutAlt
    },
];

const StudentPortal: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                const token = sessionStorage.getItem('studentToken');
                if (!token) {
                    toast.error("No authentication token found. Please log in.");
                    navigate('/login?role=student');
                    return;
                }
                const decodedToken: { sub: string } = jwtDecode(token);
                const studentId = decodedToken.sub;

                const response = await getStudentById(studentId);
                setStudentProfile(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching student profile:", err);
                setError("Failed to load student profile.");
                toast.error("Failed to load student profile.");
                setLoading(false);
            }
        };

        fetchStudentProfile();
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('studentToken');
        toast.info("Logged out successfully.");
        navigate('/login?role=student');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 text-white flex flex-col py-6 px-4">
                <div className="text-2xl font-extrabold mb-8 tracking-wide">LMS Student</div>
                <nav className="flex-1">
                    <ul className="space-y-2">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            if (item.label === 'Logout') {
                                return (
                                    <li key={item.path}>
                                        <button
                                            onClick={handleLogout}
                                            className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md text-left ${
                                                // 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                 
                                                'text-gray-300 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <IconComponent className="h-5 w-5 mr-2" />
                                            {item.label}
                                        </button>
                                    </li>
                                );
                            }
                            return (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path === '/student/attendance' || item.path === '/student/exam-records' || item.path === '/student/course-materials' ? `${item.path}/${studentProfile?.student_id}` : item.path}
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                                isActive
                                                    // ? 'bg-gray-100 text-gray-900'
                                                    // : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                      ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-300 hover:bg-gray-50 hover:text-gray-900'
                                            }`
                                        }
                                        end={item.path === '/student'}
                                    >
                                        <IconComponent className="h-5 w-5 mr-2" />
                                        {item.label}
                                    </NavLink>
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
                                    <h1 className="text-3xl font-bold text-slate-800 mb-1">Welcome, {studentProfile?.first_name || 'Student'} {studentProfile?.last_name || ''}</h1>
                                </div>
                            </div>

                            {/* Student Profile Card */}
                            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                                <div className="flex items-center mb-6">
                                    {studentProfile?.picture ? (
                                        <img src={`http://localhost:8000/upload/${studentProfile.picture}`} alt="Student" className="w-28 h-28 object-cover rounded-full mr-6 shadow-md" />
                                    ) : (
                                        <Icon icon={FaUserCircle} className="w-28 h-28 text-gray-400 mr-6" />
                                    )}
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-800">{studentProfile?.first_name} {studentProfile?.last_name}</h2>
                                        <p className="text-gray-600 text-lg">ID: {studentProfile?.student_id}</p>
                                    </div>
                                </div>
                                {loading ? (
                                    <p className="text-gray-600">Loading profile details...</p>
                                ) : error ? (
                                    <p className="text-red-500">{error}</p>
                                ) : studentProfile ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-700">
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">Email:</strong> {studentProfile.email}</p>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">Phone:</strong> {studentProfile.phone_number}</p>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">CNIC:</strong> {studentProfile.cnic}</p>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">Program:</strong> {studentProfile.program}</p>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">Section:</strong> {studentProfile.section}</p>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">Enrollment Year:</strong> {studentProfile.enrollment_year}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-600">No profile data available.</p>
                                )}
                            </div>
                        </>
                    } />
                    <Route path="announcements" element={<div className="bg-white rounded-xl shadow p-6">Student Announcements Page (To be implemented)</div>} />
                    <Route path="enrollment" element={<Enrollment />} />
                    <Route path="attendance/:studentId" element={<AttendancePage />} />
                    <Route path="exam-records/:studentId" element={<ExamRecordsPage />} />
                    <Route path="course-materials/:studentId" element={<CourseMaterialsPage />} />
                </Routes>
            </main>
        </div>
    );
};

export default StudentPortal; 