import React, { useState, useEffect } from 'react';
import { 
    createAnnouncement, 
    getAllAnnouncements, 
    updateAnnouncement, 
    deleteAnnouncement, 
} from '../../api/announcementsapi';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getdepartments } from '../../api/departmentapi'; // Import getdepartments
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

interface Department { // Define Department interface
    
    department_name: string;
}

// Types moved from announcementsapi.ts
interface AnnouncementBase {
    title: string;
    message: string;
    recipient_type: string; // 'all_students', 'all_instructors', 'specific_students', 'specific_instructors', 'department_instructors', or 'all'
    recipient_ids?: string | null; // Comma-separated IDs
    department_name?: string | null; // Changed from department_id to department_name
    priority: 'Normal' | 'High';
    valid_until?: string | null; // YYYY-MM-DD format
}

interface AnnouncementCreatePayload {
    title: string;
    message: string;
    recipient_type: string;
    recipient_ids?: string | null;
    department_name?: string | null; // Changed from department_id to department_name
    priority?: 'Normal' | 'High';
    valid_until?: string | null;
}

interface AnnouncementRead extends AnnouncementBase {
    announcement_id: number;
    created_at: string; // datetime object from backend will be string in frontend
    department?: Department; // Include department details
}

interface AnnouncementFormState {
    title: string;
    message: string;
    recipient_type: string;
    recipient_ids: string; // Stored as comma-separated string
    department_name: string | ''; // Changed from department_id for dropdown selection
    priority: 'Normal' | 'High';
    valid_until: Date | null;
}

const ManageAnnouncements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<AnnouncementRead[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]); // New state for departments
    const [form, setForm] = useState<AnnouncementFormState>({
        title: '',
        message: '',
        recipient_type: 'all_students', // Default to All Students
        recipient_ids: '',
        department_name: '', // Changed from department_id
        priority: 'Normal',
        valid_until: null,
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentAnnouncementId, setCurrentAnnouncementId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false); // State for view modal
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementRead | null>(null); // State for selected announcement
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false); // State for delete confirmation modal
    const [announcementToDelete, setAnnouncementToDelete] = useState<number | null>(null); // State to store ID of announcement to delete

    useEffect(() => {
        fetchAnnouncements();
        fetchDepartments(); // Fetch departments on mount
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await getAllAnnouncements();
            setAnnouncements(response.data);
        } catch (error) {
            toast.error("Failed to fetch announcements.");
            console.error("Error fetching announcements:", error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await getdepartments();
            setDepartments(response.data);
        } catch (error) {
            toast.error("Failed to fetch departments.");
            console.error("Error fetching departments:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === 'recipient_type') {
            setForm(prev => ({
                ...prev,
                recipient_type: value,
                // Reset department_name and recipient_ids when recipient_type changes
                recipient_ids: '',
                department_name: '', // Changed from department_id
            }));
        } else {
            setForm(prev => ({
                ...prev,
                [name]: type === 'number' ? parseInt(value) : value
            }));
        }
    };

    const handleDateChange = (date: Date | null) => {
        setForm(prev => ({
            ...prev,
            valid_until: date
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: AnnouncementCreatePayload = {
            title: form.title,
            message: form.message,
            recipient_type: form.recipient_type,
            priority: form.priority,
            valid_until: form.valid_until ? form.valid_until.toISOString().split('T')[0] : null // YYYY-MM-DD
        };

        // Conditionally add recipient_ids or department_name
        if (form.recipient_type === 'specific_students' || form.recipient_type === 'specific_instructors') {
            payload.recipient_ids = form.recipient_ids;
        } else {
            payload.recipient_ids = null; // Ensure it's null for non-specific types
        }

        if (form.recipient_type === 'department_instructors') {
            payload.department_name = form.department_name === '' ? null : String(form.department_name); // Changed from department_id
        } else {
            payload.department_name = null; // Ensure it's null for other types
        }

        try {
            if (isEditing && currentAnnouncementId) {
                await updateAnnouncement(currentAnnouncementId, payload);
                toast.success("Announcement updated successfully!");
            } else {
                await createAnnouncement(payload);
                toast.success("Announcement created successfully!");
            }
            resetForm();
            fetchAnnouncements();
            setShowForm(false);
        } catch (error) {
            toast.error("Failed to save announcement.");
            console.error("Error saving announcement:", error);
        }
    };

    const handleEdit = (announcement: AnnouncementRead) => {
        setForm({
            title: announcement.title,
            message: announcement.message,
            recipient_type: announcement.recipient_type,
            recipient_ids: announcement.recipient_ids || '',
            department_name: announcement.department?.department_name || '', // Changed from department_id to department_name
            priority: announcement.priority as 'Normal' | 'High',
            valid_until: announcement.valid_until ? new Date(announcement.valid_until) : null,
        });
        setIsEditing(true);
        setCurrentAnnouncementId(announcement.announcement_id);
        setShowForm(true);
    };

    const handleDeleteClick = (announcement_id: number) => {
        setAnnouncementToDelete(announcement_id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (announcementToDelete) {
            try {
                await deleteAnnouncement(announcementToDelete);
                toast.success("Announcement deleted successfully!");
                fetchAnnouncements();
                setShowDeleteConfirm(false);
                setAnnouncementToDelete(null);
            } catch (error) {
                toast.error("Failed to delete announcement.");
                console.error("Error deleting announcement:", error);
            }
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setAnnouncementToDelete(null);
    };

    const resetForm = () => {
        setForm({
            title: '',
            message: '',
            recipient_type: 'all_students',
            recipient_ids: '',
            department_name: '', // Changed from department_id
            priority: 'Normal',
            valid_until: null,
        });
        setIsEditing(false);
        setCurrentAnnouncementId(null);
    };

    const handleCancel = () => {
        resetForm();
        setShowForm(false);
    };

    const handleView = (announcement: AnnouncementRead) => {
        setSelectedAnnouncement(announcement);
        setShowViewModal(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Announcements</h1>

            <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
            >
                + New Announcement
            </button>

            {showForm && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title*</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message*</label>
                            <textarea
                                name="message"
                                id="message"
                                value={form.message}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            ></textarea>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients*</label>
                            <div className="flex items-center space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="recipient_type"
                                        value="all_students"
                                        checked={form.recipient_type === 'all_students'}
                                        onChange={handleChange}
                                        className="form-radio"
                                    />
                                    <span className="ml-2 text-gray-700">All Students</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="recipient_type"
                                        value="all_instructors"
                                        checked={form.recipient_type === 'all_instructors'}
                                        onChange={handleChange}
                                        className="form-radio"
                                    />
                                    <span className="ml-2 text-gray-700">All Instructors</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="recipient_type"
                                        value="specific_students"
                                        checked={form.recipient_type === 'specific_students'}
                                        onChange={handleChange}
                                        className="form-radio"
                                    />
                                    <span className="ml-2 text-gray-700">Specific Students</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="recipient_type"
                                        value="specific_instructors"
                                        checked={form.recipient_type === 'specific_instructors'}
                                        onChange={handleChange}
                                        className="form-radio"
                                    />
                                    <span className="ml-2 text-gray-700">Specific Instructors</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="recipient_type"
                                        value="department_instructors"
                                        checked={form.recipient_type === 'department_instructors'}
                                        onChange={handleChange}
                                        className="form-radio"
                                    />
                                    <span className="ml-2 text-gray-700">Department Instructors</span>
                                </label>
                            </div>
                            {(form.recipient_type === 'specific_students' || form.recipient_type === 'specific_instructors') && (
                                <div className="mt-2">
                                    <label htmlFor="recipient_ids" className="block text-sm font-medium text-gray-700">Recipient IDs (comma-separated)</label>
                                    <input
                                        type="text"
                                        name="recipient_ids"
                                        id="recipient_ids"
                                        value={form.recipient_ids}
                                        onChange={handleChange}
                                        placeholder="e.g., 101,102,103"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                            )}
                            {form.recipient_type === 'department_instructors' && (
                                <div className="mt-2">
                                    <label htmlFor="department_name" className="block text-sm font-medium text-gray-700">Select Department</label>
                                    <select
                                        name="department_name"
                                        id="department_name"
                                        value={form.department_name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="">-- Select Department --</option>
                                        {departments.map(dept => (
                                            <option key={dept.department_name} value={dept.department_name}>
                                                {dept.department_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                                <select
                                    name="priority"
                                    id="priority"
                                    value={form.priority}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700">Valid Until</label>
                                <DatePicker
                                    selected={form.valid_until}
                                    onChange={handleDateChange}
                                    dateFormat="MM/dd/yyyy"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholderText="mm/dd/yyyy"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {isEditing ? 'Update Announcement' : 'Send Announcement'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Reset Form
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">All Announcements</h2>
                {announcements.length === 0 ? (
                    <p className="text-gray-600">No announcements found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recipients</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valid Until</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.map((announcement) => {
                                    const isValid = announcement.valid_until ? new Date(announcement.valid_until) >= new Date() : true;
                                    const statusText = isValid ? 'Active' : 'Expired';
                                    const statusColor = isValid ? 'text-green-600' : 'text-red-600';
                                    return (
                                        <tr key={announcement.announcement_id}>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                {new Date(announcement.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                {announcement.title}
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                {announcement.recipient_type === 'all_students' ? 'All Students' :
                                                 announcement.recipient_type === 'all_instructors' ? 'All Instructors' :
                                                 announcement.recipient_type === 'specific_students' ? `Specific Students (${announcement.recipient_ids || 'N/A'})` :
                                                 announcement.recipient_type === 'specific_instructors' ? `Specific Instructors (${announcement.recipient_ids || 'N/A'})` :
                                                 announcement.recipient_type === 'department_instructors' ? `Department Instructors (${announcement.department?.department_name || 'N/A'})` : 'N/A'}
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                {announcement.priority}
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                {announcement.valid_until ? new Date(announcement.valid_until).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${statusColor}`}> 
                                                    {statusText}
                                                </span>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleView(announcement)}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded"
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(announcement)}
                                                        className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-2 rounded"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(announcement.announcement_id)}
                                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Announcement Modal */}
            {showViewModal && selectedAnnouncement && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Announcement Details</h2>
                        <div className="space-y-2">
                            <p><strong>Title:</strong> {selectedAnnouncement.title}</p>
                            <p><strong>Message:</strong> {selectedAnnouncement.message}</p>
                            <p><strong>Recipient Type:</strong> {selectedAnnouncement.recipient_type === 'all_students' ? 'All Students' :
                                                 selectedAnnouncement.recipient_type === 'all_instructors' ? 'All Instructors' :
                                                 selectedAnnouncement.recipient_type === 'specific_students' ? `Specific Students (${selectedAnnouncement.recipient_ids || 'N/A'})` :
                                                 selectedAnnouncement.recipient_type === 'specific_instructors' ? `Specific Instructors (${selectedAnnouncement.recipient_ids || 'N/A'})` :
                                                 selectedAnnouncement.recipient_type === 'department_instructors' ? `Department Instructors (${selectedAnnouncement.department?.department_name || 'N/A'})` : 'N/A'}
                            </p>
                            {selectedAnnouncement.recipient_ids && (
                                <p><strong>Recipient IDs:</strong> {selectedAnnouncement.recipient_ids}</p>
                            )}
                            {selectedAnnouncement.department?.department_name && (
                                <p><strong>Department:</strong> {selectedAnnouncement.department.department_name}</p>
                            )}
                            <p><strong>Priority:</strong> {selectedAnnouncement.priority}</p>
                            <p><strong>Valid Until:</strong> {selectedAnnouncement.valid_until ? new Date(selectedAnnouncement.valid_until).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Created At:</strong> {new Date(selectedAnnouncement.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete this announcement?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
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

export default ManageAnnouncements; 