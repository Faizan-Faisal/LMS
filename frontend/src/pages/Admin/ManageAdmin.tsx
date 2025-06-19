import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import { toast } from 'react-toastify';
import { adminApi, Admin, Role, CreateAdminData } from '../../api/admin';

const ManageAdmin: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [selectedRole, setSelectedRole] = useState<number>(0);

  // Form states for new admin
  const [newAdmin, setNewAdmin] = useState<CreateAdminData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await adminApi.getAdmins();
      setAdmins(data);
    } catch (error) {
      toast.error('Failed to fetch admins');
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await adminApi.getRoles();
      setRoles(data);
    } catch (error) {
      toast.error('Failed to fetch roles');
    }
  };

  const handleCreateAdmin = async () => {
    try {
      await adminApi.createAdmin(newAdmin);
      toast.success('Admin created successfully');
      setNewAdmin({
        username: '',
        email: '',
        password: '',
        full_name: '',
      });
      fetchAdmins();
    } catch (error) {
      toast.error('Failed to create admin');
    }
  };

  const handleAssignRole = async () => {
    if (!selectedAdmin || !selectedRole) return;

    try {
      await adminApi.assignRole(selectedAdmin.admin_id, selectedRole);
      toast.success('Role assigned successfully');
      setOpenDialog(false);
      fetchAdmins();
    } catch (error) {
      toast.error('Failed to assign role');
    }
  };

  const handleRoleChange = (event: SelectChangeEvent<number>) => {
    setSelectedRole(event.target.value as number);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Admins
      </Typography>

      {/* Create New Admin Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Admin
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={newAdmin.username}
              onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={newAdmin.full_name}
              onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateAdmin}
              disabled={!newAdmin.username || !newAdmin.email || !newAdmin.password || !newAdmin.full_name}
            >
              Create Admin
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Admin List Section */}
      <Typography variant="h6" gutterBottom>
        Admin List
      </Typography>
      <Grid container spacing={2}>
        {admins.map((admin) => (
          <Grid item xs={12} sm={6} md={4} key={admin.admin_id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{admin.full_name}</Typography>
                <Typography color="textSecondary">@{admin.username}</Typography>
                <Typography variant="body2">{admin.email}</Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Roles:
                </Typography>
                {admin.roles.map((role) => (
                  <Typography key={role.role_id} variant="body2">
                    • {role.role_name}
                  </Typography>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setSelectedAdmin(admin);
                    setOpenDialog(true);
                  }}
                >
                  Assign Role
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Assign Role Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Assign Role to {selectedAdmin?.username}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              label="Role"
              onChange={handleRoleChange}
            >
              {roles.map((role) => (
                <MenuItem key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignRole} variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageAdmin; 