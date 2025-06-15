import React, { useState, useEffect } from 'react';
import { getInstructorCourses, CourseOfferingResponse } from '../../api/instructorCourseApi';
import { getStudentsByOffering } from '../../api/InstructorAttendanceApi';
import { getExamRecordsByOffering, createExamRecord, updateExamRecord, deleteExamRecord, ExamRecord as ExamRecordType, ExamRecordCreate } from '../../api/InstructorExamRecordApi';
import { toast } from 'react-toastify';
import * as FaIcons from 'react-icons/fa';

const examTypes = [
    { value: 'midterm', label: 'Midterm' },
    { value: 'final', label: 'Final' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'assignment', label: 'Assignment' },
];

const ExamRecord: React.FC = () => {
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [courseOfferings, setCourseOfferings] = useState<CourseOfferingResponse[]>([]);
    const [selectedOfferingId, setSelectedOfferingId] = useState<number | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [examType, setExamType] = useState('MIDTERM');
    const [examDate, setExamDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [marks, setMarks] = useState<{[studentId: string]: { obtained_marks: string; total_marks: string; remarks: string } }>({});
    const [existingRecords, setExistingRecords] = useState<ExamRecordType[]>([]);
    const [viewMode, setViewMode] = useState<'mark' | 'view'>('mark');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoadingCourses(true);
            try {
                const data = await getInstructorCourses();
                setCourseOfferings(data);
                if (data.length > 0) setSelectedOfferingId(data[0].offering_id);
            } catch (err) {
                toast.error('Failed to load courses.');
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchStudentsAndRecords = async () => {
            if (!selectedOfferingId) return;
            setLoadingStudents(true);
            setLoadingRecords(true);
            try {
                const studentsData = await getStudentsByOffering(selectedOfferingId);
                setStudents(studentsData);
                // Fetch existing exam records for this offering
                const records = await getExamRecordsByOffering(selectedOfferingId);
                setExistingRecords(records);
                // Pre-fill marks if records exist for this exam type and date
                const filtered = records.filter(r => r.exam_type === examType && r.exam_date.split('T')[0] === examDate);
                const marksObj: {[studentId: string]: { obtained_marks: string; total_marks: string; remarks: string } } = {};
                filtered.forEach(r => {
                    marksObj[r.student_id] = {
                        obtained_marks: r.obtained_marks.toString(),
                        total_marks: r.total_marks.toString(),
                        remarks: r.remarks || ''
                    };
                });
                setMarks(marksObj);
            } catch (err) {
                toast.error('Failed to load students or exam records.');
            } finally {
                setLoadingStudents(false);
                setLoadingRecords(false);
            }
        };
        fetchStudentsAndRecords();
    }, [selectedOfferingId, examType, examDate]);

    const handleMarkChange = (studentId: string, field: string, value: string) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        if (!selectedOfferingId) {
            toast.error('Please select a course section.');
            return;
        }
        for (const student of students) {
            const m = marks[student.student_id];
            if (!m || !m.obtained_marks || !m.total_marks) continue;
            const record: ExamRecordCreate = {
                offering_id: selectedOfferingId,
                student_id: student.student_id,
                exam_type: examType.toLowerCase() as any,
                obtained_marks: parseFloat(m.obtained_marks),
                total_marks: parseFloat(m.total_marks),
                exam_date: new Date(examDate).toISOString(),
                remarks: m.remarks || ''
            };
            // Check if record exists for this student/exam/date
            const existing = existingRecords.find(r => r.student_id === student.student_id && r.exam_type === examType && r.exam_date.split('T')[0] === examDate);
            try {
                if (existing) {
                    await updateExamRecord(existing.id, record);
                } else {
                    await createExamRecord(record);
                }
            } catch (err) {
                toast.error(`Failed to save record for ${student.first_name} ${student.last_name}`);
            }
        }
        toast.success('Exam records saved!');
    };

    const handleViewPrevious = () => {
        setViewMode('view');
    };
    const handleBackToMark = () => {
        setViewMode('mark');
    };

    const handleEditRecord = (record: ExamRecordType) => {
        setViewMode('mark');
        setExamType(record.exam_type.toUpperCase());
        setExamDate(record.exam_date.split('T')[0]);
        setMarks({
            [record.student_id]: {
                obtained_marks: record.obtained_marks.toString(),
                total_marks: record.total_marks.toString(),
                remarks: record.remarks || ''
            }
        });
    };

    const handleDeleteRecord = (recordId: number) => {
        setRecordToDelete(recordId);
        setShowDeleteModal(true);
    };

    const confirmDeleteRecord = async () => {
        if (recordToDelete === null) return;
        try {
            await deleteExamRecord(recordToDelete);
            toast.success('Record deleted!');
            if (selectedOfferingId) {
                const records = await getExamRecordsByOffering(selectedOfferingId);
                setExistingRecords(records);
            }
        } catch (err) {
            toast.error('Failed to delete record');
        } finally {
            setShowDeleteModal(false);
            setRecordToDelete(null);
        }
    };

    const cancelDeleteRecord = () => {
        setShowDeleteModal(false);
        setRecordToDelete(null);
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-white rounded-xl shadow-lg h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Exam Records Management</h1>
            <div className="mb-6 flex items-center space-x-4">
                <select
                    value={selectedOfferingId || ''}
                    onChange={e => setSelectedOfferingId(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Select a Course Section</option>
                    {courseOfferings.map(offering => (
                        <option key={offering.offering_id} value={offering.offering_id}>
                            {offering.course_rel.course_name} - {offering.section_name}
                        </option>
                    ))}
                </select>
                <select
                    value={examType}
                    onChange={e => setExamType(e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {examTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
                {viewMode === 'mark' && (
                    <input
                        type="date"
                        value={examDate}
                        onChange={e => setExamDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                )}
                {viewMode === 'mark' ? (
                    <>
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Save Exam Records
                        </button>
                        <button
                            onClick={handleViewPrevious}
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition ml-2"
                        >
                            View Previous Records
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleBackToMark}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Back to Mark/Update
                    </button>
                )}
            </div>
            {viewMode === 'mark' ? (
                <>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Students in Selected Section</h2>
                    {loadingStudents ? (
                        <div className="text-center py-8 text-gray-600">Loading students...</div>
                    ) : (
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b">Student ID</th>
                                    <th className="px-4 py-2 border-b">Name</th>
                                    <th className="px-4 py-2 border-b">Marks Obtained</th>
                                    <th className="px-4 py-2 border-b">Total Marks</th>
                                    <th className="px-4 py-2 border-b">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.student_id}>
                                        <td className="px-4 py-2 border-b">{student.student_id}</td>
                                        <td className="px-4 py-2 border-b">{student.first_name} {student.last_name}</td>
                                        <td className="px-4 py-2 border-b">
                                            <input
                                                type="number"
                                                min="0"
                                                value={marks[student.student_id]?.obtained_marks || ''}
                                                onChange={e => handleMarkChange(student.student_id, 'obtained_marks', e.target.value)}
                                                className="border rounded px-2 py-1 w-24"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                            <input
                                                type="number"
                                                min="0"
                                                value={marks[student.student_id]?.total_marks || ''}
                                                onChange={e => handleMarkChange(student.student_id, 'total_marks', e.target.value)}
                                                className="border rounded px-2 py-1 w-24"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                            <input
                                                type="text"
                                                value={marks[student.student_id]?.remarks || ''}
                                                onChange={e => handleMarkChange(student.student_id, 'remarks', e.target.value)}
                                                className="border rounded px-2 py-1 w-32"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Previous Exam Records</h2>
                    {loadingRecords ? (
                        <div className="text-center py-8 text-gray-600">Loading records...</div>
                    ) : (
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b">Student ID</th>
                                    <th className="px-4 py-2 border-b">Name</th>
                                    <th className="px-4 py-2 border-b">Exam Type</th>
                                    <th className="px-4 py-2 border-b">Exam Date</th>
                                    <th className="px-4 py-2 border-b">Marks Obtained</th>
                                    <th className="px-4 py-2 border-b">Total Marks</th>
                                    <th className="px-4 py-2 border-b">Remarks</th>
                                    <th className="px-4 py-2 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {existingRecords
                                    .filter(record => record.exam_type === examType)
                                    .map(record => {
                                        const student = students.find(s => s.student_id === record.student_id);
                                        return (
                                            <tr key={record.id}>
                                                <td className="px-4 py-2 border-b">{record.student_id}</td>
                                                <td className="px-4 py-2 border-b">{student ? `${student.first_name} ${student.last_name}` : '-'}</td>
                                                <td className="px-4 py-2 border-b">{record.exam_type}</td>
                                                <td className="px-4 py-2 border-b">{record.exam_date.split('T')[0]}</td>
                                                <td className="px-4 py-2 border-b">{record.obtained_marks}</td>
                                                <td className="px-4 py-2 border-b">{record.total_marks}</td>
                                                <td className="px-4 py-2 border-b">{record.remarks || ''}</td>
                                                <td className="px-4 py-2 border-b flex gap-2 justify-center">
                                                    <button onClick={() => handleEditRecord(record)} className="flex items-center justify-center w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded text-white transition" title="Edit">
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11-11a2.828 2.828 0 00-4-4L5 17v4z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteRecord(record.id)} className="flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 rounded text-white transition" title="Delete">
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    )}
                </>
            )}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
                        <p>Are you sure you want to delete this exam record?</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={cancelDeleteRecord}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteRecord}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamRecord; 