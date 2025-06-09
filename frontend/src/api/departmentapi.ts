import axios from 'axios';


const BASE_URL = 'http://localhost:8000/api/departments';

export const getdepartments = () => axios.get(`${BASE_URL}/`);
export const adddepartment = (data: any) => axios.post(`${BASE_URL}/`, data);
export const getdepartmentByName = (name: string) => axios.get(`${BASE_URL}/${name}`);
export const deletedepartment = (name: string) => axios.delete(`${BASE_URL}/${name}`);

