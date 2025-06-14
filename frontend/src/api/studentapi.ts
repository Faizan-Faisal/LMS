import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/students';

export interface StudentResponse {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    cnic: string;
    program: string;
    section: string;
    enrollment_year: number;
    picture: string | null;
    // Add any other fields that might be needed
}

export const getStudents = () => axios.get<StudentResponse[]>(`${BASE_URL}/`);
export const addStudent = (data: any) => axios.post(`${BASE_URL}/`, data);
export const getStudentById = (id: string) => axios.get<StudentResponse>(`${BASE_URL}/${id}`);
export const updateStudent = (id: string, data: any) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteStudent = (id: string) => axios.delete(`${BASE_URL}/${id}`);