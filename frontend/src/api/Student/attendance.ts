import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/student';

export interface AttendanceRecord {
  attendance_id: number;
  offering_id: number;
  student_id: string;
  attendance_date: string;
  status: string;
}

export const getAttendanceRecords = async (studentId: string, offeringId?: number): Promise<AttendanceRecord[]> => {
  try {
    const url = offeringId 
      ? `${API_BASE_URL}/students/${studentId}/attendance?offering_id=${offeringId}`
      : `${API_BASE_URL}/students/${studentId}/attendance`;
    const response = await axios.get<AttendanceRecord[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    throw error;
  }
}; 