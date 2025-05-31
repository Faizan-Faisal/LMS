import axios from 'axios';


const BASE_URL = 'http://localhost:8000/api/sections';

export const getSections = () => axios.get(`${BASE_URL}/sections/`);
export const addSections = (data: any) => axios.post(`${BASE_URL}/sections/`, data);
export const getSectionsByName = (name: string) => axios.get(`${BASE_URL}/sections/${name}`);
export const updateSections = (name: string, data: any) => axios.put(`${BASE_URL}/sections/${name}`, data);
export const deleteSections = (name: string) => axios.delete(`${BASE_URL}/sections/${name}`);