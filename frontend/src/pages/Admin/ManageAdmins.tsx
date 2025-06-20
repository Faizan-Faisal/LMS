import React, { useEffect, useState } from 'react';
import {
  getAllAdmins,
  createAdmin,
  assignRoleToAdmin,
  deleteAdmin,
  updateAdmin,
  getAllRoles,
  getAdmin,
  createRole
} from '../../api/AdminApi';
import { toast } from 'react-toastify';

interface Admin {
  admin_id: number;
  username: string;
  email: string;
  full_name: string;
  created_at: string;
  roles?: string[];
}

interface Role {
  role_id: number;
  role_name: string;
  description: string;
}

const ManageAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [form, setForm] = useState({ username: '', password: '', email: '', full_name: '' });
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', full_name: '', password: '' });
  const [assignRole, setAssignRole] = useState<{ [key: number]: number }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [roleForm, setRoleForm] = useState({ role_name: '', description: '' });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await getAllAdmins();
      setAdmins(res.data);
    } catch (err) {
      toast.error('Failed to fetch admins');
    }
    setLoading(false);
  };

  const fetchRoles = async () => {
    try {
      const res = await getAllRoles();
      setRoles(res.data);
    } catch (err) {
      toast.error('Failed to fetch roles');
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAdmin(form.username, form.password, form.email, form.full_name);
      setForm({ username: '', password: '', email: '', full_name: '' });
      fetchAdmins();
      toast.success('Admin created successfully.');
    } catch (err) {
      toast.error('Failed to create admin');
    }
    setLoading(false);
  };

  const handleDelete = (admin: Admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;
    setLoading(true);
    try {
      await deleteAdmin(adminToDelete.admin_id);
      toast.success('Admin deleted successfully.');
      fetchAdmins();
    } catch (err) {
      toast.error('Failed to delete admin');
    }
    setLoading(false);
    setShowDeleteModal(false);
    setAdminToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAdminToDelete(null);
  };

  const handleEdit = (admin: Admin) => {
    setEditId(admin.admin_id);
    setEditForm({ username: admin.username, email: admin.email, full_name: admin.full_name, password: '' });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (admin_id: number) => {
    setLoading(true);
    try {
      await updateAdmin(admin_id, editForm);
      setEditId(null);
      fetchAdmins();
      toast.success('Admin updated successfully.');
    } catch (err) {
      toast.error('Failed to update admin');
    }
    setLoading(false);
  };

  const handleAssignRole = async (admin_id: number) => {
    if (!assignRole[admin_id]) return;
    setLoading(true);
    try {
      await assignRoleToAdmin(admin_id, assignRole[admin_id]);
      fetchAdmins();
      toast.success('Role assigned successfully.');
    } catch (err) {
      toast.error('Failed to assign role');
    }
    setLoading(false);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoleForm({ ...roleForm, [e.target.name]: e.target.value });
  };

  const handleRoleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRole(roleForm.role_name, roleForm.description);
      setRoleForm({ role_name: '', description: '' });
      fetchRoles();
      toast.success('Role created successfully.');
    } catch (err) {
      toast.error('Failed to create role');
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Admins</h2>
      {/* Role Creation Form */}
      <form onSubmit={handleRoleCreate} className="mb-6 flex gap-2 items-center">
        <input name="role_name" value={roleForm.role_name} onChange={handleRoleChange} placeholder="Role Name" className="border p-2" required />
        <input name="description" value={roleForm.description} onChange={handleRoleChange} placeholder="Description" className="border p-2" />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Create Role</button>
      </form>
      <form onSubmit={handleCreate} className="mb-6 space-y-2">
        <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="border p-2 mr-2" required />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="border p-2 mr-2" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 mr-2" required />
        <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full Name" className="border p-2 mr-2" required />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create Admin</button>
      </form>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Full Name</th>
            <th className="border px-4 py-2">Created At</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.admin_id}>
              <td className="border px-4 py-2">{admin.admin_id}</td>
              <td className="border px-4 py-2">
                {editId === admin.admin_id ? (
                  <input name="username" value={editForm.username} onChange={handleEditChange} className="border p-1" />
                ) : (
                  admin.username
                )}
              </td>
              <td className="border px-4 py-2">
                {editId === admin.admin_id ? (
                  <input name="email" value={editForm.email} onChange={handleEditChange} className="border p-1" />
                ) : (
                  admin.email
                )}
              </td>
              <td className="border px-4 py-2">
                {editId === admin.admin_id ? (
                  <input name="full_name" value={editForm.full_name} onChange={handleEditChange} className="border p-1" />
                ) : (
                  admin.full_name
                )}
              </td>
              <td className="border px-4 py-2">{admin.created_at}</td>
              <td className="border px-4 py-2">
                <select
                  value={assignRole[admin.admin_id] || ''}
                  onChange={e => setAssignRole({ ...assignRole, [admin.admin_id]: Number(e.target.value) })}
                  className="border p-1"
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssignRole(admin.admin_id)}
                  className="ml-2 bg-green-500 text-white px-2 py-1 rounded"
                  disabled={!assignRole[admin.admin_id]}
                >Assign</button>
              </td>
              <td className="border px-4 py-2">
                {editId === admin.admin_id ? (
                  <>
                    <button onClick={() => handleEditSave(admin.admin_id)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Save</button>
                    <button onClick={() => setEditId(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(admin)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                    <button onClick={() => handleDelete(admin)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && adminToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete admin <b>{adminToDelete.username}</b>?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >Cancel</button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins; 