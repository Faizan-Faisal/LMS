import axios from 'axios';

const BASE_URL = 'http://localhost:8000'; // Ensure this matches your backend

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('instructorToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Define interfaces for your exam record data here
// You'll need to match this with your backend models later
export interface ExamRecord {
    id: number;
    offering_id: number;
    student_id: string;
    exam_type: 'MIDTERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT';
    marks_obtained: number;
    total_marks: number;
    exam_date: string; // Or Date if you parse it
    remarks?: string;
    // Add any other fields relevant to exam records
}

// New Pydantic-like interfaces for requests
export interface ExamRecordCreate {
    offering_id: number;
    student_id: string;
    exam_type: 'MIDTERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT';
    marks_obtained: number;
    total_marks: number;
    exam_date: string; // ISO format string expected by FastAPI
    remarks?: string;
}

export interface ExamRecordUpdate {
    marks_obtained?: number;
    total_marks?: number;
    exam_date?: string; // ISO format string expected by FastAPI
    remarks?: string;
}

// Example API call: Fetch exam records for a given course offering
export const getExamRecordsByOffering = async (offeringId: number): Promise<ExamRecord[]> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }

    try {
        const response = await axios.get(`${BASE_URL}/api/instructor/exam-records/offering/${offeringId}`, { headers });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error fetching exam records for offering ${offeringId}:`, error.response?.data || error.message);
            return Promise.reject(new Error(`Failed to load exam records: ${error.response?.data?.detail || error.message}`));
        }
        return Promise.reject(error);
    }
};

export const createExamRecord = async (examRecord: ExamRecordCreate): Promise<ExamRecord> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }

    try {
        const response = await axios.post(`${BASE_URL}/api/instructor/exam-records`, examRecord, { headers });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error creating exam record:", error.response?.data || error.message);
            return Promise.reject(new Error(`Failed to create exam record: ${error.response?.data?.detail || error.message}`));
        }
        return Promise.reject(error);
    }
};

export const updateExamRecord = async (recordId: number, examRecord: ExamRecordUpdate): Promise<ExamRecord> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }

    try {
        const response = await axios.put(`${BASE_URL}/api/instructor/exam-records/${recordId}`, examRecord, { headers });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error updating exam record ${recordId}:`, error.response?.data || error.message);
            return Promise.reject(new Error(`Failed to update exam record: ${error.response?.data?.detail || error.message}`));
        }
        return Promise.reject(error);
    }
};

export const deleteExamRecord = async (recordId: number): Promise<void> => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
        return Promise.reject(new Error("No authentication token found. Please log in."));
    }

    try {
        await axios.delete(`${BASE_URL}/api/instructor/exam-records/${recordId}`, { headers });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error deleting exam record ${recordId}:`, error.response?.data || error.message);
            return Promise.reject(new Error(`Failed to delete exam record: ${error.response?.data?.detail || error.message}`));
        }
        return Promise.reject(error);
    }
};

// You can add more API functions here for adding/updating exam records, etc. 