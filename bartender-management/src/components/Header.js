import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import Brightness6Icon from '@mui/icons-material/Brightness6'; // Chỉ giữ lại icon được sử dụng
import { COLORS } from '../utils/constants';

const Header = ({ userName, onToggleTheme }) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: COLORS.BACKGROUND }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: COLORS.PRIMARY }}>
          CocktailFreshness
        </Typography>
        <Typography variant="subtitle1" sx={{ marginRight: 2, color: COLORS.TEXT }}>
          {userName}
        </Typography>
        <IconButton color="inherit" onClick={onToggleTheme}>
          <Brightness6Icon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;