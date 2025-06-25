import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseMaterials, downloadCourseMaterial, CourseMaterial } from '../../api/Student/course_material';
import { getStudentEnrollments, EnrolledCourse } from '../../api/Student/enrollment';
import { askQuestion } from '../../api/Rag';

const handleDownload = async (materialId: number, fileName: string) => {
  try {
    const data = await downloadCourseMaterial(materialId);
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download course material.', err);
  }
};

const MaterialDetailModal: React.FC<{
  material: CourseMaterial | null;
  onClose: () => void;
  onDownload: (materialId: number, fileName: string) => void;
}> = ({ material, onClose, onDownload }) => {
  if (!material) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 text-blue-600 rounded-full p-3 mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{material.title}</h3>
            <span className="text-gray-500 text-sm">Uploaded: {material.uploaded_at ? new Date(material.uploaded_at).toLocaleDateString() : '-'}</span>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-lg font-semibold mb-1">Description</h4>
          <p className="text-gray-700 whitespace-pre-line max-h-60 overflow-y-auto">{material.description || '-'}</p>
        </div>
        {material.file_path ? (
          <button
            onClick={() => onDownload(material.material_id, material.file_path ? material.file_path.split('/').pop() || 'download' : 'download')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
          >
            Download
          </button>
        ) : (
          <span className="text-gray-400 text-sm">No File</span>
        )}
      </div>
    </div>
  );
};

function formatAnswer(answer: string) {
  // Remove all Markdown heading hashtags and extra spaces after them
  let cleaned = answer.replace(/^#+\s?/gm, '');
  // Optionally, trim leading/trailing whitespace
  cleaned = cleaned.trim();
  return cleaned;
}

const CourseMaterialsPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cardView' | 'materialView'>('cardView');
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [subject, setSubject] = useState<string>('');

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!studentId) {
        setError("Student ID is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const enrollments = await getStudentEnrollments(studentId);
        setEnrolledCourses(enrollments);
      } catch (err) {
        setError("Failed to load courses. Please check if the student ID is correct and the server is running.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [studentId]);

  useEffect(() => {
    const fetchCourseMaterialsData = async () => {
        if (selectedCourseId !== null) {
            try {
                setLoading(true);
                const materialsData = await getCourseMaterials(studentId!, selectedCourseId);
                setCourseMaterials(materialsData);
            } catch (err) {
                setError('Failed to fetch course materials. Please check if the server is running.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    fetchCourseMaterialsData();
  }, [studentId, selectedCourseId]);

  // Set subject directly based on selected course
  useEffect(() => {
    if (selectedCourseId && enrolledCourses.length > 0) {
      const course = enrolledCourses.find(e => e.offering_id === selectedCourseId);
      const courseName = course?.offering_rel?.course_rel?.course_name || '';
      setSubject(`${courseName}_notes`);
    } else {
      setSubject('');
    }
    setAnswer(null);
    setQuestion('');
  }, [selectedCourseId, enrolledCourses]);

  const handleCardClick = (offeringId: number) => {
    setSelectedCourseId(offeringId);
    setViewMode('materialView');
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setCourseMaterials([]);
    setViewMode('cardView');
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnswer(null);
    setAsking(true);
    try {
      if (!subject) {
        setAsking(false);
        return;
      }
      const res = await askQuestion(subject, question);
      setAnswer(res.data.answer || JSON.stringify(res.data));
    } catch (err) {
      setAnswer('Failed to get answer.');
    } finally {
      setAsking(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Course Materials</h1>
      {/* <h1 className="text-2xl font-bold mb-4">Course Materials for Student ID: {studentId}</h1> */}

      {viewMode === 'cardView' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.length === 0 ? (
            <p>No enrolled courses found.</p>
          ) : (
            enrolledCourses.map((enrollment) => (
              enrollment.offering_rel && enrollment.offering_rel.course_rel && enrollment.offering_rel.instructor_rel ? (
                <div
                  key={enrollment.offering_id}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer transform transition duration-300 hover:scale-105"
                  onClick={() => handleCardClick(enrollment.offering_id)}
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{enrollment.offering_rel.course_rel.course_name}</h2>
                  <p className="text-gray-600">Teacher: {enrollment.offering_rel.instructor_rel.first_name} {enrollment.offering_rel.instructor_rel.last_name}</p>
                </div>
              ) : null
            ))
          )}
        </div>
      ) : (
        <>
          <button 
            onClick={handleBackToCourses} 
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Courses
          </button>
          {/* Show selected course name at the top */}
          {(() => {
            const course = enrolledCourses.find(e => e.offering_id === selectedCourseId);
            const courseName = course?.offering_rel?.course_rel?.course_name || '';
            return (
              <h2 className="text-xl font-bold mb-4">Materials for: <span className="text-blue-700">{courseName}</span></h2>
            );
          })()}
          {/* RAG Ask a Question Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Ask a Question about this Subject</h3>
            <form onSubmit={handleAskQuestion} className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Type your question..."
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  required
                  disabled={asking || !subject}
                />
                {/* Always show subject */}
                <span className="text-sm text-gray-600 ml-2">Subject: <b>{subject}</b></span>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow ml-2"
                  disabled={asking || !question || !subject}
                >
                  {asking ? 'Asking...' : 'Ask'}
                </button>
              </div>
            </form>
            {answer && (
              <div className="mt-4 p-3 bg-white border rounded text-gray-800" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <b>Answer:</b>
                <pre style={{ whiteSpace: 'pre-line', margin: 0 }}>
                  {formatAnswer(answer)}
                </pre>
              </div>
            )}
          </div>
          {courseMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              <p className="text-gray-500 text-lg">No material is uploaded for this course yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {courseMaterials.map((material) => (
                <div
                  key={material.material_id}
                  className="flex items-center bg-white rounded-lg shadow-md px-6 py-4 cursor-pointer hover:bg-blue-50 transition border border-gray-200"
                  onClick={() => setSelectedMaterial(material)}
                >
                  <div className="bg-blue-100 text-blue-600 rounded-full p-3 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">{material.title}</h3>
                      <span className="text-gray-400 text-sm ml-4">{material.uploaded_at ? new Date(material.uploaded_at).toLocaleDateString() : '-'}</span>
                    </div>
                    <p className="text-gray-500 text-sm truncate">{material.description || '-'}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDownload(material.material_id, material.file_path ? material.file_path.split('/').pop() || 'download' : 'download'); }}
                    className="ml-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
          {selectedMaterial && (
            <MaterialDetailModal material={selectedMaterial} onClose={() => setSelectedMaterial(null)} onDownload={handleDownload} />
          )}
        </>
      )}
    </div>
  );
};

export default CourseMaterialsPage; 