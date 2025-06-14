import axios from 'axios';

const BASE_URL = 'http://localhost:8000'; // Ensure this matches your backend

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('instructorToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Student {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    cnic: string;
    program?: string;
    section?: string;
    enrollment_year: number;
    picture?: string;
}

// Define interfaces for your attendance data here
// You'll need to match this with your backend models later
export interface AttendanceRecord {
    attendance_id: number;
    offering_id: number;
    student_id: string;
    attendance_date: string; // Or Date if you parse it
    status: 'Present' | 'Absent' | 'Leave';
    // Add any other fields relevant to attendance records
}

// New Pydantic-like interfaces for requests
export interface AttendanceCreate {
    offering_id: number;
    student_id: string;
    attendance_date: string; // ISO format string expected by FastAPI
    status: 'Present' | 'Absent' | 'Leave';
}

export interface AttendanceUpdate {
    status: 'Present' | 'Absent' | 'Leave';
}

// API call: Fetch students for a given course offering
export const getStudentsByOffering = async (offeringId: number): Promise<Student[]> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }

    try {
        const response = await axios.get(`${BASE_URL}/api/instructor/attendance/offering/${offeringId}/students`, { headers });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error fetching students for offering ${offeringId}:`, error.response?.data || error.message);
            return Promise.reject(new Error(`Failed to load students: ${error.response?.data?.detail || error.message}`));
        }
        return Promise.reject(error);
    }
};

// Example API call: Fetch attendance records for a given course offering
export const getAttendanceRecordsByOffering = async (offeringId: number): Promise<AttendanceRecord[]> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }

    try {
        const response = await axios.get(`${BASE_URL}/api/instructor/attendance/offering/${offeringId}`, { headers });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error fetching attendance records for offering ${offeringId}:`, error.response?.data || error.message);
            return Promise.reject(new Error(`Failed to load attendance records: ${error.response?.data?.detail || error.message}`));
        }
        return Promise.reject(error);
    }
};

export const createAttendanceRecord = async (attendance: AttendanceCreate): Promise<AttendanceRecord> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }

    try {
        const response = await axios.post(`${BASE_URL}/api/instructor/attendance`, attendance, { headers });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error creating attendance record:", error.response?.data || error.message);
            return Promise.reject(new Error(`Failed to create attendance record: ${error.response?.data?.detail || error.message}`));
        }
        return Promise.reject(error);
    }
};

export const updateAttendanceRecord = async (attendanceId: number, attendance: AttendanceUpdate): Promise<AttendanceRecord> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }

    try {
        const response = await axios.put(`${BASE_URL}/api/instructor/attendance/${attendanceId}`, attendance, { headers });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error updating attendance record ${attendanceId}:`, error.response?.data || error.message);
            return Promise.reject(new Error(`Failed to update attendance record: ${error.response?.data?.detail || error.message}`));
        }
        return Promise.reject(error);
    }
};

export const deleteAttendanceRecord = async (attendanceId: number): Promise<void> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }

    try {
        await axios.delete(`${BASE_URL}/api/instructor/attendance/${attendanceId}`, { headers });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error deleting attendance record ${attendanceId}:`, error.response?.data || error.message);
            return Promise.reject(new Error(`Failed to delete attendance record: ${error.response?.data?.detail || error.message}`));
        }
        return Promise.reject(error);
    }
};

// You can add more API functions here for marking attendance, etc. 