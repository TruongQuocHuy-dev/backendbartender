import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { getUsers } from '../services/usersService';
import { getPosts } from '../services/postsService';
import { getRecipes } from '../services/recipesService';
import { getBanners } from '../services/bannersService';
import { COLORS } from '../utils/constants'; // Giữ lại nếu cần sử dụng

const DashboardScreen = () => {
  const [stats, setStats] = useState({
    users: { count: 0, percentage: 80 },
    posts: { count: 0, percentage: 80 },
    recipes: { count: 0, percentage: 80 },
    banners: { count: 0, percentage: 100 },
  });

  useEffect(() => {
    const fetchData = async () => {
      const [users, posts, recipes, banners] = await Promise.all([
        getUsers(),
        getPosts(),
        getRecipes(),
        getBanners(),
      ]);
      setStats({
        users: { count: users.length, percentage: 80 },
        posts: { count: posts.length, percentage: 80 },
        recipes: { count: recipes.length, percentage: 80 },
        banners: { count: banners.length, percentage: 100 },
      });
    };
    fetchData();
  }, []);

  const statsData = [
    { title: 'Users', ...stats.users },
    { title: 'Posts', ...stats.posts },
    { title: 'Recipes', ...stats.recipes },
    { title: 'Banners', ...stats.banners },
  ];

  return (
    <Grid container spacing={2} sx={{ padding: 2, backgroundColor: COLORS.BACKGROUND }}> {/* Sử dụng COLORS nếu cần */}
      {statsData.map(item => (
        <Grid item xs={12} sm={6} md={3} key={item.title}>
          <Card sx={{ backgroundColor: COLORS.CARD }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: COLORS.TEXT }}>{item.title}</Typography>
              <Typography variant="body1" sx={{ color: COLORS.SUBTEXT }}>{item.count}</Typography>
              <LinearProgress variant="determinate" value={item.percentage} sx={{ backgroundColor: '#3D3D3D', '& .MuiLinearProgress-bar': { backgroundColor: COLORS.PRIMARY } }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardScreen;