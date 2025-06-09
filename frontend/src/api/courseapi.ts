import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/courses'; // Corrected Base URL as per FastAPI docs

export const getCourses = () => axios.get(`${BASE_URL}/`); 
export const addCourse = (data: any) => axios.post(`${BASE_URL}/`, data); 
export const getCourseByName = (name: string) => axios.get(`${BASE_URL}/name/${name}`); 
export const getCourseById = (id: string) => axios.get(`${BASE_URL}/id/${id}`); 
// export const updateCourse = (name: string, data: any) => axios.put(`${BASE_URL}/{name}`, data);
export const updateCourse = async (course_name: string, data: FormData) => {
    const response = await axios.put(`${BASE_URL}/${course_name}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
export const deleteCourse = (course_id: string) => axios.delete(`${BASE_URL}/${course_id}`); 