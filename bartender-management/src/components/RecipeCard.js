import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Avatar } from '@mui/material';
import { COLORS } from '../utils/constants';

const RecipeCard = ({ user, onEdit, onDelete }) => {
  return (
    <Card sx={{ margin: 1, backgroundColor: COLORS.CARD, boxShadow: 1 }}>
      <CardContent>
        <Avatar src={user.avatarURL || 'https://via.placeholder.com/50'} sx={{ marginRight: 2 }} />
        <Typography variant="h6" component="div" sx={{ color: COLORS.TEXT }}>
          {user.fullName}
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
          {user.email}
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
          Premium: {user.premium_status ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
          Last Active: {new Date(user.last_active_date).toLocaleString()}
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="contained" onClick={onEdit} sx={{ backgroundColor: COLORS.PRIMARY, '&:hover': { backgroundColor: '#45A049' } }}>
          Edit
        </Button>
        <Button variant="contained" onClick={onDelete} sx={{ backgroundColor: '#FF4444', '&:hover': { backgroundColor: '#CC0000' } }}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default RecipeCard;