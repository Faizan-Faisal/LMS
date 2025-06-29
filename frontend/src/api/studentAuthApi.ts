import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Your backend API base URL

export const loginStudent = async (student_id: string, cnic: string) => {
    const formData = new URLSearchParams();
    formData.append('username', student_id);
    formData.append('password', cnic);

    try {
        const response = await axios.post(`${API_BASE_URL}/student/token`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Login failed');
        } else {
            throw new Error('An unexpected error occurred');
        }
    }
}; 