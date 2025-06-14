import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/course_offerings';

interface CourseRead {
    course_id: string;
    course_name: string;
    course_description?: string;
    course_credit_hours: number;
}

interface SectionRead {
    section_name: string;
    department?: string;
    semester?: string;
}

interface InstructorRead {
    instructor_id: string;
    first_name: string;
    last_name: string;
}

export interface CourseOfferingResponse {
    offering_id: number;
    course_id: string;
    section_name: string;
    instructor_id: string;
    capacity: number;
    course_rel: CourseRead;
    section_rel: SectionRead;
    instructor_rel: InstructorRead;
}

// Create a new course offering
export const createCourseOffering = (
    course_id: string,
    section_name: string,
    instructor_id: string,
    capacity: number
) => {
    const formData = new FormData();
    formData.append('course_id', course_id);
    formData.append('section_name', section_name);
    formData.append('instructor_id', instructor_id);
    formData.append('capacity', capacity.toString());

    return axios.post(BASE_URL, formData);
};

// Get all course offerings
export const getCourseOfferings = async (): Promise<CourseOfferingResponse[]> => {
    const response = await axios.get(BASE_URL);
    return response.data;
};

// Get a course offering by ID
export const getCourseOfferingById = (offering_id: number) => 
    axios.get(`${BASE_URL}/${offering_id}`);

// Get course offerings by course ID
export const getCourseOfferingsByCourse = (course_id: string) => 
    axios.get(`${BASE_URL}/course/${course_id}`);

// Get course offerings by instructor ID
export const getCourseOfferingsByInstructor = (instructor_id: string) => 
    axios.get(`${BASE_URL}/instructor/${instructor_id}`);

// Update a course offering
export const updateCourseOffering = (
    offering_id: number,
    course_id: string,
    section_name: string,
    instructor_id: string,
    capacity: number
) => {
    const formData = new FormData();
    formData.append('course_id', course_id);
    formData.append('section_name', section_name);
    formData.append('instructor_id', instructor_id);
    formData.append('capacity', capacity.toString());

    return axios.put(`${BASE_URL}/${offering_id}`, formData);
};

// Get detailed course offerings by section name
export const getCourseOfferingsBySectionDetails = (section_name: string) => 
    axios.get(`${BASE_URL}/section/${section_name}/details`);

// Delete a course offering
export const deleteCourseOffering = (offering_id: number) => 
    axios.delete(`${BASE_URL}/${offering_id}`); 