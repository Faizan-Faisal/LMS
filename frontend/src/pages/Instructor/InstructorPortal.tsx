import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    FaHome, 
    FaBullhorn, 
    FaGraduationCap, 
    FaSignOutAlt,
    FaBook,
    FaClipboardList,
    FaChartLine,
    FaUserCircle
} from 'react-icons/fa';
import type { IconBaseProps } from 'react-icons';
import { getInstructorById } from '../../api/instructorapi'; // Import the API function
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import ManageAnnouncements from './ManageAnnouncements';
import CourseManagement from './CourseManagement'; // Import the new CourseManagement component
import Icon from '../../components/Icon';

interface InstructorProfile {
    instructor_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    cnic: string;
    department: string;
    qualification: string;
    specialization: string;
    year_of_experience: number;
    picture: string | null;
}

interface NavItem {
    label: string;
    path: string;
    icon: any; // Using any type temporarily to fix the issue
}

interface DashboardCard {
    label: string;
    description: string;
    icon: any; // Using any type temporarily to fix the issue
    color: string;
    textColor: string;
}

const navItems: NavItem[] = [
    { 
        label: 'Dashboard', 
        path: '/instructor', 
        icon: FaHome
    },
    { 
        label: 'Announcements', 
        path: '/instructor/announcements', 
        icon: FaBullhorn
    },
    { 
        label: 'Course Management', 
        path: '/instructor/courses', 
        icon: FaGraduationCap
    },
    { 
        label: 'Logout', 
        path: '#', 
        icon: FaSignOutAlt
    },
];

const dashboardCards: DashboardCard[] = [
    {
        label: 'My Courses',
        description: 'View and access your enrolled courses',
        icon: FaBook,
        color: 'bg-gradient-to-br from-blue-200 to-blue-400',
        textColor: 'text-gray-800'
    },
    {
        label: 'Assignments',
        description: 'Track and submit your assignments',
        icon: FaClipboardList,
        color: 'bg-gradient-to-br from-green-200 to-green-400',
        textColor: 'text-gray-800'
    },
    {
        label: 'Student Progress',
        description: 'Monitor student performance and grades',
        icon: FaChartLine,
        color: 'bg-gradient-to-br from-purple-200 to-purple-400',
        textColor: 'text-gray-800'
    },
];

const InstructorPortal: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [instructorProfile, setInstructorProfile] = useState<InstructorProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInstructorProfile = async () => {
            try {
                const token = localStorage.getItem('instructorToken');
                if (!token) {
                    toast.error("No authentication token found. Please log in.");
                    navigate('/login?role=instructor');
                    return;
                }
                const decodedToken: { sub: string } = jwtDecode(token);
                const instructorId = decodedToken.sub;

                const response = await getInstructorById(instructorId);
                setInstructorProfile(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching instructor profile:", err);
                setError("Failed to load instructor profile.");
                toast.error("Failed to load instructor profile.");
                setLoading(false);
            }
        };

        fetchInstructorProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('instructorToken');
        toast.info("Logged out successfully.");
        navigate('/login?role=instructor');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 text-white flex flex-col py-6 px-4">
                <div className="text-2xl font-extrabold mb-8 tracking-wide">LMS Instructor</div>
                <nav className="flex-1">
                    <ul className="space-y-2">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
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
                                        <IconComponent className="h-5 w-5 mr-2" />
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
                            <div className="bg-white rounded-xl shadow p-6 mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-800 mb-1">Welcome, {instructorProfile?.first_name || 'Instructor'} {instructorProfile?.last_name || ''}</h1>
                                </div>
                            </div>

                            {/* Instructor Profile Card */}
                            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                                <div className="flex items-center mb-6">
                                    {instructorProfile?.picture ? (
                                        <img src={`http://localhost:8000/upload/${instructorProfile.picture}`} alt="Instructor" className="w-28 h-28 object-cover rounded-full mr-6 shadow-md" />
                                    ) : (
                                        <Icon icon={FaUserCircle} className="w-28 h-28 text-gray-400 mr-6" />
                                    )}
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-800">{instructorProfile?.first_name} {instructorProfile?.last_name}</h2>
                                        <p className="text-gray-600 text-lg">ID: {instructorProfile?.instructor_id}</p>
                                    </div>
                                </div>
                                {loading ? (
                                    <p className="text-gray-600">Loading profile details...</p>
                                ) : error ? (
                                    <p className="text-red-500">{error}</p>
                                ) : instructorProfile ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-700">
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">Email:</strong> {instructorProfile.email}</p>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">Phone:</strong> {instructorProfile.phone_number}</p>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">CNIC:</strong> {instructorProfile.cnic}</p>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">Department:</strong> {instructorProfile.department}</p>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">Qualification:</strong> {instructorProfile.qualification}</p>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">Specialization:</strong> {instructorProfile.specialization}</p>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm">
                                            <p className="text-lg"><strong className="text-gray-800">Experience:</strong> {instructorProfile.year_of_experience} years</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-600">No profile data available.</p>
                                )}
                            </div>
                        </>
                    } />
                    <Route path="profile" element={
                        <div className="bg-white rounded-xl shadow p-6 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Instructor Profile</h2>
                            {loading ? (
                                <p>Loading profile...</p>
                            ) : error ? (
                                <p className="text-red-500">{error}</p>
                            ) : instructorProfile ? (
                                <div className="space-y-4">
                                    <p><strong>Instructor ID:</strong> {instructorProfile.instructor_id}</p>
                                    <p><strong>Name:</strong> {instructorProfile.first_name} {instructorProfile.last_name}</p>
                                    <p><strong>Email:</strong> {instructorProfile.email}</p>
                                    <p><strong>Phone:</strong> {instructorProfile.phone_number}</p>
                                    <p><strong>CNIC:</strong> {instructorProfile.cnic}</p>
                                    <p><strong>Department:</strong> {instructorProfile.department}</p>
                                    <p><strong>Qualification:</strong> {instructorProfile.qualification}</p>
                                    <p><strong>Specialization:</strong> {instructorProfile.specialization}</p>
                                    <p><strong>Years of Experience:</strong> {instructorProfile.year_of_experience}</p>
                                    {instructorProfile.picture && (
                                        <div>
                                            <strong>Picture:</strong> <img src={`http://localhost:8000/upload/${instructorProfile.picture}`} alt="Instructor" className="mt-2 w-32 h-32 object-cover rounded-full" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p>No profile data available.</p>
                            )}
                        </div>
                    } />
                    <Route path="announcements" element={<ManageAnnouncements />} />
                    <Route path="courses" element={<CourseManagement />} />
                </Routes>
            </main>
        </div>
    );
};

export default InstructorPortal; 