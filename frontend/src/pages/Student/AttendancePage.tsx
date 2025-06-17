import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAttendanceRecords, AttendanceRecord } from '../../api/Student/attendance';
import { getStudentEnrollments, EnrolledCourse } from '../../api/Student/enrollment';

const AttendancePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        setError("Student ID is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch enrolled courses
        const enrollments = await getStudentEnrollments(studentId);
        setEnrolledCourses(enrollments);

        // Fetch attendance records, initially without a course filter
        const attendanceData = await getAttendanceRecords(studentId, selectedCourseId === '' ? undefined : selectedCourseId);
        setAttendanceRecords(attendanceData);

      } catch (err) {
        setError('Failed to load data. Please check if the student ID is correct and the server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, selectedCourseId]);

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = event.target.value;
    setSelectedCourseId(courseId === '' ? '' : parseInt(courseId));
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading attendance records...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700">Filter by Course:</label>
        <select
          id="courseFilter"
          name="courseFilter"
          className="mt-1 block w-full sm:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={selectedCourseId}
          onChange={handleCourseChange}
        >
          <option value="">All Courses</option>
          {enrolledCourses.map((enrollment) => (
            enrollment.offering_rel && enrollment.offering_rel.course_rel ? (
              <option key={enrollment.offering_id} value={enrollment.offering_id}>
                {enrollment.offering_rel.course_rel.course_code} - {enrollment.offering_rel.course_rel.course_name}
              </option>
            ) : null
          ))}
        </select>
      </div>
      {attendanceRecords.length === 0 ? (
        <p>No attendance records found for this student.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Course Name</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => {
                const enrollment = enrolledCourses.find(e => e.offering_id === record.offering_id);
                const courseName = enrollment?.offering_rel?.course_rel?.course_name || 'N/A';
                return (
                  <tr key={record.attendance_id}>
                    <td className="py-2 px-4 border-b text-center">{courseName}</td>
                    <td className="py-2 px-4 border-b text-center">{record.attendance_date}</td>
                    <td className="py-2 px-4 border-b text-center">{record.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendancePage; 