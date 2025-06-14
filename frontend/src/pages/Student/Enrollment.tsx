import React, { useState, useEffect } from 'react';
import { CourseOfferingResponse, getCourseOfferingsBySectionDetails } from '../../api/CourseOfferingApi';
import { createStudentEnrollment, getStudentEnrollments, deleteStudentEnrollment, StudentCourseEnrollmentResponse, StudentCourseEnrollmentCreate } from '../../api/StudentEnrollmentApi';
import { getStudentById } from '../../api/studentapi';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string; // student_id
}

const Enrollment: React.FC = () => {
    const [availableOfferings, setAvailableOfferings] = useState<CourseOfferingResponse[]>([]);
    const [myEnrollments, setMyEnrollments] = useState<StudentCourseEnrollmentResponse[]>([]);
    const [loadingAvailable, setLoadingAvailable] = useState<boolean>(true);
    const [loadingMyEnrollments, setLoadingMyEnrollments] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [studentId, setStudentId] = useState<string | null>(null);
    const [studentSection, setStudentSection] = useState<string | null>(null);
    const [enrollmentOpen, setEnrollmentOpen] = useState<boolean>(true); // Placeholder, should come from backend

    useEffect(() => {
        const token = sessionStorage.getItem('studentToken');
        if (token) {
            try {
                const decoded: DecodedToken = jwtDecode(token);
                setStudentId(decoded.sub);
            } catch (err) {
                console.error("Error decoding student token:", err);
                toast.error("Authentication error. Please log in again.");
            }
        } else {
            toast.error("No student token found. Please log in.");
        }
    }, []);

    useEffect(() => {
        if (studentId) {
            fetchStudentProfileAndOfferings(studentId);
            fetchMyEnrollments(studentId);
        }
    }, [studentId]);

    const fetchStudentProfileAndOfferings = async (sId: string) => {
        setLoadingAvailable(true);
        try {
            const profileRes = await getStudentById(sId);
            const section = profileRes.data.section;
            setStudentSection(section);
            // Fetch only offerings for this section
            const offeringsRes = await getCourseOfferingsBySectionDetails(section);
            setAvailableOfferings(offeringsRes.data);
        } catch (err) {
            console.error("Failed to fetch student profile or course offerings:", err);
            setError("Failed to load available courses. Please try again.");
            toast.error("Failed to load available courses.");
        } finally {
            setLoadingAvailable(false);
        }
    };

    const fetchMyEnrollments = async (sId: string) => {
        setLoadingMyEnrollments(true);
        try {
            const data = await getStudentEnrollments(sId);
            setMyEnrollments(data);
        } catch (err) {
            console.error("Failed to fetch my enrollments:", err);
            setError("Failed to load your enrollments. Please try again.");
            toast.error("Failed to load your enrollments.");
        } finally {
            setLoadingMyEnrollments(false);
        }
    };

    const handleEnroll = async (offeringId: number) => {
        if (!studentId) {
            toast.error("Student not authenticated.");
            return;
        }
        if (myEnrollments.some(enrollment => enrollment.offering_id === offeringId)) {
            toast.info("You are already enrolled in this course.");
            return;
        }
        if (!enrollmentOpen) {
            toast.error("Enrollment period is closed.");
            return;
        }
        const enrollmentData: StudentCourseEnrollmentCreate = {
            student_id: studentId,
            offering_id: offeringId,
        };
        try {
            await createStudentEnrollment(enrollmentData);
            toast.success("Successfully enrolled in the course!");
            if (studentId) {
                fetchMyEnrollments(studentId);
            }
        } catch (err) {
            console.error("Failed to enroll:", err);
            toast.error("Failed to enroll in the course. Please try again.");
        }
    };

    const handleDrop = async (enrollmentId: number) => {
        try {
            await deleteStudentEnrollment(enrollmentId);
            toast.success("Course dropped successfully!");
            if (studentId) {
                fetchMyEnrollments(studentId);
            }
        } catch (err) {
            console.error("Failed to drop course:", err);
            toast.error("Failed to drop the course. Please try again.");
        }
    };

    if (loadingAvailable || loadingMyEnrollments) {
        return <div className="text-center py-8 text-gray-600">Loading enrollments...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    if (!enrollmentOpen) {
        return <div className="text-center py-8 text-yellow-600 font-semibold">Enrollment period is currently closed. Please check back later.</div>;
    }

    const enrolledOfferingIds = new Set(myEnrollments.map(e => e.offering_id));
    const coursesToDisplay = availableOfferings.filter(offering => !enrolledOfferingIds.has(offering.offering_id));

    return (
        <div className="container mx-auto px-4 py-8 bg-white rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Course Enrollment</h1>

            {/* My Enrollments Section */}
            <h2 className="text-2xl font-bold text-gray-700 mb-4">My Enrolled Courses</h2>
            {myEnrollments.length === 0 ? (
                <p className="text-gray-600 mb-8">You are not currently enrolled in any courses.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {myEnrollments.map(enrollment => {
                        const course = availableOfferings.find(o => o.offering_id === enrollment.offering_id);
                        return (
                            <div key={enrollment.enrollment_id} className="bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-6">
                                <h3 className="text-xl font-bold text-blue-800 mb-1">{course?.course_rel?.course_name || 'Unknown Course'}</h3>
                                <p className="text-sm text-gray-600">Section: {course?.section_name || 'N/A'}</p>
                                <p className="text-sm text-gray-600">Instructor: {course?.instructor_rel?.first_name || ''} {course?.instructor_rel?.last_name || ''}</p>
                                <p className="text-sm text-gray-600">Enrolled On: {enrollment.enrollment_date}</p>
                                {enrollment.grade && <p className="text-sm text-gray-600">Grade: {enrollment.grade}</p>}
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleDrop(enrollment.enrollment_id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                                    >
                                        Drop Course
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Available Courses Section */}
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Available Courses for Enrollment</h2>
            {coursesToDisplay.length === 0 ? (
                <p className="text-gray-600">No new courses available for enrollment at this time.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coursesToDisplay.map(offering => (
                        <div key={offering.offering_id} className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{offering.course_rel?.course_name || 'Unknown Course'}</h3>
                            <p className="text-sm text-gray-600">Section: {offering.section_name}</p>
                            <p className="text-sm text-gray-600">Instructor: {offering.instructor_rel?.first_name || ''} {offering.instructor_rel?.last_name || ''}</p>
                            <p className="text-sm text-gray-600">Capacity: {offering.capacity}</p>
                            <div className="mt-4">
                                <button
                                    onClick={() => handleEnroll(offering.offering_id)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                                >
                                    Enroll
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Enrollment; 