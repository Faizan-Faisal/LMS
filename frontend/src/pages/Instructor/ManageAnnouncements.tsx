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
import { getdepartments } from '../../api/departmentapi';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import type { IconBaseProps } from 'react-icons';
import Icon from '../../components/Icon';

interface Department {
    department_name: string;
}

interface AnnouncementBase {
    title: string;
    message: string;
    recipient_type: string;
    recipient_ids?: string | null;
    department_name?: string | null;
    priority: 'Normal' | 'High';
    valid_until?: string | null;
}

interface AnnouncementCreatePayload {
    title: string;
    message: string;
    recipient_type: string;
    recipient_ids?: string | null;
    department_name?: string | null;
    priority?: 'Normal' | 'High';
    valid_until?: string | null;
    sender_type?: string; // Optional for backend, will be set here
    sender_id?: string;   // Optional for backend, will be set here
}

interface AnnouncementRead extends AnnouncementBase {
    announcement_id: number;
    created_at: string;
    department?: Department;
    sender_type: string;
    sender_id?: string | null;
}

interface AnnouncementFormState {
    title: string;
    message: string;
    recipient_type: string;
    recipient_ids: string;
    department_name: string | '';
    priority: 'Normal' | 'High';
    valid_until: Date | null;
}

const ManageAnnouncements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<AnnouncementRead[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [form, setForm] = useState<AnnouncementFormState>({
        title: '',
        message: '',
        recipient_type: 'all_students',
        recipient_ids: '',
        department_name: '',
        priority: 'Normal',
        valid_until: null,
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentAnnouncementId, setCurrentAnnouncementId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementRead | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState<number | null>(null);
    const [instructorId, setInstructorId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('instructorToken');
        if (token) {
            try {
                const decodedToken: { sub: string } = jwtDecode(token);
                setInstructorId(decodedToken.sub);
            } catch (error) {
                console.error("Error decoding instructor token:", error);
                toast.error("Failed to get instructor ID from token.");
                setLoading(false); // Stop loading if token decode fails
            }
        } else {
            setLoading(false); // Stop loading if no token found
        }
    }, []); // Empty dependency array to run only once on mount

    useEffect(() => {
        if (instructorId) {
            fetchAnnouncements();
            fetchDepartments();
        }
    }, [instructorId]); // Depend on instructorId to re-fetch when it's set

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await getAllAnnouncements();
            if (instructorId) {
                setAnnouncements(response.data.filter((ann: AnnouncementRead) => ann.sender_type === 'Instructor' && ann.sender_id === instructorId));
            } else {
                // If instructorId is not yet available, show no announcements or handle as needed
                setAnnouncements([]); 
            }
            setLoading(false);
        } catch (error) {
            toast.error("Failed to fetch announcements.");
            console.error("Error fetching announcements:", error);
            setError("Failed to load announcements.");
            setLoading(false);
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
                recipient_ids: '',
                department_name: '',
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

        if (!instructorId) {
            toast.error("Instructor ID not found. Cannot send announcement.");
            return;
        }

        // Format the date to YYYY-MM-DD
        const formatDate = (date: Date | null): string | null => {
            if (!date) return null;
            return date.toISOString().split('T')[0];
        };

        // Create base payload matching AnnouncementCreate model
        const payload: {
            title: string;
            message: string;
            recipient_type: string;
            priority: string;
            valid_until: string | null;
            recipient_ids: string | null;
            department_name: string | null;
            sender_type: string;
            sender_id: string;
        } = {
            title: form.title,
            message: form.message,
            recipient_type: form.recipient_type,
            priority: form.priority,
            valid_until: formatDate(form.valid_until),
            recipient_ids: null,
            department_name: null,
            sender_type: 'Instructor',
            sender_id: instructorId
        };

        // Add recipient_ids only if needed
        if (form.recipient_type === 'specific_students' || form.recipient_type === 'specific_instructors') {
            if (form.recipient_ids) {
                payload.recipient_ids = form.recipient_ids;
            }
        }

        // Add department_name only if needed
        if (form.recipient_type === 'department_instructors') {
            if (form.department_name) {
                payload.department_name = form.department_name;
            }
        }

        console.log('Sending payload:', payload); // Add this for debugging

        try {
            if (isEditing && currentAnnouncementId) {
                await updateAnnouncement(currentAnnouncementId, payload);
                toast.success("Announcement updated successfully!");
            } else {
                const response = await createAnnouncement(payload);
                console.log('Response:', response.data); // Add this for debugging
                toast.success("Announcement created successfully!");
            }
            resetForm();
            fetchAnnouncements();
            setShowForm(false);
        } catch (error: any) {
            console.error("Error saving announcement:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers,
                config: error.config,
                payload: payload // Add this for debugging
            });
            toast.error(error.response?.data?.detail || "Failed to save announcement.");
        }
    };

    const handleEdit = (announcement: AnnouncementRead) => {
        setForm({
            title: announcement.title,
            message: announcement.message,
            recipient_type: announcement.recipient_type,
            recipient_ids: announcement.recipient_ids || '',
            department_name: announcement.department?.department_name || '',
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
            department_name: '',
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage My Announcements</h1>

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
                                id="title"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message*</label>
                            <textarea
                                id="message"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                rows={4}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            ></textarea>
                        </div>
                        <div>
                            <label htmlFor="recipient_type" className="block text-sm font-medium text-gray-700">Recipient Type*</label>
                            <select
                                id="recipient_type"
                                name="recipient_type"
                                value={form.recipient_type}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            >
                                <option value="all_students">All Students</option>
                                <option value="specific_students">Specific Students</option>
                            </select>
                        </div>

                        {form.recipient_type === 'specific_students' && (
                            <div>
                                <label htmlFor="recipient_ids" className="block text-sm font-medium text-gray-700">Recipient IDs (comma-separated)*</label>
                                <input
                                    type="text"
                                    id="recipient_ids"
                                    name="recipient_ids"
                                    value={form.recipient_ids}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority*</label>
                            <select
                                id="priority"
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            >
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700">Valid Until</label>
                            <DatePicker
                                id="valid_until"
                                selected={form.valid_until}
                                onChange={handleDateChange}
                                dateFormat="yyyy-MM-dd"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                isClearable
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {isEditing ? 'Update Announcement' : 'Create Announcement'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {loading ? (
                    <p className="text-center py-8 text-gray-600">Loading announcements...</p>
                ) : error ? (
                    <p className="text-center py-8 text-red-500">{error}</p>
                ) : announcements.length === 0 ? (
                    <p className="text-center py-8 text-gray-600">No announcements found for this instructor.</p>
                ) : (
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recipient Type</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valid Until</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sender Type</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sender ID</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {announcements.map((announcement) => (
                                <tr key={announcement.announcement_id}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{announcement.title}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{announcement.recipient_type === 'all_students' ? 'All Students' :
                                        announcement.recipient_type === 'all_instructors' ? 'All Instructors' :
                                        announcement.recipient_type === 'specific_students' ? `Specific Students (${announcement.recipient_ids || 'N/A'})` :
                                        announcement.recipient_type === 'specific_instructors' ? `Specific Instructors (${announcement.recipient_ids || 'N/A'})` :
                                        announcement.recipient_type === 'department_instructors' ? `Department Instructors (${announcement.department?.department_name || 'N/A'})` : 'N/A'}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{announcement.priority}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{announcement.valid_until ? new Date(announcement.valid_until).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{announcement.sender_type}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{announcement.sender_id || 'N/A'}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleView(announcement)}
                                                className="text-blue-600 hover:text-blue-900 focus:outline-none"
                                                title="View"
                                            >
                                                <Icon icon={FaEye} className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(announcement)}
                                                className="text-yellow-600 hover:text-yellow-900 focus:outline-none"
                                                title="Edit"
                                            >
                                                <Icon icon={FaEdit} className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(announcement.announcement_id)}
                                                className="text-red-600 hover:text-red-900 focus:outline-none"
                                                title="Delete"
                                            >
                                                <Icon icon={FaTrash} className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showViewModal && selectedAnnouncement && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg mx-auto">
                        <h3 className="text-xl font-bold mb-4">Announcement Details</h3>
                        <div className="text-gray-700">
                            <p className="mb-2"><strong className="font-semibold">Title:</strong> {selectedAnnouncement.title}</p>
                            <p className="mb-2"><strong className="font-semibold">Message:</strong> {selectedAnnouncement.message}</p>
                            <p className="mb-2"><strong className="font-semibold">Recipient Type:</strong> {selectedAnnouncement.recipient_type}</p>
                            {selectedAnnouncement.recipient_ids && (
                                <p className="mb-2"><strong className="font-semibold">Recipient IDs:</strong> {selectedAnnouncement.recipient_ids}</p>
                            )}
                            {selectedAnnouncement.department_name && (
                                <p className="mb-2"><strong className="font-semibold">Department:</strong> {selectedAnnouncement.department_name}</p>
                            )}
                            <p className="mb-2"><strong className="font-semibold">Priority:</strong> {selectedAnnouncement.priority}</p>
                            <p className="mb-2"><strong className="font-semibold">Valid Until:</strong> {selectedAnnouncement.valid_until || 'N/A'}</p>
                            <p className="mb-2"><strong className="font-semibold">Sender Type:</strong> {selectedAnnouncement.sender_type}</p>
                            {selectedAnnouncement.sender_id && (
                                <p className="mb-2"><strong className="font-semibold">Sender ID:</strong> {selectedAnnouncement.sender_id}</p>
                            )}
                            <p className="mb-4"><strong className="font-semibold">Created At:</strong> {new Date(selectedAnnouncement.created_at).toLocaleString()}</p>
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

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm mx-auto">
                        <h3 className="text-xl font-bold text-red-600 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete this announcement? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={cancelDelete}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
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