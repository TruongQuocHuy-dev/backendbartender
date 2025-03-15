import React, { useState, useEffect } from 'react';
import { Grid, TextField, Card, Button, Snackbar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import UserCard from '../components/UserCard';
import { COLORS } from '../utils/constants';
import { getUsers, updateUser, deleteUser } from '../services/usersService';


const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const cleanedDate = dateString
    .replace('at', '')
    .replace('UTC+7', 'GMT+0700')
    .replace(/[\u202F]/g, ' ') // Xử lý ký tự đặc biệt
    .trim();
    
  const date = new Date(cleanedDate);
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh'
  });
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const userList = await getUsers();
      setUsers(userList);
    };
    fetchUsers();
  }, []);
  const handleEdit = async (userId, newData) => {
    try {
      // Chuyển đổi dữ liệu trước khi gửi
      const formattedData = {
        ...newData,
        followers: parseInt(newData.followers) || 0,
        premium_status: !!newData.premium_status,
        activity_status: !!newData.activity_status
      };
  
      await updateUser(userId, formattedData);
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, ...formattedData } : user
        )
      );
      setSnackbar({
        open: true,
        message: 'Cập nhật thành công',
        severity: 'success'
      });
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      // Hiển thị thông báo lỗi cho người dùng
      setSnackbar({
        open: true,
        message: 'Lỗi: ' + error.message,
        severity: 'error'
      });
    }
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
    { field: 'fullName', headerName: 'Full Name', width: 150, editable: true },
    { field: 'email', headerName: 'Email', width: 200, editable: true },
    { 
      field: 'premium_status', 
      headerName: 'Premium', 
      width: 100, 
      valueFormatter: (params) => params.value ? 'Yes' : 'No' 
    },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      width: 200, 
      valueFormatter: (params) => formatDate(params.value) 
    },
  ];

  return (
    <Grid container spacing={2} sx={{ padding: 2 }}>
      {/* Search field và DataGrid */}
      {filteredUsers.map(user => (
        <Grid item xs={12} sm={6} md={4} key={user.id}>
          <UserCard 
            user={user} 
            onEdit={(newData) => handleEdit(user.id, newData)} 
            onDelete={() => handleDelete(user.id)} 
          />
        </Grid>
      ))}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Grid>
  );
};

export default Users;