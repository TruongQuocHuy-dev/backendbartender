import React, { useState, useEffect } from 'react';
import { Grid, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import UserCard from '../components/UserCard';
import { COLORS } from '../utils/constants';
import { getUsers, updateUser, deleteUser } from '../services/usersService';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null); // Trạng thái người dùng hiện tại
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login'); // Chuyển hướng đến Login nếu chưa đăng nhập
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Lấy danh sách người dùng sau khi đã xác định người dùng đã đăng nhập
  useEffect(() => {
    if (user) { // Chỉ gọi fetchUsers nếu user đã đăng nhập
      const fetchUsers = async () => {
        const userList = await getUsers();
        setUsers(userList);
      };
      fetchUsers();
    }
  }, [user]); // Dependency chỉ là user, đảm bảo chỉ chạy khi user thay đổi

  const handleEdit = async (userId, data) => {
    await updateUser(userId, data);
    setUsers(users.map(u => u.id === userId ? { ...u, ...data } : u));
  };

  const handleDelete = async (userId) => {
    await deleteUser(userId);
    setUsers(users.filter(u => u.id !== userId));
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { field: 'fullName', headerName: 'Full Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'premium_status', headerName: 'Premium', width: 100, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'last_active_date', headerName: 'Last Active', width: 200, valueFormatter: (params) => new Date(params.value).toLocaleString() },
  ];

  return (
    <Grid container spacing={2} sx={{ padding: 2, backgroundColor: COLORS.BACKGROUND }}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{ backgroundColor: COLORS.CARD, marginBottom: 2 }}
        />
      </Grid>
      <Grid item xs={12}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          sx={{
            backgroundColor: COLORS.CARD,
            color: COLORS.TEXT,
            '& .MuiDataGrid-cell': { color: COLORS.SUBTEXT },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: COLORS.BACKGROUND, color: COLORS.TEXT },
          }}
        />
      </Grid>
      {filteredUsers.map(user => (
        <Grid item xs={12} sm={6} md={4} key={user.id}>
          <UserCard user={user} onEdit={() => handleEdit(user.id, { /* Dữ liệu mới */ })} onDelete={() => handleDelete(user.id)} />
        </Grid>
      ))}
    </Grid>
  );
};

export default UsersScreen;