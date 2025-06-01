import axios from 'axios';


const BASE_URL = 'http://localhost:8000/api/students';

export const getStudents = () => axios.get(`${BASE_URL}/students/`);
export const addStudent = (data: any) => axios.post(`${BASE_URL}/students/`, data);
export const getStudentById = (id: string) => axios.get(`${BASE_URL}/students/${id}`);
export const updateStudent = (id: string, data: any) => axios.put(`${BASE_URL}/students/${id}`, data);
export const deleteStudent = (id: string) => axios.delete(`${BASE_URL}/students/${id}`);