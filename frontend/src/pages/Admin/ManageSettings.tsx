import React, { useState, useEffect } from 'react';
import { getdepartments, adddepartment, deletedepartment } from '../../api/departmentapi';
import { toast } from 'react-toastify';

interface Department {
  department_name: string; // Use backend's key name
}

const ManageSettings: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete modal
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null); // State to hold department name to delete

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await getdepartments();
      // Backend returns [{ "department_name": "..." }, ...]
      // The state structure now matches this, so no mapping needed here
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      toast.error('Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) {
      toast.warning('Department name cannot be empty.');
      return;
    }
    try {
      setLoading(true);
      const data = new FormData();
      data.append('department_name', newDepartmentName); // Corrected key name
      await adddepartment(data);
      toast.success('Department added successfully.');
      setNewDepartmentName('');
      fetchDepartments(); // Refresh list
    } catch (err: any) {
      console.error('Error adding department:', err);
      toast.error(err.response?.data?.detail || 'Failed to add department.');
    } finally {
      setLoading(false);
    }
  };

  // This function now just opens the modal
  const handleDeleteDepartment = (name: string) => {
    setDepartmentToDelete(name);
    setShowDeleteModal(true);
  };

  // This function handles the actual deletion after confirmation
  const confirmDeleteDepartment = async () => {
    if (departmentToDelete === null) return; // Should not happen if modal is open correctly

    try {
      setLoading(true);
      // Assuming API deletes by name
      await deletedepartment(departmentToDelete);
      toast.success('Department deleted successfully.');
      fetchDepartments(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting department:', err);
      // Handle case where department might be in use
      toast.error(err.response?.data?.detail || 'Failed to delete department.');
    } finally {
      setLoading(false);
      setShowDeleteModal(false); // Close modal
      setDepartmentToDelete(null); // Clear state
    }
  };

  const cancelDeleteDepartment = () => {
    setShowDeleteModal(false); // Close modal
    setDepartmentToDelete(null); // Clear state
  };

  const filteredDepartments = departments.filter(dept =>
    // Use department_name for filtering and safely access
    dept && typeof dept.department_name === 'string' && dept.department_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Department Management</h1>

      {/* Add Department Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Department</h2>
        <form onSubmit={handleAddDepartment} className="flex gap-4">
          <input
            type="text"
            placeholder="Enter department name"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
            className="flex-grow border p-2 rounded-lg"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Adding...' : '+ Add'}
          </button>
        </form>
      </div>

      {/* Current Departments List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Current Departments</h2>
        <input
          type="text"
          placeholder="Search departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border p-2 rounded-lg mb-4"
        />
        {loading ? (
          <div className="text-center py-4">Loading departments...</div>
        ) : (
          <ul className="space-y-3">
            {filteredDepartments.length === 0 ? (
              <li className="text-center text-gray-500">No departments found.</li>
            ) : (
              filteredDepartments.map(dept => (
                // Use department_name as the key since ID is not provided in the list response
                <li key={dept.department_name} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                  <span>{dept.department_name}</span>{/* Use department_name for display */}
                  <button
                    onClick={() => handleDeleteDepartment(dept.department_name)}
                    className="text-red-500 hover:text-red-700 disabled:text-gray-400"
                    disabled={loading}
                    title="Delete Department"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete department "{departmentToDelete}"?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={cancelDeleteDepartment}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDepartment}
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

export default ManageSettings; 