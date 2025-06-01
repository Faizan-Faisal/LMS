import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/sections'; // Base URL without the final /sections/

export const getSections = () => axios.get(`${BASE_URL}/sections/`);
export const addSection = (data: any) => axios.post(`${BASE_URL}/sections/`, new URLSearchParams(data));
export const getSectionByName = (name: string) => axios.get(`${BASE_URL}/sections/${name}`);
export const updateSection = (name: string, data: any) => axios.put(`${BASE_URL}/sections/${name}`, data);
export const deleteSection = (name: string) => axios.delete(`${BASE_URL}/sections/${name}`);