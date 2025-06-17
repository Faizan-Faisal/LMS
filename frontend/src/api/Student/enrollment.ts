import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // This is a shared API for student enrollments

export interface EnrolledCourse {
  enrollment_id: number;
  student_id: string;
  offering_id: number;
  enrollment_date: string;
  status: string;
  offering_rel?: {
    offering_id: number;
    course_id: number;
    instructor_id: string;
    academic_year: number;
    semester: string;
    course_rel?: {
      course_id: number;
      course_code: string;
      course_name: string;
      credits: number;
    };
    instructor_rel?: {
      instructor_id: string;
      first_name: string;
      last_name: string;
    };
  };
}

export const getStudentEnrollments = async (studentId: string): Promise<EnrolledCourse[]> => {
  try {
    const response = await axios.get<EnrolledCourse[]>(`${API_BASE_URL}/student/enrollments/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student enrollments:", error);
    throw error;
  }
}; 