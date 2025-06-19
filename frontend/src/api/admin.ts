import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface Admin {
  admin_id: number;
  username: string;
  email: string;
  full_name: string;
  roles: Role[];
}

export interface Role {
  role_id: number;
  role_name: string;
  description: string;
}

export interface CreateAdminData {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export const adminApi = {
  // Admin Authentication
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axios.post(`${API_URL}/admin/login`, formData);
    return response.data;
  },

  // Admin Management
  createAdmin: async (data: CreateAdminData) => {
    const response = await axios.post(`${API_URL}/admin/create`, data);
    return response.data;
  },

  getAdmins: async () => {
    const response = await axios.get(`${API_URL}/admin/list`);
    return response.data;
  },

  // Role Management
  getRoles: async () => {
    const response = await axios.get(`${API_URL}/admin/roles`);
    return response.data;
  },

  createRole: async (roleName: string, description: string) => {
    const response = await axios.post(`${API_URL}/admin/roles/create`, {
      role_name: roleName,
      description,
    });
    return response.data;
  },

  assignRole: async (adminId: number, roleId: number) => {
    const response = await axios.post(`${API_URL}/admin/assign-role`, {
      admin_id: adminId,
      role_id: roleId,
    });
    return response.data;
  },

  // Permission Management
  getPermissions: async () => {
    const response = await axios.get(`${API_URL}/admin/permissions`);
    return response.data;
  },

  createPermission: async (permissionName: string, description: string) => {
    const response = await axios.post(`${API_URL}/admin/permissions/create`, {
      permission_name: permissionName,
      description,
    });
    return response.data;
  },

  assignPermission: async (roleId: number, permissionId: number) => {
    const response = await axios.post(`${API_URL}/admin/assign-permission`, {
      role_id: roleId,
      permission_id: permissionId,
    });
    return response.data;
  },
}; 