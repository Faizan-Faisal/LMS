import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getdepartments } from '../../api/departmentapi'; // Import department API
import { getSections, addSection, getSectionByName, updateSection, deleteSection } from '../../api/sectionapi'; // Import section API
import { getCourses } from '../../api/courseapi';
import { getInstructors } from '../../api/instructorapi';
import { createCourseOffering, getCourseOfferingsBySectionDetails } from '../../api/course_offerings';

// Define interface for a Section based on backend model
interface Section {
  section_name: string; // Primary key
  department: string;
  semester: string;
}

interface Course {
  course_id: string;
  course_name: string;
}

interface Instructor {
  instructor_id: string;
  first_name: string;
  last_name: string;
}

interface CourseOffering {
  offering_id: number;
  course_id: string;
  section_name: string;
  instructor_id: string;
  capacity: number;
}

interface CourseOfferingDetails {
    offering_id: number;
    capacity: number;
    course_name: string;
    instructor_first_name: string;
    instructor_last_name: string;
}

const ManageSections: React.FC = () => {
  const [search, setSearch] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [departments, setDepartments] = useState<string[]>([]); // State for departments
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'add' | 'edit'>('add');
  const [selected, setSelected] = useState<Section | null>(null);
  const [viewed, setViewed] = useState<Section | null>(null);
  const [viewedCourseOfferingsDetails, setViewedCourseOfferingsDetails] = useState<CourseOfferingDetails[]>([]);
  const [formData, setFormData] = useState<any>({
    section_name: '',
    department: '',
    semester: '',
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null); // Use section_name for deletion
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courseOfferings, setCourseOfferings] = useState<CourseOfferingDetails[]>([]);
  const [assignFormData, setAssignFormData] = useState({
    course_id: '',
    instructor_id: '',
    capacity: 30
  });
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [instructorSearchTerm, setInstructorSearchTerm] = useState('');
  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(null);
  const [selectedInstructorName, setSelectedInstructorName] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
    fetchDepartments(); // Fetch departments on component mount
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await getdepartments();
      const departmentNames = res.data.map((dept: any) => dept.department_name);
      setDepartments(departmentNames);
    } catch (err) {
      console.error('Error fetching departments:', err);
      toast.error('Failed to load departments.');
    }
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await getSections(); // Use actual API call
      setSections(res.data); // Set sections with data from API
    } catch (err) {
      console.error('Error fetching sections:', err);
      toast.error('Failed to fetch sections.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      toast.error('Failed to load courses.');
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await getInstructors();
      setInstructors(res.data);
    } catch (err) {
      console.error('Error fetching instructors:', err);
      toast.error('Failed to load instructors.');
    }
  };

  const fetchCourseOfferings = async (sectionName: string) => {
    try {
      const res = await getCourseOfferingsBySectionDetails(sectionName);
      setCourseOfferings(res.data);
    } catch (err) {
      console.error('Error fetching course offerings:', err);
      toast.error('Failed to load course offerings.');
    }
  };

  const filtered = sections.filter(
    (sec) =>
      sec.section_name.toLowerCase().includes(search.toLowerCase()) ||
      sec.department.toLowerCase().includes(search.toLowerCase()) ||
      sec.semester.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setFormType('add');
    setSelected(null);
    setFormData({
      section_name: '',
      department: '',
      semester: '',
    });
    setShowForm(true);
  };

  const handleEdit = (sec: Section) => {
    setFormType('edit');
    setSelected(sec);
    setFormData({
      section_name: sec.section_name,
      department: sec.department,
      semester: sec.semester,
    });
    setShowForm(true);
  };

  const handleDelete = (name: string) => { // Use section_name
    setSectionToDelete(name);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (sectionToDelete === null) return; // Should not happen if modal is open correctly

    try {
      setLoading(true);
      await deleteSection(sectionToDelete); // Use actual API call
      toast.success('Section deleted successfully.');
      fetchSections(); // Refresh list
    } catch (err) {
      console.error('Error deleting section:', err);
      toast.error('Failed to delete section.');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSectionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSectionToDelete(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formType === 'add') {
        // Optional: Check if section_name already exists before adding
        try {
          await getSectionByName(formData.section_name);
          // If successful, section exists
          toast.error('Section with this name already exists.');
          setLoading(false);
          return; // Stop submission
        } catch (err: any) {
          // If error is 404, section does not exist, proceed.
          if (err.response && err.response.status === 404) {
            // continue to add
          } else {
            // Other error during check
            console.error('Error checking section name:', err);
            toast.error('Error checking section name.');
            setLoading(false);
            return; // Stop submission due to unexpected error
          }
        }

        console.log('Sending section data:', formData);
        await addSection(formData); // Use actual API call
        toast.success('Section added successfully.');
      } else if (formType === 'edit' && selected) {
        // For update, create FormData directly to match backend's Form parameters
        const updateFormData = new FormData();
        // Do NOT include section_name in FormData, as it's the URL identifier
        updateFormData.append('department', formData.department);
        updateFormData.append('semester', formData.semester);

        await updateSection(selected.section_name, updateFormData); // Pass FormData
        toast.success('Section updated successfully.');
      }

      setShowForm(false);
      fetchSections(); // Refresh list
    } catch (err: any) {
      console.error('Error saving section:', err);
      toast.error(err.response?.data?.detail || 'Failed to save section.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      section_name: '',
      department: '',
      semester: '',
    });
  };

  const handleRefresh = () => {
    fetchSections();
  };

  const handleView = async (sec: Section) => {
    setViewed(sec);
    try {
      const res = await getCourseOfferingsBySectionDetails(sec.section_name);
      setViewedCourseOfferingsDetails(res.data);
    } catch (err: any) {
      console.error('Error fetching course offerings for view:', err);
      // Only show toast if it's not a 404 (no offerings found)
      if (err.response && err.response.status === 404) {
        // Expected: no course offerings found, no toast needed
      } else {
        toast.error('Failed to load course offerings for this section.');
      }
      setViewedCourseOfferingsDetails([]); // Clear previous data on error/no findings
    }
  };
  const closeView = () => {
    setViewed(null);
    setViewedCourseOfferingsDetails([]); // Clear data when closing
  };

  const handleAssignCourses = (section: Section) => {
    setSelectedSection(section);
    setShowAssignModal(true);
    fetchCourses();
    fetchInstructors();
    fetchCourseOfferings(section.section_name);
    // Reset search terms and selected names when opening the modal
    setCourseSearchTerm('');
    setInstructorSearchTerm('');
    setSelectedCourseName(null);
    setSelectedInstructorName(null);
    setAssignFormData(prev => ({ ...prev, course_id: '', instructor_id: '' }));
  };

  const handleAssignFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssignFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;

    try {
      await createCourseOffering(
        assignFormData.course_id,
        selectedSection.section_name,
        assignFormData.instructor_id,
        Number(assignFormData.capacity)
      );
      toast.success('Course assigned successfully');
      fetchCourseOfferings(selectedSection.section_name);
      setAssignFormData({
        course_id: '',
        instructor_id: '',
        capacity: 30
      });
      setSelectedCourseName(null);
      setSelectedInstructorName(null);
    } catch (err) {
      console.error('Error assigning course:', err);
      toast.error('Failed to assign course');
    }
  };

  const handleCourseSelect = (course: Course) => {
    setAssignFormData(prev => ({ ...prev, course_id: course.course_id }));
    setSelectedCourseName(course.course_name);
    setCourseSearchTerm(''); // Clear search term to hide suggestions
  };

  const handleInstructorSelect = (instructor: Instructor) => {
    setAssignFormData(prev => ({ ...prev, instructor_id: instructor.instructor_id }));
    setSelectedInstructorName(`${instructor.first_name} ${instructor.last_name}`);
    setInstructorSearchTerm(''); // Clear search term to hide suggestions
  };

  const filteredCoursesOptions = courses.filter(course =>
    course.course_name.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
    course.course_id.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

  const filteredInstructorsOptions = instructors.filter(instructor =>
    instructor.first_name.toLowerCase().includes(instructorSearchTerm.toLowerCase()) ||
    instructor.last_name.toLowerCase().includes(instructorSearchTerm.toLowerCase()) ||
    instructor.instructor_id.toLowerCase().includes(instructorSearchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <div className="w-full max-w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full p-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Section Management</h2>
          <hr className="mb-4 mt-2" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <input
              type="text"
              placeholder="Search by Section Name, Department, or Semester..." // Updated placeholder
              className="w-full md:w-80 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-3 mt-2 md:mt-0">
              <button
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                onClick={handleAdd}
              >
                Add New Section
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
              <h3 className="text-xl font-bold mb-6">{formType === 'add' ? 'Add New Section' : 'Update Section'}</h3>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Form Fields */}
                  <div>
                    <label className="block mb-1 font-semibold">Section Name</label>
                    <input 
                      name="section_name" 
                      type="text" 
                      placeholder="e.g., CS101-F23" 
                      className="w-full px-4 py-2 border rounded-lg {formType === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''}"
                      value={formData.section_name} 
                      onChange={handleFormChange} 
                      required 
                      readOnly={formType === 'edit'} // Section Name likely not editable when editing
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Semester</label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Semester</option>
                      {[...Array(8)].map((_, i) => (
                        <option key={i + 1} value={`${i + 1} Semester`}>{`${i + 1} Semester`}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-row gap-4 justify-end">
                  <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" onClick={handleReset}>Reset Form</button>
                  <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">{loading ? 'Processing...' : formType === 'add' ? 'Add Section' : 'Update Section'}</button>
                </div>
              </form>
            </div>
          )}
          {/* Section Table Below Form */}
          <div className="rounded-xl">
            <table className="w-full bg-white rounded-xl">
              <thead>
                <tr className="bg-gray-50 text-slate-700 text-sm">
                  <th className="py-3 px-4 text-left font-bold tracking-wide">SECTION NAME</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">DEPARTMENT</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">SEMESTER</th>
                  <th className="py-3 px-4 text-center font-bold tracking-wide">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">No sections found</td>
                  </tr>
                ) : (
                  filtered.map((sec) => (
                    <tr key={sec.section_name} className="border-b hover:bg-gray-50 text-sm">
                      <td className="py-3 px-4 font-semibold">{sec.section_name}</td>
                      <td className="py-3 px-4">{sec.department}</td>
                      <td className="py-3 px-4">{sec.semester}</td>
                      <td className="py-3 px-4 text-center flex gap-2 justify-center">
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-blue-500 hover:bg-blue-600 rounded text-white transition"
                          title="View"
                          onClick={() => handleView(sec)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded text-white transition"
                          title="Edit"
                          onClick={() => handleEdit(sec)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11-11a2.828 2.828 0 00-4-4L5 17v4z" /></svg>
                        </button>
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 rounded text-white transition"
                          title="Delete"
                          onClick={() => handleDelete(sec.section_name)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" /></svg>
                        </button>
                        <button
                          onClick={() => handleAssignCourses(sec)}
                          className="px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm ml-2"
                        >
                          Assign Courses
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
      {/* Modal for View Section */}
      {viewed && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Section Details: {viewed.section_name}</h3>
            <div className="space-y-2 mb-6">
              <div><span className="font-semibold">Section Name:</span> {viewed.section_name}</div>
              <div><span className="font-semibold">Department:</span> {viewed.department}</div>
              <div><span className="font-semibold">Semester:</span> {viewed.semester}</div>
            </div>

            <h4 className="text-lg font-bold mb-4">Assigned Courses</h4>
            {viewedCourseOfferingsDetails.length === 0 ? (
                <p className="text-gray-500">No courses assigned to this section yet.</p>
            ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {viewedCourseOfferingsDetails.map((offering) => (
                        <div key={offering.offering_id} className="p-3 border rounded-lg bg-gray-50">
                            <p><span className="font-semibold">Course:</span> {offering.course_name}</p>
                            <p><span className="font-semibold">Instructor:</span> {offering.instructor_first_name} {offering.instructor_last_name}</p>
                            <p><span className="font-semibold">Capacity:</span> {offering.capacity}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end mt-6">
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
            <p>Are you sure you want to delete section {sectionToDelete}?</p>
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
      {showAssignModal && selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">
              Assign Courses to {selectedSection.section_name}
            </h3>
            
            {/* Current Assignments */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Current Assignments</h4>
              <div className="max-h-40 overflow-y-auto">
                {courseOfferings.map(offering => (
                  <div key={offering.offering_id} className="flex justify-between items-center p-2 bg-gray-50 rounded mb-2">
                    <span>{offering.course_name}</span>
                    <span>{offering.instructor_first_name} {offering.instructor_last_name}</span>
                    <span>Capacity: {offering.capacity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment Form */}
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div className="relative">
                <label htmlFor="course-search" className="block text-sm font-medium text-gray-700">Search Course</label>
                <input
                  type="text"
                  id="course-search"
                  placeholder="Search by Course Name or ID"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={courseSearchTerm}
                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                />
                {courseSearchTerm && filteredCoursesOptions.length > 0 && (
                  <div className="absolute z-10 bg-white border border-gray-300 w-full rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                    {filteredCoursesOptions.map(course => (
                      <div
                        key={course.course_id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleCourseSelect(course)}
                      >
                        {course.course_name} ({course.course_id})
                      </div>
                    ))}
                  </div>
                )}
                {selectedCourseName && !courseSearchTerm && (
                    <p className="text-sm text-gray-600 mt-1">Selected Course: <span className="font-semibold">{selectedCourseName}</span></p>
                )}
                 {!assignFormData.course_id && !selectedCourseName && (
                    <p className="text-sm text-red-500 mt-1">Please select a course</p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="instructor-search" className="block text-sm font-medium text-gray-700">Search Instructor</label>
                <input
                  type="text"
                  id="instructor-search"
                  placeholder="Search by Name or ID"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={instructorSearchTerm}
                  onChange={(e) => setInstructorSearchTerm(e.target.value)}
                />
                {instructorSearchTerm && filteredInstructorsOptions.length > 0 && (
                  <div className="absolute z-10 bg-white border border-gray-300 w-full rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                    {filteredInstructorsOptions.map(instructor => (
                      <div
                        key={instructor.instructor_id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleInstructorSelect(instructor)}
                      >
                        {instructor.first_name} {instructor.last_name} ({instructor.instructor_id})
                      </div>
                    ))
                  }
                  </div>
                )}
                {selectedInstructorName && !instructorSearchTerm && (
                    <p className="text-sm text-gray-600 mt-1">Selected Instructor: <span className="font-semibold">{selectedInstructorName}</span></p>
                )}
                {!assignFormData.instructor_id && !selectedInstructorName && (
                    <p className="text-sm text-red-500 mt-1">Please select an instructor</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={assignFormData.capacity}
                  onChange={handleAssignFormChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Assign Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSections; 