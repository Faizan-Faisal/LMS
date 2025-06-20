import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/admin';

// export const adminLogin = (username: string, password: string) =>
//   axios.post(`${API_BASE}/login`, new URLSearchParams({ username, password }));

// export const createAdmin = (username: string, password: string, email: string, full_name: string) =>
//   axios.post(`${API_BASE}/create`, new URLSearchParams({ username, password, email, full_name }));

// export const getAllAdmins = () =>
//   axios.get(`${API_BASE}/all`);

// export const assignRoleToAdmin = (admin_id: number, role_id: number) =>
//   axios.post(`${API_BASE}/assign-role`, new URLSearchParams({ admin_id: admin_id.toString(), role_id: role_id.toString() }));

// export const assignPermissionToRole = (role_id: number, permission_id: number) =>
//   axios.post(`${API_BASE}/assign-permission`, new URLSearchParams({ role_id: role_id.toString(), permission_id: permission_id.toString() }));

// export const getAdmin = (admin_id: number) =>
//   axios.get(`/api/admin/${admin_id}`);

// export const updateAdmin = (admin_id: number, data: any) =>
//   axios.put(`/api/admin/${admin_id}`, data);

// export const deleteAdmin = (admin_id: number) =>
//   axios.delete(`/api/admin/${admin_id}`);

// export const getAllRoles = () =>
//   axios.get('/api/admin/roles/all');

// export const getAllPermissions = () =>
//   axios.get('/api/admin/permissions/all');

// export const createRole = (role_name: string, description: string) =>
//   axios.post('/api/admin/roles/create', new URLSearchParams({ role_name, description })); 



export const adminLogin = (username: string, password: string) =>
  axios.post(`${API_BASE}/login`, new URLSearchParams({ username, password }));

export const createAdmin = (username: string, password: string, email: string, full_name: string) =>
  axios.post(`${API_BASE}/create`, new URLSearchParams({ username, password, email, full_name }));

export const getAllAdmins = () =>
  axios.get(`${API_BASE}/all`);

export const assignRoleToAdmin = (admin_id: number, role_id: number) =>
  axios.post(`${API_BASE}/assign-role`, new URLSearchParams({ admin_id: admin_id.toString(), role_id: role_id.toString() }));

export const assignPermissionToRole = (role_id: number, permission_id: number) =>
  axios.post(`${API_BASE}/assign-permission`, new URLSearchParams({ role_id: role_id.toString(), permission_id: permission_id.toString() }));

export const getAdmin = (admin_id: number) =>
  axios.get(`${API_BASE}/${admin_id}`);

export const updateAdmin = (admin_id: number, data: any) =>
  axios.put(`${API_BASE}/${admin_id}`, data);

export const deleteAdmin = (admin_id: number) =>
  axios.delete(`${API_BASE}/${admin_id}`);

export const getAllRoles = () =>
  axios.get(`${API_BASE}/roles/all`);

export const getAllPermissions = () =>
  axios.get(`${API_BASE}/permissions/all`);

export const createRole = (role_name: string, description: string) =>
  axios.post(`${API_BASE}/roles/create`, new URLSearchParams({ role_name, description }));