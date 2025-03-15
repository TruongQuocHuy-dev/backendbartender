import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  TextField, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  CardMedia
} from '@mui/material';
import { COLORS } from '../utils/constants';
import { getPosts, updatePost, deletePost } from '../services/postsService';

const PostsScreen = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      const postList = await getPosts();
      setPosts(postList || []); // Đảm bảo posts là mảng nếu API trả về undefined
    };
    fetchPosts();
  }, []);

  const handleEdit = async (postId, data) => {
    try {
      await updatePost(postId, data);
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, ...data } : p
      ));
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const filteredPosts = posts.filter(post =>
    (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (post.userID && post.userID.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (post.description && post.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenDialog = (post) => {
    setEditingPost({ ...post }); // Tạo bản sao để tránh thay đổi trực tiếp state
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingPost(null);
    setIsDialogOpen(false);
  };

  const renderFormFields = (post) => {
    const systemFields = ['id', 'userID', 'timePosts', 'imagePosts', 'likesUsers', 'followUsers'];
    return Object.keys(post).filter(key => 
      !systemFields.includes(key)
    ).map(key => {
      if (typeof post[key] === 'boolean') {
        return (
          <FormControlLabel
            key={key}
            control={
              <Switch
                checked={editingPost?.[key] || false}
                onChange={(e) => 
                  setEditingPost(prev => ({ ...prev, [key]: e.target.checked }))
                }
                color="primary"
              />
            }
            label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          />
        );
      }
      
      if (Array.isArray(post[key])) {
        return (
          <TextField
            key={key}
            fullWidth
            label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            value={(editingPost?.[key] || []).join(', ')}
            onChange={(e) => 
              setEditingPost(prev => ({
                ...prev,
                [key]: e.target.value.split(',').map(item => item.trim())
              }))
            }
            margin="normal"
            variant="outlined"
          />
        );
      }

      return (
        <TextField
          key={key}
          fullWidth
          label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          value={editingPost?.[key] || ''}
          onChange={(e) => 
            setEditingPost(prev => ({ ...prev, [key]: e.target.value }))
          }
          margin="normal"
          variant="outlined"
        />
      );
    });
  };

  // Hàm tính thời gian tương đối
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Không có thời gian';

    let postTime;

    // Nếu timestamp là chuỗi, chuẩn hóa và chuyển thành Date
    if (typeof timestamp === 'string') {
      const cleanTimestamp = timestamp
        .replace(/\u202F/g, ' ') // Loại bỏ non-breaking space
        .replace(/UTC\+7$/, '')   // Loại bỏ "UTC+7"
        .trim();
      postTime = new Date(cleanTimestamp);
    } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      // Nếu timestamp là đối tượng Timestamp của Firebase
      postTime = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    } else {
      console.error('Invalid timestamp format:', timestamp);
      return 'Thời gian không hợp lệ';
    }

    // Kiểm tra xem postTime có hợp lệ không
    if (isNaN(postTime.getTime())) {
      console.error('Failed to parse timestamp:', timestamp);
      return 'Thời gian không hợp lệ';
    }

    const now = new Date();
    const diffMs = now - postTime; // Chênh lệch mili giây
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffSeconds < 60) return 'Vừa đây';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffWeeks < 52) return `${diffWeeks} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  return (
    <Grid container spacing={2} sx={{ padding: 2, backgroundColor: COLORS.BACKGROUND }}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm bài đăng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{ backgroundColor: COLORS.CARD, marginBottom: 2 }}
          InputProps={{
            style: { color: COLORS.TEXT }
          }}
        />
      </Grid>
      
      {filteredPosts.map(post => (
        <Grid item xs={12} sm={6} md={4} key={post.id}>
          <Card sx={{ backgroundColor: COLORS.CARD, boxShadow: 1 }}>
            {/* Hiển thị hình ảnh nếu có */}
            {post.imagePosts && Array.isArray(post.imagePosts) && post.imagePosts.length > 0 && (
              <CardMedia
                component="img"
                height="140"
                image={post.imagePosts[0]} // Lấy hình ảnh đầu tiên
                alt={post.title || 'Hình ảnh bài đăng'}
                sx={{ objectFit: 'cover' }}
              />
            )}
            
            <CardContent>
              <Typography variant="h6" sx={{ color: COLORS.TEXT }}>
                {post.title || 'Không có tiêu đề'}
              </Typography>
              
              {post.jobType ? (
                <>
                  <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
                    Loại: {post.jobType === 'hire' ? 'Tuyển dụng' : 'Tìm việc'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
                    Mô tả: {post.description || 'Không có mô tả'}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
                  Nội dung: {post.content || 'Không có nội dung'}
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: COLORS.SUBTEXT }}>
                Thời gian: {getRelativeTime(post.timePosts)}
              </Typography>
            </CardContent>
            
            <CardActions>
              <Button 
                variant="contained" 
                onClick={() => handleOpenDialog(post)}
                sx={{ backgroundColor: COLORS.PRIMARY, '&:hover': { backgroundColor: '#45A049' }, color: '#FFFFFF' }}
              >
                Sửa
              </Button>
              <Button 
                variant="contained" 
                onClick={() => handleDelete(post.id)}
                sx={{ backgroundColor: '#FF4444', '&:hover': { backgroundColor: '#CC0000' }, color: '#FFFFFF' }}
              >
                Xóa
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Sửa Bài Đăng</DialogTitle>
        <DialogContent>
          {editingPost && renderFormFields(editingPost)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Hủy
          </Button>
          <Button 
            onClick={() => handleEdit(editingPost.id, editingPost)} 
            color="primary"
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default PostsScreen;