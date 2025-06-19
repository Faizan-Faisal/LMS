import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/sections'; // Base URL without the final 

export const getSections = () => axios.get(`${BASE_URL}/`);
export const addSection = (data: any) => axios.post(`${BASE_URL}/`, new URLSearchParams(data));
export const getSectionByName = (name: string) => axios.get(`${BASE_URL}/${name}`);
export const updateSection = (name: string, data: FormData) => axios.put(`${BASE_URL}/${name}`, data, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});
export const deleteSection = (name: string) => axios.delete(`${BASE_URL}/${name}`);
export const getSectionsByDepartmentSemester = (department: string, semester: string) =>
  axios.get(`${BASE_URL}/by-department-semester/`, {
    params: { department, semester },
  });