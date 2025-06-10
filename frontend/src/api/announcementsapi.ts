import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/announcements';

// Create a new announcement
export const createAnnouncement = (payload: any) => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('message', payload.message);
    formData.append('recipient_type', payload.recipient_type);
    if (payload.recipient_ids) formData.append('recipient_ids', payload.recipient_ids);
    if (payload.priority) formData.append('priority', payload.priority);
    if (payload.valid_until) formData.append('valid_until', payload.valid_until);
    if (payload.department_id) formData.append('department_name', payload.department_name);
    
    return axios.post(BASE_URL, formData);
};

// Get all announcements
export const getAllAnnouncements = () => axios.get(`${BASE_URL}`);

// Get announcement by ID
export const getAnnouncementById = (announcement_id: number) => 
    axios.get(`${BASE_URL}/${announcement_id}`);

// Update an announcement
export const updateAnnouncement = (
    announcement_id: number,
    payload: any
) => {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.message !== undefined) formData.append('message', payload.message);
    if (payload.recipient_type !== undefined) formData.append('recipient_type', payload.recipient_type);
    // Handle recipient_ids explicitly for null/empty string updates
    if (payload.recipient_ids === null) {
        formData.append('recipient_ids', ''); // Send empty string for explicit null
    } else if (payload.recipient_ids !== undefined) {
        formData.append('recipient_ids', payload.recipient_ids);
    }
    if (payload.priority !== undefined) formData.append('priority', payload.priority);
    if (payload.valid_until === null) {
        formData.append('valid_until', ''); // Send empty string for explicit null
    } else if (payload.valid_until !== undefined) {
        formData.append('valid_until', payload.valid_until);
    }
    // Handle department_id explicitly for null updates
    if (payload.department_name === null) {
        formData.append('department_name', ''); // Send empty string for explicit null
    } else if (payload.department_name !== undefined) {
        formData.append('department_name', payload.department_name);
    }
    
    return axios.put(`${BASE_URL}/${announcement_id}`, formData);
};

// Delete an announcement
export const deleteAnnouncement = (announcement_id: number) => 
    axios.delete(`${BASE_URL}/${announcement_id}`);

// Search announcements by keyword
export const searchAnnouncements = (keyword: string) => 
    axios.get(`${BASE_URL}/search/?keyword=${keyword}`); 