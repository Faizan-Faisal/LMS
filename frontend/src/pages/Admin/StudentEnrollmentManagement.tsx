import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CourseOfferingResponse, getCourseOfferings } from '../../api/CourseOfferingApi';
import { getStudents, StudentResponse } from '../../api/studentapi';
import { bulkEnrollStudents } from '../../api/AdminEnrollmentApi';

const StudentEnrollmentManagement: React.FC = () => {
    const [courseOfferings, setCourseOfferings] = useState<CourseOfferingResponse[]>([]);
    const [students, setStudents] = useState<StudentResponse[]>([]);
    const [selectedOffering, setSelectedOffering] = useState<number | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const offeringsData = await getCourseOfferings();
                setCourseOfferings(offeringsData);

                const studentsResponse = await getStudents();
                setStudents(studentsResponse.data);
            } catch (err) {
                console.error("Failed to fetch data for enrollment management:", err);
                setError("Failed to load data. Please try again.");
                toast.error("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleOfferingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOffering(Number(e.target.value));
        setSelectedStudents([]); // Clear selected students when offering changes
    };

    const handleStudentToggle = (studentId: string) => {
        setSelectedStudents(prevSelected =>
            prevSelected.includes(studentId)
                ? prevSelected.filter(id => id !== studentId)
                : [...prevSelected, studentId]
        );
    };

    const handleBulkEnroll = async () => {
        if (selectedOffering === null) {
            toast.error("Please select a course offering.");
            return;
        }
        if (selectedStudents.length === 0) {
            toast.error("Please select at least one student to enroll.");
            return;
        }

        try {
            await bulkEnrollStudents(selectedOffering, selectedStudents);
            toast.success("Students enrolled successfully!");
            // Optionally, refresh data or clear selections
            setSelectedStudents([]);
        } catch (err) {
            console.error("Failed to bulk enroll students:", err);
            toast.error("Failed to enroll students. Please try again.");
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading enrollment data...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-white rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Admin Student Enrollment Management</h1>

            <div className="mb-6">
                <label htmlFor="courseOffering" className="block text-gray-700 text-sm font-bold mb-2">
                    Select Course Offering:
                </label>
                <select
                    id="courseOffering"
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={selectedOffering || ''}
                    onChange={handleOfferingChange}
                >
                    <option value="">-- Select an Offering --</option>
                    {courseOfferings.map(offering => (
                        <option key={offering.offering_id} value={offering.offering_id}>
                            {offering.course_rel.course_name} - {offering.section_name} ({offering.instructor_rel.first_name} {offering.instructor_rel.last_name})
                        </option>
                    ))}
                </select>
            </div>

            {selectedOffering && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Select Students to Enroll</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border p-4 rounded-md">
                        {students.map(student => (
                            <div key={student.student_id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`student-${student.student_id}`}
                                    checked={selectedStudents.includes(student.student_id)}
                                    onChange={() => handleStudentToggle(student.student_id)}
                                    className="form-checkbox h-5 w-5 text-blue-600"
                                />
                                <label htmlFor={`student-${student.student_id}`} className="ml-2 text-gray-700">
                                    {student.first_name} {student.last_name} ({student.student_id})
                                </label>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleBulkEnroll}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Enroll Selected Students
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentEnrollmentManagement;
