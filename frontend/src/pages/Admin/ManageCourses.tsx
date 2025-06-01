import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// Assume courseapi.ts exists with similar functions for courses
import { getCourses, addCourse, getCourseByName, updateCourse, deleteCourse } from '../../api/courseapi';

interface Course {
  course_id: string; // Assuming course_id is a string
  course_name: string;
  course_description: string;
  course_credit_hours: number; // Assuming credit hours is a number
}

const ManageCourses: React.FC = () => {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'add' | 'edit'>('add');
  const [selected, setSelected] = useState<Course | null>(null);
  const [viewed, setViewed] = useState<Course | null>(null);
  const [formData, setFormData] = useState<any>({
    course_id: '',
    course_name: '',
    course_description: '',
    course_credit_hours: '', // Keep as string for input field
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null); // Use course_id for deletion

  // Placeholder API functions (replace with actual imports and calls)
  // const getCourses = async () => { console.log('Fetching courses'); return { data: [] }; };
  // const addCourse = async (data: any) => { console.log('Adding course', data); };
  // const getCourseById = async (id: string) => { console.log('Getting course by id', id); return { data: null }; };
  // const updateCourse = async (id: string, data: any) => { console.log('Updating course', id, data); };
  // const deleteCourse = async (id: string) => { console.log('Deleting course', id); };

  useEffect(() => {
    fetchCourses();
  }, []);
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getCourses();
      setCourses(res.data);
    } catch (err) {
      
      toast.error('Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter(
    (course) =>
      course.course_id.toLowerCase().includes(search.toLowerCase()) ||
      course.course_name.toLowerCase().includes(search.toLowerCase()) 
      // Add other searchable fields as needed
  );

  const handleAdd = () => {
    setFormType('add');
    setSelected(null);
    setFormData({
      course_id: '',
      course_name: '',
      course_description: '',
      course_credit_hours: '',
    });
    setShowForm(true);
  };

  const handleEdit = (course: Course) => {
    setFormType('edit');
    setSelected(course);
    setFormData({
      course_id: course.course_id,
      course_name: course.course_name,
      course_description: course.course_description,
      course_credit_hours: course.course_credit_hours,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setCourseToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (courseToDelete === null) return;

    try {
      setLoading(true);
      await deleteCourse(courseToDelete);
      toast.success('Course deleted successfully.');
      fetchCourses();
    } catch (err) {
      console.error('Error deleting course:', err);
      toast.error('Failed to delete course.');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setCourseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // --- Input Validation ---
    // Add course_id format validation if needed

    if (formType === 'add') {
      // Add course_id existence check if needed
    }

    try {
      const data = new FormData(); // Use FormData for potential file uploads if needed later, though not required for current fields
      data.append('course_id', formData.course_id);
      data.append('course_name', formData.course_name);
      data.append('course_description', formData.course_description);
      data.append('course_credit_hours', formData.course_credit_hours);

      if (formType === 'add') {
        await addCourse(data);
        toast.success('Course added successfully.');
      } else if (formType === 'edit' && selected) {
        await updateCourse(selected.course_id, data);
        toast.success('Course updated successfully.');
      }

      setShowForm(false);
      fetchCourses();
    } catch (err: any) {
      console.error('Error saving course:', err);
      toast.error(err.response?.data?.detail || 'Failed to save course.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      course_id: '',
      course_name: '',
      course_description: '',
      course_credit_hours: '',
    });
  };

  const handleRefresh = () => {
    fetchCourses();
  };

  const handleView = (course: Course) => {
    setViewed(course);
  };
  const closeView = () => setViewed(null);

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <div className="w-full max-w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full p-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Course Management</h2>
          <hr className="mb-4 mt-2" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <input
              type="text"
              placeholder="Search by Course ID, Name"
              className="w-full md:w-80 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-3 mt-2 md:mt-0">
              <button
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                onClick={handleAdd}
              >
                Add New Course
              </button>
              <button
                className="bg-blue-100 text-blue-700 px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-200 transition"
                onClick={handleRefresh}
              >
                Refresh List
              </button>
            </div>
          </div>
          {/* Inline Form at the Top */}
          {showForm && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <h3 className="text-xl font-bold mb-6">{formType === 'add' ? 'Add New Course' : 'Update Course'}</h3>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Form Fields */}
                  <div>
                    <label className="block mb-1 font-semibold">Course ID</label>
                    <input 
                      name="course_id" 
                      type="text" 
                      placeholder="e.g., CS101" 
                      className="w-full px-4 py-2 border rounded-lg {formType === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''}"
                      value={formData.course_id} 
                      onChange={handleFormChange} 
                      required 
                      readOnly={formType === 'edit'} // Course ID likely not editable when editing
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Course Name</label>
                    <input 
                      name="course_name" 
                      type="text" 
                      placeholder="Enter course name" 
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.course_name} 
                      onChange={handleFormChange} 
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Course Description</label>
                    <textarea 
                      name="course_description" 
                      placeholder="Enter course description" 
                      className="w-full px-4 py-2 border rounded-lg h-24"
                      value={formData.course_description} 
                      onChange={handleFormChange} 
                      required
                    />
                  </div>
                   <div>
                    <label className="block mb-1 font-semibold">Credit Hours</label>
                    <input 
                      name="course_credit_hours" 
                      type="number" 
                      placeholder="e.g., 3" 
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.course_credit_hours} 
                      onChange={handleFormChange} 
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-row gap-4 justify-end">
                  <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" onClick={handleReset}>Reset Form</button>
                  <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">{loading ? 'Processing...' : formType === 'add' ? 'Add Course' : 'Update Course'}</button>
                </div>
              </form>
            </div>
          )}
          {/* Course Table Below Form */}
          <div className="rounded-xl">
            <table className="w-full bg-white rounded-xl">
              <thead>
                <tr className="bg-gray-50 text-slate-700 text-sm">
                  <th className="py-3 px-4 text-left font-bold tracking-wide">COURSE ID</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">COURSE NAME</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">DESCRIPTION</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">CREDIT HOURS</th>
                  <th className="py-3 px-4 text-center font-bold tracking-wide">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">No courses found</td>
                  </tr>
                ) : (
                  filtered.map((course) => (
                    <tr key={course.course_id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="py-3 px-4 font-semibold">{course.course_id}</td>
                      <td className="py-3 px-4">{course.course_name}</td>
                      <td className="py-3 px-4">{course.course_description}</td>
                      <td className="py-3 px-4">{course.course_credit_hours}</td>
                      <td className="py-3 px-4 text-center flex gap-2 justify-center">
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-blue-500 hover:bg-blue-600 rounded text-white transition"
                          title="View"
                          onClick={() => handleView(course)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded text-white transition"
                          title="Edit"
                          onClick={() => handleEdit(course)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11-11a2.828 2.828 0 00-4-4L5 17v4z" /></svg>
                        </button>
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 rounded text-white transition"
                          title="Delete"
                          onClick={() => handleDelete(course.course_id)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal for View Course */}
      {viewed && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Course Details</h3>
            <div className="space-y-2 mb-6">
              <div><span className="font-semibold">Course ID:</span> {viewed.course_id}</div>
              <div><span className="font-semibold">Course Name:</span> {viewed.course_name}</div>
              <div><span className="font-semibold">Description:</span> {viewed.course_description}</div>
              <div><span className="font-semibold">Credit Hours:</span> {viewed.course_credit_hours}</div>
            </div>
            <div className="flex justify-end">
              <button onClick={closeView} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete course {courseToDelete}?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses; 