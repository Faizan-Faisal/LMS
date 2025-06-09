import axios from 'axios';


const BASE_URL = 'http://localhost:8000/api/instructors';

export const getInstructors = () => axios.get(`${BASE_URL}/`);
export const addInstructor = (data: any) => axios.post(`${BASE_URL}/`, data);
export const getInstructorById = (id: string) => axios.get(`${BASE_URL}/${id}`);
export const updateInstructor = (id: string, data: any) => axios.put(`${BASE_URL}/${id}`, data);
export const deleteInstructor = (id: string) => axios.delete(`${BASE_URL}/${id}`);