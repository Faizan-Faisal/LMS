import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/admin/reports';

export const fetchExamReportStats = async (filters: {
  department?: string;
  semester?: string;
  course?: string;
  examType?: string;
}) => {
  const params: any = {};
  if (filters.department) params.department = filters.department;
  if (filters.semester) params.semester = filters.semester;
  if (filters.course) params.course = filters.course;
  if (filters.examType) params.exam_type = filters.examType;
  const response = await axios.get(`${API_BASE_URL}/exam`, { params });
  return response.data;
};

export const downloadExamReportExcel = async (filters: {
  department?: string;
  semester?: string;
  course?: string;
  examType?: string;
}) => {
  const params: any = { export: true };
  if (filters.department) params.department = filters.department;
  if (filters.semester) params.semester = filters.semester;
  if (filters.course) params.course = filters.course;
  if (filters.examType) params.exam_type = filters.examType;
  const response = await axios.get(`${API_BASE_URL}/exam`, { params, responseType: 'blob' });
  return response.data;
};

export const fetchAttendanceReportStats = async (filters: {
  department?: string;
  semester?: string;
  course?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const params: any = {};
  if (filters.department) params.department = filters.department;
  if (filters.semester) params.semester = filters.semester;
  if (filters.course) params.course = filters.course;
  if (filters.fromDate) params.from_date = filters.fromDate;
  if (filters.toDate) params.to_date = filters.toDate;
  const response = await axios.get(`${API_BASE_URL}/attendance`, { params });
  return response.data;
};

export const downloadAttendanceReportExcel = async (filters: {
  department?: string;
  semester?: string;
  course?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const params: any = { export: true };
  if (filters.department) params.department = filters.department;
  if (filters.semester) params.semester = filters.semester;
  if (filters.course) params.course = filters.course;
  if (filters.fromDate) params.from_date = filters.fromDate;
  if (filters.toDate) params.to_date = filters.toDate;
  const response = await axios.get(`${API_BASE_URL}/attendance`, { params, responseType: 'blob' });
  return response.data;
}; 