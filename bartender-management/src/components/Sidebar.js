import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ImageIcon from '@mui/icons-material/Image';
import LogoutIcon from '@mui/icons-material/Logout';
import { SCREEN_NAMES } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ currentScreen }) => {
  const navigate = useNavigate();
  const menuItems = [
    { name: SCREEN_NAMES.DASHBOARD, icon: <DashboardIcon />, label: 'Bảng điều khiển' },
    { name: SCREEN_NAMES.USERS, icon: <PeopleIcon />, label: 'Người dùng' },
    { name: SCREEN_NAMES.POSTS, icon: <ArticleIcon />, label: 'Bài viết' },
    { name: SCREEN_NAMES.RECIPES, icon: <RestaurantIcon />, label: 'Công thức' },
    { name: SCREEN_NAMES.BANNERS, icon: <ImageIcon />, label: 'Banners' },
    { name: SCREEN_NAMES.REPORTS, icon: <ImageIcon />, label: 'Report' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 250,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 250,
          boxSizing: 'border-box',
          backgroundColor: '#2D2D2D',
        },
      }}
    >
      <List>
        {menuItems.map(item => (
          <ListItem
            key={item.name}
            button
            onClick={() => navigate(`/${item.name.toLowerCase()}`)}
            selected={currentScreen === item.name}
            sx={{
              '&.Mui-selected': { backgroundColor: '#4CAF50', color: '#FFFFFF' },
              '&:hover': { backgroundColor: '#3D3D3D' },
            }}
          >
            <ListItemIcon sx={{ color: '#FFFFFF' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} sx={{ color: '#FFFFFF' }} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem
          button
          onClick={() => {/* Xử lý đăng xuất */}}
          sx={{ '&:hover': { backgroundColor: '#FF4444' } }}
        >
          <ListItemIcon sx={{ color: '#FFFFFF' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Đăng xuất" sx={{ color: '#FFFFFF' }} />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;