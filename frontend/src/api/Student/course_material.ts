import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/student';

export interface CourseMaterial {
  material_id: number;
  offering_id: number;
  title: string;
  description?: string;
  file_path?: string;
  uploaded_at: string;
}

export const getCourseMaterials = async (studentId: string, offeringId?: number): Promise<CourseMaterial[]> => {
  try {
    const url = offeringId 
      ? `${API_BASE_URL}/students/${studentId}/course_materials?offering_id=${offeringId}`
      : `${API_BASE_URL}/students/${studentId}/course_materials`;
    const response = await axios.get<CourseMaterial[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching course materials:", error);
    throw error;
  }
};

export const downloadCourseMaterial = async (materialId: number): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/course_materials/${materialId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading course material:", error);
    throw error;
  }
}; 