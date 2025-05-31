import axios from 'axios';


const BASE_URL = 'http://localhost:8000/api/departments';

export const getdepartments = () => axios.get(`${BASE_URL}/departments/`);
export const adddepartment = (data: any) => axios.post(`${BASE_URL}/departments/`, data);
export const getdepartmentByName = (name: string) => axios.get(`${BASE_URL}/departments/${name}`);
export const deletedepartment = (name: string) => axios.delete(`${BASE_URL}/departments/${name}`);

