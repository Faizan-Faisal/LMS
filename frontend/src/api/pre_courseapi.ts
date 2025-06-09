import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/course_prerequisites';

export const createPrerequisite = (courseId: string, prereqCourseId: string) => {
    const formData = new FormData();
    formData.append('course_id', courseId);
    formData.append('prereq_course_id', prereqCourseId);
    return axios.post(`${BASE_URL}/`, formData);
};

export const getAllPrerequisites = () => axios.get(`${BASE_URL}/`);

export const getPrerequisitesForCourse = (courseId: string) => 
    axios.get(`${BASE_URL}/${courseId}/prerequisites`);

export const getCoursesRequiringPrerequisite = (prereqCourseId: string) => 
    axios.get(`${BASE_URL}/${prereqCourseId}/required_by`);

export const deletePrerequisite = (courseId: string, prereqCourseId: string) => 
    axios.delete(`${BASE_URL}/${courseId}/${prereqCourseId}`); 