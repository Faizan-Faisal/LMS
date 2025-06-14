import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api'; // Changed BASE_URL to handle instructor prefix in the specific call

// Helper to get authorization headers (from instructorAuthApi.ts)
const getAuthHeaders = () => {
    const token = sessionStorage.getItem('instructorToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

interface CourseRead {
    course_id: string;
    course_name: string;
}

interface SectionRead {
    section_name: string;
    program_id: string;
    shift: string;
}

export interface CourseOfferingResponse {
    offering_id: number;
    course_id: string;
    section_name: string;
    instructor_id: string;
    capacity: number;
    course_rel: CourseRead;
    section_rel: SectionRead;
}

// Get course offerings for the authenticated instructor
export const getInstructorCourses = async (): Promise<CourseOfferingResponse[]> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        console.error("Authentication error: No instructor token found.");
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }

    try {
        const response = await axios.get(`${BASE_URL}/instructor/courses`, { headers });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                if (error.response.status === 401) {
                    console.error("Authentication error: Invalid or expired token.", error.response.data);
                    return Promise.reject(new Error("Authentication failed. Please log in again."));
                } else if (error.response.status === 500) {
                    console.error("Server error: Failed to fetch instructor courses.", error.response.data);
                    return Promise.reject(new Error("Failed to load courses due to a server error. Please try again later."));
                } else if (error.response.status === 400) {
                    console.error("Bad Request error: ", error.response.data);
                    return Promise.reject(new Error("Bad request to server. Please check your input."));
                } else {
                    // Fallback for other response statuses
                    console.error(`Unhandled API error (${error.response.status}):`, error.response.data);
                    return Promise.reject(new Error(`API error: ${error.response.status}`));
                }
            } else if (error.request) {
                console.error("Network error: No response received from server.", error.message);
                return Promise.reject(new Error("Network error. Please check your internet connection or server status."));
            } else {
                console.error("Error setting up request:", error.message);
                return Promise.reject(new Error("An unexpected error occurred."));
            }
        } else {
            console.error("Error fetching instructor courses:", error);
            return Promise.reject(error);
        }
    }
}; 