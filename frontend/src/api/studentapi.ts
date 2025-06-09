import axios from 'axios';


const BASE_URL = 'http://localhost:8000/api/students';

export const getStudents = () => axios.get(`${BASE_URL}/`);
export const addStudent = (data: any) => axios.post(`${BASE_URL}/`, data);
export const getStudentById = (id: string) => axios.get(`${BASE_URL}/${id}`);
export const updateStudent = (id: string, data: any) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteStudent = (id: string) => axios.delete(`${BASE_URL}/${id}`);