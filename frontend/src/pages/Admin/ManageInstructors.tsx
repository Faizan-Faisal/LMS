import React, { useState, useEffect } from 'react';
import { getInstructors, addInstructor, getInstructorById, updateInstructor, deleteInstructor } from '../../api/instructorapi';
import { getdepartments , adddepartment , getdepartmentByName , deletedepartment} from '../../api/departmentapi';
import { toast } from 'react-toastify';

interface Instructor {
  instructor_id: string;
  first_name: string;
  last_name: string;
  email: string;
  cnic: string;
  department: string;
  qualification: string;
  year_of_experience: number;
  picture?: string;
  courses?: string;
  status?: 'Active' | 'Inactive';
  phone_number?: string;
  specialization?: string;
}

const ManageInstructors: React.FC = () => {
  const [search, setSearch] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'add' | 'edit'>('add');
  const [selected, setSelected] = useState<Instructor | null>(null);
  const [viewed, setViewed] = useState<Instructor | null>(null);
  const [formData, setFormData] = useState<any>({
    instructor_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cnic: '',
    department: '',
    qualification: '',
    specialization: '',
    year_of_experience: '',
    picture: '',
    pictureFile: null,
  });
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchInstructors();
    fetchDepartments();
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
  
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await getInstructors();
      setInstructors(res.data);
    } catch (err) {
      console.error('Error fetching instructors:', err);
      toast.error('Failed to fetch instructors.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = instructors.filter(
    (ins) =>
      `${ins.first_name} ${ins.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      ins.email.toLowerCase().includes(search.toLowerCase()) ||
      (ins.instructor_id + '').includes(search)
  );

  const handleAdd = () => {
    setFormType('add');
    setSelected(null);
    setFormData({
      instructor_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      cnic: '',
      department: '',
      qualification: '',
      specialization: '',
      year_of_experience: '',
      picture: '',
      pictureFile: null,
    });
    setPicturePreview(null);
    setShowForm(true);
  };

  const handleEdit = (ins: Instructor) => {
    setFormType('edit');
    setSelected(ins);
    // Construct the full picture URL if a picture filename exists
    const pictureUrl = ins.picture ? `http://localhost:8000/uploads/${ins.picture}` : null; // Construct full URL

    setFormData({
      instructor_id: ins.instructor_id,
      first_name: ins.first_name,
      last_name: ins.last_name,
      email: ins.email,
      phone: ins.phone_number || '',
      cnic: ins.cnic,
      department: ins.department,
      qualification: ins.qualification,
      specialization: ins.specialization || '',
      year_of_experience: ins.year_of_experience,
      picture: ins.picture || '', // Keep the filename in formData if needed elsewhere
      pictureFile: null,
    });
    setPicturePreview(pictureUrl); // Use the constructed URL for preview
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setInstructorToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (instructorToDelete === null) return; // Should not happen if modal is open correctly

    try {
      setLoading(true);
      await deleteInstructor(instructorToDelete);
      toast.success('Instructor deleted successfully.');
      fetchInstructors(); // Refresh list
    } catch (err) {
      console.error('Error deleting instructor:', err);
      toast.error('Failed to delete instructor.');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setInstructorToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setInstructorToDelete(null);
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
    const instructorIdRegex = /^INS\d+$/; // Regex to check for INS prefix followed by numbers

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast.error('Invalid Phone Number format. Expected: 3xx-xxxx-xxx');
      setLoading(false);
      return;
    }

    if (formData.cnic && !cnicRegex.test(formData.cnic)) {
      toast.error('Invalid CNIC format. Expected: xxxxx-xxxxxxx-x');
      setLoading(false);
      return;
    }

    if (formType === 'add') {
      // Validate Instructor ID format
      if (!instructorIdRegex.test(formData.instructor_id)) {
        toast.error('Invalid Instructor ID format. Must start with INS followed by numbers.');
        setLoading(false);
        return; // Stop submission
      }

      // Check if instructor_id already exists
      try {
        await getInstructorById(formData.instructor_id);
        // If successful, instructor exists
        toast.error('Instructor with this ID already exists.');
        setLoading(false);
        return; // Stop submission
      } catch (err: any) {
        // If error is 404, instructor does not exist, proceed.
        if (err.response && err.response.status === 404) {
          // continue to add
        } else {
          // Other error during check
          console.error('Error checking instructor ID:', err);
          toast.error('Error checking instructor ID.');
          setLoading(false);
          return; // Stop submission due to unexpected error
        }
      }
    }

    try {
      const data = new FormData();
      data.append('instructor_id', formData.instructor_id);
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('email', formData.email);
      data.append('phone_number', formData.phone);
      data.append('cnic', formData.cnic);
      data.append('department', formData.department);
      data.append('qualification', formData.qualification);
      data.append('specialization', formData.specialization || '');
      data.append('year_of_experience', formData.year_of_experience.toString());
      if (formData.pictureFile) {
        data.append('picture', formData.pictureFile);
      }

      if (formType === 'add') {
        await addInstructor(data);
        toast.success('Instructor registered successfully.');
      } else if (formType === 'edit' && selected) {
        await updateInstructor(selected.instructor_id, data);
        toast.success('Instructor updated successfully.');
      }

      setShowForm(false);
      fetchInstructors(); // Refresh list
    } catch (err: any) {
      console.error('Error saving instructor:', err);
      toast.error(err.response?.data?.detail || 'Failed to save instructor.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      instructor_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      cnic: '',
      department: '',
      qualification: '',
      specialization: '',
      year_of_experience: '',
      picture: '',
      pictureFile: null,
    });
    setPicturePreview(null);
  };

  const handleRefresh = () => {
    fetchInstructors();
  };

  const handleView = (ins: Instructor) => {
    setViewed(ins);
  };
  const closeView = () => setViewed(null);

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <div className="w-full max-w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full p-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Instructor Management</h2>
          <hr className="mb-4 mt-2" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <input
              type="text"
              placeholder="Search instructors..."
              className="w-full md:w-80 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-3 mt-2 md:mt-0">
              <button
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                onClick={handleAdd}
              >
                Register New Instructor
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
              <h3 className="text-xl font-bold mb-6">{formType === 'add' ? 'Register New Instructor' : 'Update Instructor'}</h3>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Profile Picture Upload & Preview */}
                  <div className="col-span-1 flex flex-col items-center justify-start">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 overflow-hidden bg-white">
                      {picturePreview ? (
                        <img src={picturePreview} alt="Profile Preview" className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-gray-400">{formType === 'edit' && selected?.picture ? 'Picture not found' : 'Profile Preview'}</span>
                      )}
                    </div>
                    <input type="file" name="picture" accept="image/*" onChange={handleFormChange} className="w-full" />
                    <span className="text-xs text-gray-400 mt-1">Upload a profile picture (JPG, PNG)</span>
                  </div>
                  {/* Main Fields */}
                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-semibold">Instructor ID</label>
                      <input 
                        name="instructor_id" 
                        type="text" 
                        placeholder="e.g., INS001" 
                        className="w-full px-4 py-2 border rounded-lg {formType === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''}"
                        value={formData.instructor_id}
                        onChange={handleFormChange}
                        required
                        readOnly={formType === 'edit'}
                      />
                      <span className="text-xs text-gray-400">Must start with INS followed by numbers</span>
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">First Name</label>
                      <input name="first_name" className="w-full px-4 py-2 border rounded-lg" value={formData.first_name} onChange={handleFormChange} required />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Last Name</label>
                      <input name="last_name" className="w-full px-4 py-2 border rounded-lg" value={formData.last_name} onChange={handleFormChange} required />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Email</label>
                      <input name="email" type="email" className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={handleFormChange} required />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Phone Number</label>
                      <input name="phone" type="text" placeholder="3XX-XXXX-XXX" className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={handleFormChange} />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">CNIC</label>
                      <input name="cnic" type="text" placeholder="XXXXX-XXXXXXX-X" className="w-full px-4 py-2 border rounded-lg" value={formData.cnic} onChange={handleFormChange} required />
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
                      <label className="block mb-1 font-semibold">Qualification</label>
                      <input name="qualification" className="w-full px-4 py-2 border rounded-lg" value={formData.qualification} onChange={handleFormChange} required />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Specialization</label>
                      <input name="specialization" className="w-full px-4 py-2 border rounded-lg" value={formData.specialization} onChange={handleFormChange} />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Years of Experience</label>
                      <input name="year_of_experience" type="number" className="w-full px-4 py-2 border rounded-lg" value={formData.year_of_experience} onChange={handleFormChange} required />
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-4 justify-end">
                  <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" onClick={handleReset}>Reset Form</button>
                  <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">{loading ? 'Processing...' : formType === 'add' ? 'Register Instructor' : 'Update Instructor'}</button>
                </div>
              </form>
            </div>
          )}
          {/* Instructor Table Below Form */}
          <div className="rounded-xl">
            <table className="w-full bg-white rounded-xl">
              <thead>
                <tr className="bg-gray-50 text-slate-700 text-sm">
                  <th className="py-3 px-4 text-left font-bold tracking-wide">INSTRUCTOR ID</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">NAME</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">EMAIL</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">DEPARTMENT</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">QUALIFICATION</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">EXPERIENCE</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">STATUS</th>
                  <th className="py-3 px-4 text-center font-bold tracking-wide">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">No instructors found</td>
                  </tr>
                ) : (
                  filtered.map((ins) => (
                    <tr key={ins.instructor_id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="py-3 px-4 font-semibold">{ins.instructor_id}</td>
                      <td className="py-3 px-4">{ins.first_name} {ins.last_name}</td>
                      <td className="py-3 px-4">{ins.email}</td>
                      <td className="py-3 px-4">{ins.department}</td>
                      <td className="py-3 px-4">{ins.qualification}</td>
                      <td className="py-3 px-4">{ins.year_of_experience} yrs</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${ins.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{ins.status}</span>
                      </td>
                      <td className="py-3 px-4 text-center flex gap-2 justify-center">
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-blue-500 hover:bg-blue-600 rounded text-white transition"
                          title="View"
                          onClick={() => handleView(ins)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded text-white transition"
                          title="Edit"
                          onClick={() => handleEdit(ins)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11-11a2.828 2.828 0 00-4-4L5 17v4z" /></svg>
                        </button>
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 rounded text-white transition"
                          title="Delete"
                          onClick={() => handleDelete(ins.instructor_id)}
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
      {/* Modal for View Instructor */}
      {viewed && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Instructor Details</h3>
            <div className="space-y-2 mb-6">
              <div><span className="font-semibold">ID:</span> {viewed.instructor_id}</div>
              <div><span className="font-semibold">Name:</span> {viewed.first_name} {viewed.last_name}</div>
              <div><span className="font-semibold">Email:</span> {viewed.email}</div>
              <div><span className="font-semibold">Phone:</span> {viewed.phone_number || 'N/A'}</div>
              <div><span className="font-semibold">CNIC:</span> {viewed.cnic}</div>
              <div><span className="font-semibold">Department:</span> {viewed.department}</div>
              <div><span className="font-semibold">Qualification:</span> {viewed.qualification}</div>
              <div><span className="font-semibold">Experience:</span> {viewed.year_of_experience} yrs</div>
              {viewed.picture && <div><span className="font-semibold">Picture:</span> <img src={viewed.picture} alt="Instructor" className="h-16 w-16 rounded-full inline-block ml-2" /></div>}
              <div><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-bold ${viewed.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{viewed.status}</span></div>
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
            <p>Are you sure you want to delete this instructor?</p>
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

export default ManageInstructors; 
