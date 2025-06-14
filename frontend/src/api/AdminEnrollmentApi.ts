import axios from 'axios';
import { StudentCourseEnrollmentResponse } from './StudentEnrollmentApi'; // Assuming this interface is defined here

const BASE_URL = 'http://localhost:8000/api/admin/student-enrollments';

export const bulkEnrollStudents = async (offeringId: number, studentIds: string[]): Promise<StudentCourseEnrollmentResponse[]> => {
    try {
        const response = await axios.post(`${BASE_URL}/bulk-enroll/${offeringId}`, studentIds);
        return response.data;
    } catch (error) {
        console.error('Error during bulk student enrollment:', error);
        throw error;
    }
}; 