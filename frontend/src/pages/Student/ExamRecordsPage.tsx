import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getExamRecords, ExamRecord } from '../../api/Student/exam_record';
import { getStudentEnrollments, EnrolledCourse } from '../../api/Student/enrollment';

const ExamRecordsPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamData = async () => {
      if (!studentId) {
        setError("Student ID is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null); // Reset error before fetch
        // Fetch enrolled courses
        const enrollments = await getStudentEnrollments(studentId);
        setEnrolledCourses(enrollments);

        // Fetch exam records, initially without a course filter
        const examData = await getExamRecords(studentId, selectedCourseId === '' ? undefined : selectedCourseId);
        setExamRecords(examData);
      } catch (err) {
        setError('Failed to load data. Please check if the student ID is correct and the server is running.');
        console.error(err);
        setExamRecords([]); // Ensure empty state if error
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [studentId, selectedCourseId]);

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = event.target.value;
    setSelectedCourseId(courseId === '' ? '' : parseInt(courseId));
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading exam records...</div>;
  }

  // Only show error if it's not just "no records found"
  if (error && examRecords.length === 0) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Exam Records</h1>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700">Filter by Subject:</label>
        <select
          id="courseFilter"
          name="courseFilter"
          className="mt-1 block w-full sm:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={selectedCourseId}
          onChange={handleCourseChange}
        >
          <option value="" disabled>Select a Subject</option>
          {enrolledCourses.map((enrollment) => (
            enrollment.offering_rel && enrollment.offering_rel.course_rel ? (
              <option key={enrollment.offering_id} value={enrollment.offering_id}>
                {enrollment.offering_rel.course_rel.course_name}
              </option>
            ) : null
          ))}
        </select>
      </div>
      {examRecords.length === 0 && !loading && !error ? (
        <p>No exam records found for this course.</p>
      ) : examRecords.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Subject</th>
                <th className="py-2 px-4 border-b">Exam Type</th>
                <th className="py-2 px-4 border-b">Exam Date</th>
                <th className="py-2 px-4 border-b">Marks Obtained</th>
                <th className="py-2 px-4 border-b">Total Marks</th>
                <th className="py-2 px-4 border-b">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {examRecords.map((record) => {
                const enrollment = enrolledCourses.find(e => e.offering_id === record.offering_id);
                const courseName = enrollment?.offering_rel?.course_rel?.course_name || 'N/A';
                return (
                  <tr key={record.id}>
                    <td className="py-2 px-4 border-b text-center">{courseName}</td>
                    <td className="py-2 px-4 border-b text-center">{record.exam_type}</td>
                    <td className="py-2 px-4 border-b text-center">{record.exam_date}</td>
                    <td className="py-2 px-4 border-b text-center">{record.obtained_marks}</td>
                    <td className="py-2 px-4 border-b text-center">{record.total_marks}</td>
                    <td className="py-2 px-4 border-b text-center">{record.remarks || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default ExamRecordsPage; 