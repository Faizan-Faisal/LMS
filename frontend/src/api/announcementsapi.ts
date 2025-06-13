import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/announcements';

// Helper to get authorization headers
const getAuthHeaders = () => {
    const instructorToken = localStorage.getItem('instructorToken');

    if (instructorToken) {
        console.log('Instructor Token in getAuthHeaders (used):', instructorToken);
        return { Authorization: `Bearer ${instructorToken}` };
    }
    console.log('No token found in getAuthHeaders.');
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