import React, { useState, useEffect } from 'react';
import { getInstructorCourses, CourseOfferingResponse } from '../../api/instructorCourseApi';
import { toast } from 'react-toastify';

const CourseManagement: React.FC = () => {
    const [courses, setCourses] = useState<CourseOfferingResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = sessionStorage.getItem('instructorToken');
                console.log("Instructor Token before API call:", token);
                setLoading(true);
                const data = await getInstructorCourses();
                setCourses(data);
            } catch (err) {
                console.error("Failed to fetch instructor courses:", err);
                setError("Failed to load courses. Please try again.");
                toast.error("Failed to load courses.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading courses...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Courses</h1>

            {courses.length === 0 ? (
                <p className="text-gray-600">You are not currently teaching any courses.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((offering) => (
                        <div key={offering.offering_id} className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-1">
                                    {offering.course_rel.course_name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">Section: {offering.section_name}</p>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseManagement; 