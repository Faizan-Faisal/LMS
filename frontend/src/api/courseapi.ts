import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/courses'; // Base URL without the final /courses/

export const getCourses = () => axios.get(`${BASE_URL}/courses/`);
export const addCourse = (data: any) => axios.post(`${BASE_URL}/courses/`, data);
export const getCourseByName = (name: string) => axios.get(`${BASE_URL}/courses/${name}`);
export const updateCourse = (name: string, data: any) => axios.put(`${BASE_URL}/courses/${name}`, data);
export const deleteCourse = (name: string) => axios.delete(`${BASE_URL}/courses/${name}`);