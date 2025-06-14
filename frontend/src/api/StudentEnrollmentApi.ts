import axios from 'axios';

const BASE_URL = 'http://localhost:8000'; // Ensure this matches your backend

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('studentToken'); // Assuming student token is stored here
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Interfaces based on your backend Pydantic models for StudentCourseEnrollment
export interface StudentCourseEnrollmentResponse {
    enrollment_id: number;
    student_id: string;
    offering_id: number;
    enrollment_date: string; // ISO format string
    grade: string | null;
}

export interface StudentCourseEnrollmentCreate {
    student_id: string;
    offering_id: number;
    enrollment_date?: string; // Optional, backend defaults to today
    grade?: string | null;
}

// API calls
export const createStudentEnrollment = async (enrollment: StudentCourseEnrollmentCreate): Promise<StudentCourseEnrollmentResponse> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }
    try {
        const response = await axios.post(`${BASE_URL}/api/student-enrollments`, enrollment, { headers });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error creating enrollment:", error.response?.data || error.message);
            return Promise.reject(new Error(`Failed to enroll: ${error.response?.data?.detail || error.message}`));
        }
        return Promise.reject(error);
    }
};

export const getStudentEnrollments = async (studentId: string): Promise<StudentCourseEnrollmentResponse[]> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }
    try {
        const response = await axios.get(`${BASE_URL}/api/student-enrollments/student/${studentId}`, { headers });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error fetching enrollments for student ${studentId}:`, error.response?.data || error.message);
            return Promise.reject(new Error(`Failed to load enrollments: ${error.response?.data?.detail || error.message}`));
        }
        return Promise.reject(error);
    }
};

export const deleteStudentEnrollment = async (enrollmentId: number): Promise<void> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }
    try {
        await axios.delete(`${BASE_URL}/api/student-enrollments/${enrollmentId}`, { headers });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error deleting enrollment ${enrollmentId}:`, error.response?.data || error.message);
            return Promise.reject(new Error(`Failed to drop course: ${error.response?.data?.detail || error.message}`));
        }
        return Promise.reject(error);
    }
};

// You might also need an API to get all available course offerings for students to enroll in
// This would likely come from the /api/course_offerings endpoint, possibly filtered. 