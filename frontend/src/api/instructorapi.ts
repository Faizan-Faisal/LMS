import axios from 'axios';

////const BASE_URL = 'http://localhost:8000'; // Change if using different port or production
// const BASE_URL = 'http://localhost:8000/api';
// export const getInstructors = () => axios.get(`${BASE_URL}/instructors`);
// export const addInstructor = (data: any) => axios.post(`${BASE_URL}/instructors`, data);
// export const getInstructorById = (id: number) => axios.get(`${BASE_URL}/instructors/${id}`);
// export const updateInstructor = (id: number, data: any) => axios.put(`${BASE_URL}/instructors/${id}`, data);
// export const deleteInstructor = (id: number) => axios.delete(`${BASE_URL}/instructors/${id}`);
const BASE_URL = 'http://localhost:8000/api/instructors';

export const getInstructors = () => axios.get(`${BASE_URL}/instructors/`);
export const addInstructor = (data: any) => axios.post(`${BASE_URL}/instructors/`, data);
export const getInstructorById = (id: number) => axios.get(`${BASE_URL}/instructors/${id}`);
export const updateInstructor = (id: number, data: any) => axios.put(`${BASE_URL}/instructors/${id}`, data);
export const deleteInstructor = (id: number) => axios.delete(`${BASE_URL}/instructors/${id}`);