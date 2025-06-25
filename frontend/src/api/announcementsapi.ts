import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/announcements';

// Helper to get authorization headers
export const getAuthHeaders = () => {
    const instructorToken = sessionStorage.getItem('instructorToken');
    const adminToken = sessionStorage.getItem('adminToken');
    if (instructorToken) {
        console.log('Using instructor token in getAuthHeaders:', instructorToken);
        return { Authorization: `Bearer ${instructorToken}` };
    }
    if (adminToken) {
        console.log('Using admin token in getAuthHeaders:', adminToken);
        return { Authorization: `Bearer ${adminToken}` };
    }
    console.warn('No token found in getAuthHeaders.');
    return {};
};

// Create a new announcement
export const createAnnouncement = (payload: any) => {
    // Send payload as JSON directly, as backend expects Pydantic model
    return axios.post(BASE_URL, payload, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } });
};

// Get all announcements
export const getAllAnnouncements = () => axios.get(`${BASE_URL}`, { headers: getAuthHeaders() });

// Get announcement by ID
export const getAnnouncementById = (announcement_id: number) => 
    axios.get(`${BASE_URL}/${announcement_id}`, { headers: getAuthHeaders() });

// Update an announcement
export const updateAnnouncement = (
    announcement_id: number,
    payload: any
) => {
    // Send payload as JSON directly for updates
    return axios.put(`${BASE_URL}/${announcement_id}`, payload, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } });
};

// Delete an announcement
export const deleteAnnouncement = (announcement_id: number) => 
    axios.delete(`${BASE_URL}/${announcement_id}`, { headers: getAuthHeaders() });

// Search announcements by keyword
export const searchAnnouncements = (keyword: string) => 
    axios.get(`${BASE_URL}/search/?keyword=${keyword}`, { headers: getAuthHeaders() }); 