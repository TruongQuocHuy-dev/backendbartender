import React, { useState, useEffect } from 'react';
import { Grid, TextField, Card, CardContent, CardActions, Typography, Button } from '@mui/material';
import { COLORS } from '../utils/constants';
import { getPosts, updatePost, deletePost } from '../services/postsService';

const PostsScreen = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      const postList = await getPosts();
      setPosts(postList);
    };
    fetchPosts();
  }, []);

  const handleEdit = async (postId, data) => {
    await updatePost(postId, data);
    setPosts(posts.map(p => p.id === postId ? { ...p, ...data } : p));
  };

  const handleDelete = async (postId) => {
    await deletePost(postId);
    setPosts(posts.filter(p => p.id !== postId));
  };

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || // Giả định posts có field 'title'
    post.userId?.toLowerCase().includes(searchQuery.toLowerCase())    // Giả định posts có field 'userId'
  );

  return (
    <Grid container spacing={2} sx={{ padding: 2 }}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{ backgroundColor: COLORS.CARD, marginBottom: 2 }}
        />
      </Grid>
      {filteredPosts.map(post => (
        <Grid item xs={12} sm={6} md={4} key={post.id}>
          <Card sx={{ backgroundColor: COLORS.CARD, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: COLORS.TEXT }}>{post.title || 'Untitled Post'}</Typography>
              <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>User ID: {post.userId || 'N/A'}</Typography>
              <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>Status: {post.status || 'Pending'}</Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" onClick={() => handleEdit(post.id, { /* Dữ liệu mới */ })} sx={{ backgroundColor: COLORS.PRIMARY, '&:hover': { backgroundColor: '#45A049' } }}>
                Edit
              </Button>
              <Button variant="contained" onClick={() => handleDelete(post.id)} sx={{ backgroundColor: '#FF4444', '&:hover': { backgroundColor: '#CC0000' } }}>
                Delete
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PostsScreen;