import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Giả sử bạn đã có AuthContext để quản lý thông tin người dùng

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth(); // Lấy user từ context

  // Kiểm tra nếu người dùng chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Kiểm tra nếu user không có quyền truy cập
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children; // Render trang nếu người dùng có quyền
};

export default PrivateRoute;
