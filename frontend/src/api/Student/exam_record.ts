import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/student';

export interface ExamRecord {
  id: number;
  offering_id: number;
  student_id: string;
  exam_type: string;
  total_marks: number;
  obtained_marks: number;
  exam_date: string;
  remarks?: string;
}

export const getExamRecords = async (studentId: string, offeringId?: number): Promise<ExamRecord[]> => {
  try {
    const url = offeringId 
      ? `${API_BASE_URL}/students/${studentId}/exam_records?offering_id=${offeringId}`
      : `${API_BASE_URL}/students/${studentId}/exam_records`;
    const response = await axios.get<ExamRecord[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching exam records:", error);
    throw error;
  }
}; 