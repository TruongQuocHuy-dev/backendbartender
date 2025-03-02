import React, { createContext, useContext, useState } from 'react';

// Tạo context cho người dùng
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Lưu trữ người dùng hiện tại

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
