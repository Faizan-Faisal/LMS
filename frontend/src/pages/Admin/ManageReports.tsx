import React, { useState, useEffect } from 'react';
import {
  fetchExamReportStats,
  fetchAttendanceReportStats,
  downloadExamReportExcel,
  downloadAttendanceReportExcel,
} from '../../api/Admin/reportApi';
import { getdepartments } from '../../api/departmentapi';
import { getSectionsByDepartmentSemester } from '../../api/sectionapi';
import { getCourseOfferingsBySectionDetails } from '../../api/CourseOfferingApi';
import { toast } from 'react-toastify';

const ManageReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exam' | 'attendance'>('exam');

  // Shared filters
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');

  // Exam-specific
  const [examType, setExamType] = useState('');

  // Attendance-specific
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Stats
  const [examStats, setExamStats] = useState({
    total_students: 0,
    passed_students: 0,
    failed_students: 0,
    absent_students: 0,
  });
  const [attendanceStats, setAttendanceStats] = useState({
    total_students: 0,
    present: 0,
    absent: 0,
    leave: 0,
  });
  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState<string[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState('');

  // Fetch departments on mount
  useEffect(() => {
    getdepartments().then(res => setDepartments(res.data.map((d: any) => d.department_name)));
  }, []);

  // Fetch sections when department or semester changes
  useEffect(() => {
    if (department && semester) {
      getSectionsByDepartmentSemester(department, semester).then(res => setSections(res.data));
      setSelectedSection('');
      setCourses([]);
      setCourse('');
    } else {
      setSections([]);
      setSelectedSection('');
      setCourses([]);
      setCourse('');
    }
  }, [department, semester]);

  // Fetch courses when section changes
  useEffect(() => {
    if (selectedSection) {
      getCourseOfferingsBySectionDetails(selectedSection).then(res => setCourses(res.data));
      setCourse('');
    } else {
      setCourses([]);
      setCourse('');
    }
  }, [selectedSection]);

  const handleGenerateExamReport = async (downloadExcel = false) => {
    setLoading(true);
    try {
      if (downloadExcel) {
        const data = await downloadExamReportExcel({ department, semester, course, examType });
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'exam_report.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const stats = await fetchExamReportStats({ department, semester, course, examType });
        setExamStats(stats);
      }
    } catch (err) {
      toast.error('Failed to generate exam report.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAttendanceReport = async (downloadExcel = false) => {
    setLoading(true);
    try {
      if (downloadExcel) {
        const data = await downloadAttendanceReportExcel({ department, semester, course, fromDate, toDate });
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'attendance_report.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const stats = await fetchAttendanceReportStats({ department, semester, course, fromDate, toDate });
        setAttendanceStats(stats);
      }
    } catch (err) {
      toast.error('Failed to generate attendance report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Reports</h1>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold focus:outline-none ${activeTab === 'exam' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('exam')}
        >
          Exam Reports
        </button>
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold focus:outline-none ${activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance Reports
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        {activeTab === 'exam' ? (
          <>
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select className="w-32 px-2 py-1 border rounded text-sm" value={department} onChange={e => setDepartment(e.target.value)}>
                  <option value="">Select Department</option>
                  {departments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select className="w-32 px-2 py-1 border rounded text-sm" value={semester} onChange={e => setSemester(e.target.value)}>
                  <option value="">Select Semester</option>
                  {[...Array(8)].map((_, i) => (
                    <option key={i+1} value={`${i+1} Semester`}>{i+1} Semester</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select className="w-32 px-2 py-1 border rounded text-sm" value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!sections.length}>
                  <option value="">Select Section</option>
                  {sections.map(section => (
                    <option key={section.section_name} value={section.section_name}>{section.section_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select className="w-32 px-2 py-1 border rounded text-sm" value={course} onChange={e => setCourse(e.target.value)} disabled={!courses.length}>
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c.offering_id} value={c.offering_id}>{c.course_rel?.course_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                <select className="w-32 px-2 py-1 border rounded text-sm" value={examType} onChange={e => setExamType(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="mid">Mid</option>
                  <option value="final">Final</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded shadow text-sm mt-2 md:mt-0"
                onClick={() => handleGenerateExamReport(false)}
                disabled={loading}
              >
                Generate Report
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded shadow text-sm mt-2 md:mt-0"
                onClick={() => handleGenerateExamReport(true)}
                disabled={loading}
              >
                Export Excel
              </button>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-6 my-6">
              <div className="rounded-lg shadow p-6 flex flex-col items-center bg-gray-100 w-56">
                <div className="text-2xl font-bold mb-2 text-gray-800">{examStats.total_students}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Total Students</div>
                <button className="text-sm font-semibold underline text-blue-600 cursor-pointer" disabled>
                  View Details
                </button>
              </div>
              <div className="rounded-lg shadow p-6 flex flex-col items-center bg-green-100 w-56">
                <div className="text-2xl font-bold mb-2 text-green-800">{examStats.passed_students}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Passed Students</div>
                <button className="text-sm font-semibold underline text-blue-600 cursor-pointer" disabled>
                  View Details
                </button>
              </div>
              <div className="rounded-lg shadow p-6 flex flex-col items-center bg-red-100 w-56">
                <div className="text-2xl font-bold mb-2 text-red-800">{examStats.failed_students}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Failed Students</div>
                <button className="text-sm font-semibold underline text-blue-600 cursor-pointer" disabled>
                  View Details
                </button>
              </div>
              <div className="rounded-lg shadow p-6 flex flex-col items-center bg-yellow-100 w-56">
                <div className="text-2xl font-bold mb-2 text-yellow-800">{examStats.absent_students}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Absent Students</div>
                <button className="text-sm font-semibold underline text-blue-600 cursor-pointer" disabled>
                  View Details
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select className="w-32 px-2 py-1 border rounded text-sm" value={department} onChange={e => setDepartment(e.target.value)}>
                  <option value="">Select Department</option>
                  {departments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select className="w-32 px-2 py-1 border rounded text-sm" value={semester} onChange={e => setSemester(e.target.value)}>
                  <option value="">Select Semester</option>
                  {[...Array(8)].map((_, i) => (
                    <option key={i+1} value={`${i+1} Semester`}>{i+1} Semester</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select className="w-32 px-2 py-1 border rounded text-sm" value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!sections.length}>
                  <option value="">Select Section</option>
                  {sections.map(section => (
                    <option key={section.section_name} value={section.section_name}>{section.section_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select className="w-32 px-2 py-1 border rounded text-sm" value={course} onChange={e => setCourse(e.target.value)} disabled={!courses.length}>
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c.offering_id} value={c.offering_id}>{c.course_rel?.course_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input type="date" className="w-32 px-2 py-1 border rounded text-sm" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input type="date" className="w-32 px-2 py-1 border rounded text-sm" value={toDate} onChange={e => setToDate(e.target.value)} />
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded shadow text-sm mt-2 md:mt-0"
                onClick={() => handleGenerateAttendanceReport(false)}
                disabled={loading}
              >
                Generate Report
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded shadow text-sm mt-2 md:mt-0"
                onClick={() => handleGenerateAttendanceReport(true)}
                disabled={loading}
              >
                Export Excel
              </button>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-6 my-6">
              <div className="rounded-lg shadow p-6 flex flex-col items-center bg-gray-100 w-56">
                <div className="text-2xl font-bold mb-2 text-gray-800">{attendanceStats.total_students}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Total Students</div>
                <button className="text-sm font-semibold underline text-blue-600 cursor-pointer" disabled>
                  View Details
                </button>
              </div>
              <div className="rounded-lg shadow p-6 flex flex-col items-center bg-green-100 w-56">
                <div className="text-2xl font-bold mb-2 text-green-800">{attendanceStats.present}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Present</div>
                <button className="text-sm font-semibold underline text-blue-600 cursor-pointer" disabled>
                  View Details
                </button>
              </div>
              <div className="rounded-lg shadow p-6 flex flex-col items-center bg-red-100 w-56">
                <div className="text-2xl font-bold mb-2 text-red-800">{attendanceStats.absent}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Absent</div>
                <button className="text-sm font-semibold underline text-blue-600 cursor-pointer" disabled>
                  View Details
                </button>
              </div>
              <div className="rounded-lg shadow p-6 flex flex-col items-center bg-yellow-100 w-56">
                <div className="text-2xl font-bold mb-2 text-yellow-800">{attendanceStats.leave}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">Leave</div>
                <button className="text-sm font-semibold underline text-blue-600 cursor-pointer" disabled>
                  View Details
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Details table will be added here later */}
    </div>
  );
};

export default ManageReports; 