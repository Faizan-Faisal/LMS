import React, { useState } from 'react';

interface Student {
  id: number;
  name: string;
  email: string;
  courses: string;
  status: 'Active' | 'Inactive';
}

const mockStudents: Student[] = [
  { id: 101, name: 'John Doe', email: 'john@student.edu', courses: 'CS101, MATH201', status: 'Active' },
  { id: 102, name: 'Jane Smith', email: 'jane@student.edu', courses: 'PHY101', status: 'Inactive' },
  { id: 103, name: 'Mike Brown', email: 'mike@student.edu', courses: 'CS101', status: 'Active' },
];

const ManageStudents: React.FC = () => {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'add' | 'edit'>('add');
  const [selected, setSelected] = useState<Student | null>(null);
  const [viewed, setViewed] = useState<Student | null>(null);

  const filtered = students.filter(
    (stu) =>
      stu.name.toLowerCase().includes(search.toLowerCase()) ||
      stu.email.toLowerCase().includes(search.toLowerCase()) ||
      stu.id.toString().includes(search)
  );

  const handleAdd = () => {
    setFormType('add');
    setSelected(null);
    setShowForm(true);
  };
  const handleEdit = (stu: Student) => {
    setFormType('edit');
    setSelected(stu);
    setShowForm(true);
  };
  const handleDelete = (id: number) => {
    setStudents((prev) => prev.filter((stu) => stu.id !== id));
  };
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowForm(false);
  };
  const handleRefresh = () => {
    setStudents(mockStudents);
  };
  const handleView = (stu: Student) => {
    setViewed(stu);
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
              placeholder="Search students..."
              className="w-full md:w-80 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-3 mt-2 md:mt-0">
              <button
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                onClick={handleAdd}
              >
                Register New Student
              </button>
              <button
                className="bg-blue-100 text-blue-700 px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-200 transition"
                onClick={handleRefresh}
              >
                Refresh List
              </button>
            </div>
          </div>
          <div className="rounded-xl">
            <table className="w-full bg-white rounded-xl">
              <thead>
                <tr className="bg-gray-50 text-slate-700 text-sm">
                  <th className="py-3 px-4 text-left font-bold tracking-wide">STUDENT ID</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">NAME</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">EMAIL</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">COURSES</th>
                  <th className="py-3 px-4 text-left font-bold tracking-wide">STATUS</th>
                  <th className="py-3 px-4 text-center font-bold tracking-wide">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">No students found</td>
                  </tr>
                ) : (
                  filtered.map((stu) => (
                    <tr key={stu.id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="py-3 px-4 font-semibold">{stu.id}</td>
                      <td className="py-3 px-4">{stu.name}</td>
                      <td className="py-3 px-4">{stu.email}</td>
                      <td className="py-3 px-4">{stu.courses}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${stu.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{stu.status}</span>
                      </td>
                      <td className="py-3 px-4 text-center flex gap-2 justify-center">
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-blue-500 hover:bg-blue-600 rounded text-white transition"
                          title="View"
                          onClick={() => handleView(stu)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded text-white transition"
                          title="Edit"
                          onClick={() => handleEdit(stu)}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11-11a2.828 2.828 0 00-4-4L5 17v4z" /></svg>
                        </button>
                        <button
                          className="flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 rounded text-white transition"
                          title="Delete"
                          onClick={() => handleDelete(stu.id)}
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
              <div><span className="font-semibold">ID:</span> {viewed.id}</div>
              <div><span className="font-semibold">Name:</span> {viewed.name}</div>
              <div><span className="font-semibold">Email:</span> {viewed.email}</div>
              <div><span className="font-semibold">Courses:</span> {viewed.courses}</div>
              <div><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-bold ${viewed.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{viewed.status}</span></div>
            </div>
            <div className="flex justify-end">
              <button onClick={closeView} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for Add/Edit Student */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-6">{formType === 'add' ? 'Register New Student' : 'Update Student'}</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">Name</label>
                <input className="w-full px-4 py-2 border rounded-lg" defaultValue={selected?.name || ''} required />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Email</label>
                <input type="email" className="w-full px-4 py-2 border rounded-lg" defaultValue={selected?.email || ''} required />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Courses</label>
                <input className="w-full px-4 py-2 border rounded-lg" defaultValue={selected?.courses || ''} required />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Status</label>
                <select className="w-full px-4 py-2 border rounded-lg" defaultValue={selected?.status || 'Active'} required>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">{formType === 'add' ? 'Register' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents; 