import axios from 'axios';
import { BASE_URL } from './apiConfig'; // Assuming you have an apiConfig file

export interface CourseMaterial {
    material_id: number;
    offering_id: number;
    title: string;
    description?: string;
    file_path: string; // URL or path to the material
    uploaded_at: string; // ISO datetime string
    is_guidebook?: boolean;
}

export interface CourseMaterialCreate {
    offering_id: number;
    title: string;
    description?: string;
    // For file upload, this will typically be a FormData object
    // The actual file data will be appended by the component
    file?: File; 
}

export interface CourseMaterialUpdate {
    title?: string;
    description?: string;
    file?: File;
}

// Function to fetch course materials for a specific offering
export const getCourseMaterialsByOffering = async (offeringId: number): Promise<CourseMaterial[]> => {
    try {
        const token = sessionStorage.getItem('instructorToken');
        const response = await axios.get(`${BASE_URL}/instructor/materials/?offering_id=${offeringId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching course materials for offering ${offeringId}:`, error);
        throw error;
    }
};

// Function to upload new course material
export const uploadCourseMaterial = async (data: FormData): Promise<CourseMaterial> => {
    try {
        const token = sessionStorage.getItem('instructorToken');
        const response = await axios.post(`${BASE_URL}/instructor/materials/`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading course material:", error);
        throw error;
    }
};

// Function to update existing course material
export const updateCourseMaterial = async (materialId: number, data: FormData): Promise<CourseMaterial> => {
    try {
        const token = sessionStorage.getItem('instructorToken');
        const response = await axios.put(`${BASE_URL}/instructor/materials/${materialId}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating course material ${materialId}:`, error);
        throw error;
    }
};

// Function to delete course material
export const deleteCourseMaterial = async (materialId: number): Promise<void> => {
    try {
        const token = sessionStorage.getItem('instructorToken');
        await axios.delete(`${BASE_URL}/instructor/materials/${materialId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error(`Error deleting course material ${materialId}:`, error);
        throw error;
    }
}; 