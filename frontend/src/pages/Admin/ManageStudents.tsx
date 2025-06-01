import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// Assume studentapi.ts exists with similar functions for students
import { getStudents, addStudent, getStudentById, updateStudent, deleteStudent } from '../../api/studentapi';
// Assume API functions for programs exist
import { getSections } from '../../api/sectionapi';
import { getdepartments } from '../../api/departmentapi';

interface Student {
  student_id: string; // Change back to string for the pattern
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  cnic: string;
  program: string; // Assuming program is a string identifier
  section: string; // Assuming section is a string identifier
  enrollment_year: number;
  picture?: string; // Optional picture filename
}

const ManageStudents: React.FC = () => {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<string[]>([]); // State for programs
  const [sections, setSections] = useState<string[]>([]); // State for sections
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'add' | 'edit'>('add');
  const [selected, setSelected] = useState<Student | null>(null);
  const [viewed, setViewed] = useState<Student | null>(null);
  const [formData, setFormData] = useState<any>({
    student_id: '', // Initialize as empty string
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    cnic: '',
    program: '',
    section: '',
    enrollment_year: '', // Keep as string for input field
    picture: '',
    pictureFile: null,
  });
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null); // Use student_id for deletion

  useEffect(() => {
    fetchStudents();
    fetchPrograms(); // Fetch programs
    fetchSections(); // Fetch sections
  }, []);
  
  const fetchPrograms = async () => {
    try {
      // Use getdepartments to fetch programs
      const res = await getdepartments(); 
      console.log('Departments API response:', res.data);
      // Assuming departments API returns an array of department objects with a 'department_name' property
      const programNames = res.data.map((dept: any) => dept.department_name); // Use department_name
      setPrograms(programNames);
    } catch (err) {
      console.error('Error fetching programs (departments):', err);
      toast.error('Failed to load programs.');
    }
  };
  
  const fetchSections = async () => {
    try {
      const res = await getSections();
      console.log('Sections API response:', res.data);
      // Assuming sections API returns an array of section objects with a 'section_name' property
      const sectionNames = res.data.map((sec: any) => sec.section_name); // Use section_name
      setSections(sectionNames);
    } catch (err) {
      console.error('Error fetching sections:', err);
      toast.error('Failed to load sections.');
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await getStudents();
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(
    (student) =>
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      student.student_id.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase()) ||
      student.program.toLowerCase().includes(search.toLowerCase()) ||
      student.section.toLowerCase().includes(search.toLowerCase())
      // Add other searchable fields as needed
  );

  const handleAdd = () => {
    setFormType('add');
    setSelected(null);
    setFormData({
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      cnic: '',
      program: '',
      section: '',
      enrollment_year: '',
      picture: '',
      pictureFile: null,
    });
    setPicturePreview(null);
    setShowForm(true);
  };

  const handleEdit = (student: Student) => {
    setFormType('edit');
    setSelected(student);
    const pictureUrl = student.picture ? `http://localhost:8000/uploads_student_img/${student.picture}` : null; // Construct full URL

    setFormData({
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      phone_number: student.phone_number,
      cnic: student.cnic,
      program: student.program,
      section: student.section,
      enrollment_year: student.enrollment_year,
      picture: student.picture || '',
      pictureFile: null,
    });
    setPicturePreview(pictureUrl);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setStudentToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete === null) return;

    try {
      setLoading(true);
      await deleteStudent(studentToDelete);
      toast.success('Student deleted successfully.');
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      toast.error('Failed to delete student.');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (name === 'picture' && files && files[0]) {
      setFormData((prev: any) => ({ ...prev, pictureFile: files[0] }));
      const reader = new FileReader();
      reader.onload = (ev) => setPicturePreview(ev.target?.result as string);
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // --- Input Validation ---

    const phoneRegex = /^3\d{2}-\d{4}-\d{3}$/;
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    const studentIdRegex = /^NUML-F\d{2}-\d+$/;

    if (formData.phone_number && !phoneRegex.test(formData.phone_number)) {
      toast.error('Invalid Phone Number format.'); // Customize message
      setLoading(false);
      return;
    }

    if (formData.cnic && !cnicRegex.test(formData.cnic)) {
      toast.error('Invalid CNIC format. Expected: xxxxx-xxxxxxx-x');
      setLoading(false);
      return;
    }

    if (formData.student_id && !studentIdRegex.test(formData.student_id)) {
      toast.error('Invalid Student ID format. Expected: NUML-F**-*****'); // Updated error message
      setLoading(false);
      return; // Stop submission
    }

    if (formType === 'add') {
      if (!studentIdRegex.test(formData.student_id)) {
        toast.error('Invalid Student ID format. Expected: NUML-F**-*****'); // Updated error message
        setLoading(false);
        return; // Stop submission
      }
      // Add student_id existence check if needed
      // Note: If backend auto-generates ID, you might not need this check or the student_id field in the form
    }

    try {
      const data = new FormData();
      data.append('student_id', formData.student_id);
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('email', formData.email);
      data.append('phone_number', formData.phone_number);
      data.append('cnic', formData.cnic);
      data.append('program', formData.program);
      data.append('section', formData.section);
      data.append('enrollment_year', formData.enrollment_year);
      if (formData.pictureFile) {
        data.append('picture', formData.pictureFile);
      }

      if (formType === 'add') {
        await addStudent(data);
        toast.success('Student added successfully.');
      } else if (formType === 'edit' && selected) {
        await updateStudent(selected.student_id, data);
        toast.success('Student updated successfully.');
      }

      setShowForm(false);
      fetchStudents();
    } catch (err: any) {
      console.error('Error saving student:', err);
      toast.error(err.response?.data?.detail || 'Failed to save student.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      cnic: '',
      program: '',
      section: '',
      enrollment_year: '',
      picture: '',
      pictureFile: null,
    });
    setPicturePreview(null);
  };

  const handleRefresh = () => {
    fetchStudents();
  };

  const handleView = (student: Student) => {
    setViewed(student);
  };
  const closeView = () => setViewed(null);

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <div className="w-full max-w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full p-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Student Management</h2>
          <hr className="mb-4 mt-2" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <input
              type="text"
              placeholder="Search by Student Name, ID, Email, Program, Section..."
              className="w-full md:w-80 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-3 mt-2 md:mt-0">
              <button
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                onClick={handleAdd}
              >
                Add New Student
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
              <h3 className="text-xl font-bold mb-6">{formType === 'add' ? 'Add New Student' : 'Update Student'}</h3>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Column: Picture Upload and Preview */}
                  <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 overflow-hidden">
                      {picturePreview ? (
                        <img src={picturePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                      ) : ( 
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      )}
                    </div>
                    <input 
                      name="picture" 
                      type="file" 
                       className="block w-full text-sm text-gray-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
                      onChange={handleFormChange} 
                       accept="image/*"
                    />
                    <p className="text-sm text-gray-500">Upload a profile picture (JPG, PNG)</p>
                  </div>
                  {/* Right Column: Form Fields */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-1 font-semibold">Student ID</label>
                      <input 
                        name="student_id" 
                        type="text" // Keep as text for easier input of the pattern
                        placeholder="e.g., NUML-F23-00000" // Updated placeholder
                        className="w-full px-4 py-2 border rounded-lg {formType === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''}"
                        value={formData.student_id} 
                        onChange={handleFormChange} 
                        required 
                        readOnly={formType === 'edit'} // Student ID likely not editable when editing
                      />
                      <span className="text-xs text-gray-400">Must follow the pattern Numl-F**-*****</span>
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">First Name</label>
                      <input 
                        name="first_name" 
                        type="text" 
                        placeholder="Enter first name" 
                        className="w-full px-4 py-2 border rounded-lg"
                        value={formData.first_name} 
                        onChange={handleFormChange} 
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Last Name</label>
                      <input 
                        name="last_name" 
                        type="text" 
                        placeholder="Enter last name" 
                        className="w-full px-4 py-2 border rounded-lg"
                        value={formData.last_name} 
                        onChange={handleFormChange} 
                        required
                      />
                    </div>
                     <div>
                      <label className="block mb-1 font-semibold">Email</label>
                      <input 
                        name="email" 
                        type="email" 
                        placeholder="Enter email" 
                        className="w-full px-4 py-2 border rounded-lg"
                        value={formData.email} 
                        onChange={handleFormChange} 
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Phone Number</label>
                      <input 
                        name="phone_number" 
                        type="text" 
                        placeholder="e.g., 3xx-xxxx-xxx" 
                        className="w-full px-4 py-2 border rounded-lg"
                        value={formData.phone_number} 
                        onChange={handleFormChange} 
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">CNIC</label>
                      <input 
                        name="cnic" 
                        type="text" 
                        placeholder="e.g., xxxxx-xxxxxxx-x" 
                        className="w-full px-4 py-2 border rounded-lg"
                        value={formData.cnic} 
                        onChange={handleFormChange} 
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Program</label>
                      <select
                        name="program"
                        value={formData.program}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="">Select Program</option>
                        {programs.map((prog) => (
                          <option key={prog} value={prog}>{prog}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Section</label>
                      <select
                        name="section"
                        value={formData.section}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="">Select Section</option>
                        {sections.map((sec) => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Enrollment Year</label>
                      <input 
                        name="enrollment_year" 
                        type="number" // Use number type for year
                        placeholder="e.g., 2023" 
                        className="w-full px-4 py-2 border rounded-lg"
                        value={formData.enrollment_year} 
                        onChange={handleFormChange} 
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-4 justify-end">
                  <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" onClick={handleReset}>Reset Form</button>
                  <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">{loading ? 'Processing...' : formType === 'add' ? 'Add Student' : 'Update Student'}</button>
                </div>
              </form>
            </div>
          )}
          {/* Student Table Below Form */}
          <div className="rounded-xl">
            <table className="w-full bg-white rounded-xl">
              <thead>
                <tr className="bg-gray-50 text-slate-700 text-sm">
                  <th className="py-3 px-4 text-left font-bold tracking-wide">STUDENT ID</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">FIRST NAME</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">LAST NAME</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">EMAIL</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">PHONE NUMBER</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">CNIC</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">PROGRAM</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">SECTION</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">ENROLLMENT YEAR</th>
                  <th className="py-3 px-4 text-center font-bold tracking-wide">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-400">No students found</td>
                  </tr>
                ) : (
                  filtered.map((student) => (
                    <tr key={student.student_id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="py-3 px-4 font-semibold">{student.student_id}</td>
                      <td className="py-3 px-4">{student.first_name}</td>
                      <td className="py-3 px-4">{student.last_name}</td>
                      <td className="py-3 px-4">{student.email}</td>
                      <td className="py-3 px-4">{student.phone_number}</td>
                      <td className="py-3 px-4">{student.cnic}</td>
                      <td className="py-3 px-4">{student.program}</td>
                      <td className="py-3 px-4">{student.section}</td>
                      <td className="py-3 px-4">{student.enrollment_year}</td>
                      <td className="py-3 px-4 text-center flex gap-2 justify-center">
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-blue-500 hover:bg-blue-600 rounded text-white transition"
                          title="View"
                          onClick={() => handleView(student)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded text-white transition"
                          title="Edit"
                          onClick={() => handleEdit(student)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11-11a2.828 2.828 0 00-4-4L5 17v4z" /></svg>
                        </button>
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 rounded text-white transition"
                          title="Delete"
                          onClick={() => handleDelete(student.student_id)}
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
      {/* Modal for View Student */}
      {viewed && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Student Details</h3>
            <div className="space-y-2 mb-6">
              <div><span className="font-semibold">Student ID:</span> {viewed.student_id}</div>
              <div><span className="font-semibold">First Name:</span> {viewed.first_name}</div>
              <div><span className="font-semibold">Last Name:</span> {viewed.last_name}</div>
              <div><span className="font-semibold">Email:</span> {viewed.email}</div>
              <div><span className="font-semibold">Phone Number:</span> {viewed.phone_number}</div>
              <div><span className="font-semibold">CNIC:</span> {viewed.cnic}</div>
              <div><span className="font-semibold">Program:</span> {viewed.program}</div>
              <div><span className="font-semibold">Section:</span> {viewed.section}</div>
              <div><span className="font-semibold">Enrollment Year:</span> {viewed.enrollment_year}</div>
               {viewed.picture && (
                <div><span className="font-semibold">Picture:</span> 
                   <img src={`http://localhost:8000/uploads/${viewed.picture}`} alt="Student Picture" className="h-20 w-20 object-cover rounded-lg inline-block ml-2" />
                </div>
              )}
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
            <p>Are you sure you want to delete student {studentToDelete}?</p>
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

export default ManageStudents; 