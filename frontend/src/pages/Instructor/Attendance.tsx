import React, { useState, useEffect } from 'react';
import { getInstructorCourses, CourseOfferingResponse } from '../../api/instructorCourseApi';
import { getAttendanceRecordsByOffering, createAttendanceRecord, updateAttendanceRecord, AttendanceCreate, AttendanceUpdate, AttendanceRecord as AttendanceRecordType, getStudentsByOffering } from '../../api/InstructorAttendanceApi';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarCheck, FaUserGraduate } from 'react-icons/fa';

interface Student {
    student_id: string;
    first_name: string;
    last_name: string;
}

const Attendance: React.FC = () => {
    const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
    const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
    const [loadingAttendance, setLoadingAttendance] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [courseOfferings, setCourseOfferings] = useState<CourseOfferingResponse[]>([]);
    const [selectedOfferingId, setSelectedOfferingId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceStatus, setAttendanceStatus] = useState<{[key: string]: 'Present' | 'Absent' | 'Leave'}>({});
    const [viewMode, setViewMode] = useState<'mark' | 'view'>('mark'); // 'mark' or 'view'
    const [viewedAttendance, setViewedAttendance] = useState<AttendanceRecordType[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoadingCourses(true);
                const data = await getInstructorCourses();
                setCourseOfferings(data);
                if (data.length > 0) {
                    setSelectedOfferingId(data[0].offering_id); // Select the first offering by default
                }
            } catch (err) {
                console.error("Failed to fetch instructor courses:", err);
                setError("Failed to load courses.");
                toast.error("Failed to load courses.");
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchStudentsAndAttendance = async () => {
            if (selectedOfferingId && selectedDate) {
                setLoadingStudents(true);
                setError(null);
                try {
                    // Fetch real students for the selected offering
                    const realStudents = await getStudentsByOffering(selectedOfferingId);
                    setStudents(realStudents);

                    // Fetch existing attendance for the selected date and offering
                    setLoadingAttendance(true);
                    const existingAttendance = await getAttendanceRecordsByOffering(selectedOfferingId);
                    const currentDayAttendance: {[key: string]: 'Present' | 'Absent' | 'Leave'} = {};
                    existingAttendance.forEach(record => {
                        if (new Date(record.attendance_date).toDateString() === selectedDate.toDateString()) {
                            currentDayAttendance[record.student_id] = record.status;
                        }
                    });
                    setAttendanceStatus(currentDayAttendance);

                } catch (err) {
                    console.error("Failed to fetch students or attendance:", err);
                    setError("Failed to load student list or attendance records.");
                    toast.error("Failed to load student list or attendance.");
                } finally {
                    setLoadingStudents(false);
                    setLoadingAttendance(false);
                }
            } else {
                setStudents([]);
                setAttendanceStatus({});
            }
        };
        fetchStudentsAndAttendance();
    }, [selectedOfferingId, selectedDate]);

    const handleAttendanceChange = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
        setAttendanceStatus(prevStatus => ({
            ...prevStatus,
            [studentId]: status,
        }));
    };

    const handleSaveAttendance = async () => {
        if (!selectedOfferingId || !selectedDate) {
            toast.error("Please select a course section and date.");
            return;
        }

        try {
            setLoadingAttendance(true);
            const attendanceDateString = selectedDate.toISOString().split('T')[0];

            const allExistingRecordsForOffering = await getAttendanceRecordsByOffering(selectedOfferingId);
            const existingRecordsMap = new Map<string, AttendanceRecordType>();

            allExistingRecordsForOffering.forEach(record => {
                if (record.attendance_date.split('T')[0] === attendanceDateString) {
                    existingRecordsMap.set(record.student_id, record);
                }
            });

            let allOperationsSuccessful = true;

            for (const student of students) {
                const recordToSaveStatus = attendanceStatus[student.student_id] || 'Absent'; // Default to Absent if not marked
                const existingRecord = existingRecordsMap.get(student.student_id);

                try {
                    if (existingRecord) {
                        if (existingRecord.status === recordToSaveStatus) {
                            // Status is the same, no change needed, notify user
                            toast.info(`Attendance for ${student.first_name} ${student.last_name} on ${attendanceDateString} is already marked as ${recordToSaveStatus}.`);
                        } else {
                            // Status is different, update it
                            await updateAttendanceRecord(existingRecord.attendance_id, { status: recordToSaveStatus });
                            toast.success(`Attendance for ${student.first_name} ${student.last_name} on ${attendanceDateString} updated to ${recordToSaveStatus}.`);
                        }
                    } else {
                        // No existing record, create a new one
                        const newRecord: AttendanceCreate = {
                            offering_id: selectedOfferingId,
                            student_id: student.student_id,
                            attendance_date: attendanceDateString,
                            status: recordToSaveStatus,
                        };
                        await createAttendanceRecord(newRecord);
                        toast.success(`Attendance for ${student.first_name} ${student.last_name} on ${attendanceDateString} marked as ${recordToSaveStatus}.`);
                    }
                } catch (err) {
                    console.error(`Failed to save attendance for ${student.first_name} ${student.last_name}:`, err);
                    toast.error(`Failed to save attendance for ${student.first_name} ${student.last_name}.`);
                    allOperationsSuccessful = false; // Mark that at least one operation failed
                }
            }

            // Optional: A final general toast if all operations completed without critical errors
            // if (allOperationsSuccessful) {
            //     toast.success("All attendance records processed!");
            // }

            // Refresh attendance data after saving/updating
            const refreshedAttendance = await getAttendanceRecordsByOffering(selectedOfferingId);
            const currentDayAttendance: {[key: string]: 'Present' | 'Absent' | 'Leave'} = {};
            refreshedAttendance.forEach(record => {
                if (new Date(record.attendance_date).toDateString() === selectedDate.toDateString()) {
                    currentDayAttendance[record.student_id] = record.status;
                }
            });
            setAttendanceStatus(currentDayAttendance);

        } catch (err) {
            console.error("An unexpected error occurred during attendance save process:", err);
            setError("An unexpected error occurred during attendance save process.");
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setLoadingAttendance(false);
        }
    };

    const handleViewPreviousAttendance = async () => {
        if (!selectedOfferingId) {
            toast.error("Please select a course section to view records.");
            return;
        }
        setLoadingAttendance(true);
        try {
            const records = await getAttendanceRecordsByOffering(selectedOfferingId);
            setViewedAttendance(records);
            setViewMode('view');
        } catch (err) {
            console.error("Failed to fetch previous attendance records:", err);
            setError("Failed to load previous attendance records.");
            toast.error("Failed to load previous attendance.");
        } finally {
            setLoadingAttendance(false);
        }
    };


    if (loadingCourses) {
        return <div className="text-center py-8 text-gray-600">Loading courses...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-white rounded-xl shadow-lg h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Attendance Management</h1>

            <div className="mb-6 flex items-center space-x-4">
                <select
                    value={selectedOfferingId || ''}
                    onChange={(e) => {
                        setSelectedOfferingId(Number(e.target.value));
                        setViewMode('mark');
                        setViewedAttendance([]);
                    }}
                    className="border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Select a Course Section</option>
                    {courseOfferings.map(offering => (
                        <option key={offering.offering_id} value={offering.offering_id}>
                            {offering.course_rel.course_name} - {offering.section_name}
                        </option>
                    ))}
                </select>

                <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholderText="Select Date"
                />
            </div>

            <div className="mb-6">
                <button 
                    onClick={() => setViewMode('mark')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${viewMode === 'mark' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                    Mark Attendance
                </button>
                <button 
                    onClick={handleViewPreviousAttendance}
                    className={`ml-3 px-4 py-2 rounded-lg font-semibold transition ${viewMode === 'view' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                    View Previous Records
                </button>
            </div>

            {viewMode === 'mark' ? (
                <div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Students in Selected Section</h2>
                    {loadingStudents ? (
                        <div className="text-center py-4 text-gray-600">Loading students...</div>
                    ) : students.length === 0 ? (
                        <p className="text-gray-600">No students found for this section or date.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Student ID</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Attendance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student.student_id} className="border-b border-gray-100 last:border-b-0">
                                            <td className="py-3 px-4 text-sm text-gray-800">{student.student_id}</td>
                                            <td className="py-3 px-4 text-sm text-gray-800">{student.first_name} {student.last_name}</td>
                                            <td className="py-3 px-4 text-sm">
                                                <div className="flex items-center space-x-3">
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            className="form-radio text-green-600"
                                                            name={`attendance-${student.student_id}`}
                                                            value="Present"
                                                            checked={attendanceStatus[student.student_id] === 'Present'}
                                                            onChange={() => handleAttendanceChange(student.student_id, 'Present')}
                                                        />
                                                        <span className="ml-2 text-gray-700">Present</span>
                                                    </label>
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            className="form-radio text-red-600"
                                                            name={`attendance-${student.student_id}`}
                                                            value="Absent"
                                                            checked={attendanceStatus[student.student_id] === 'Absent'}
                                                            onChange={() => handleAttendanceChange(student.student_id, 'Absent')}
                                                        />
                                                        <span className="ml-2 text-gray-700">Absent</span>
                                                    </label>
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            className="form-radio text-yellow-600"
                                                            name={`attendance-${student.student_id}`}
                                                            value="Leave"
                                                            checked={attendanceStatus[student.student_id] === 'Leave'}
                                                            onChange={() => handleAttendanceChange(student.student_id, 'Leave')}
                                                        />
                                                        <span className="ml-2 text-gray-700">Leave</span>
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {students.length > 0 && (
                        <div className="mt-6">
                            <button 
                                onClick={handleSaveAttendance}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                                disabled={loadingAttendance}
                            >
                                {loadingAttendance ? 'Saving...' : 'Save Attendance'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Previous Attendance Records</h2>
                    {loadingAttendance ? (
                        <div className="text-center py-4 text-gray-600">Loading records...</div>
                    ) : viewedAttendance.length === 0 ? (
                        <p className="text-gray-600">No previous attendance records found for this section.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Student ID</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Date</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                        {/* Add more columns if needed, e.g., student name */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewedAttendance.map(record => (
                                        <tr key={record.attendance_id} className="border-b border-gray-100 last:border-b-0">
                                            <td className="py-3 px-4 text-sm text-gray-800">{record.student_id}</td>
                                            <td className="py-3 px-4 text-sm text-gray-800">{record.attendance_date}</td>
                                            <td className="py-3 px-4 text-sm text-gray-800">{record.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Attendance;
