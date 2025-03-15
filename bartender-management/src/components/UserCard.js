// File UserCard.js
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Avatar, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Select, 
  MenuItem, 
  DialogActions, 
  FormControlLabel, 
  Checkbox, 
  InputAdornment 
} from '@mui/material';
import { COLORS } from '../utils/constants';

const UserCard = ({ user, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    bio: user.bio,
    avatarURL: user.avatarURL,
    followers: user.followers,
    premium_status: user.premium_status,
    payment_status: user.payment_status,
    activity_status: user.activity_status,
    role: user.role
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setFormData({
      fullName: user.fullName,
      email: user.email,
      bio: user.bio,
      avatarURL: user.avatarURL,
      followers: user.followers,
      premium_status: user.premium_status,
      payment_status: user.payment_status,
      activity_status: user.activity_status,
      role: user.role
    });
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      await onEdit(user.id, formData);
      handleClose();
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    }
  };

  return (
    <Card sx={{ margin: 1, backgroundColor: COLORS.CARD, boxShadow: 1 }}>
      <CardContent>
        <Avatar src={user.avatarURL} sx={{ width: 50, height: 50, mb: 2 }} />
        <Typography variant="h6" sx={{ color: COLORS.TEXT }}>
          {user.fullName}
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
          {user.email}
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
          Vai trò: {user.role}
        </Typography>
        <CardActions>
          <Button variant="contained" onClick={handleOpen}>
            Chỉnh sửa
          </Button>
          <Button variant="outlined" color="error" onClick={onDelete}>
            Xóa
          </Button>
        </CardActions>
      </CardContent>

      {/* Dialog chỉnh sửa */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
        <DialogContent>
          {/* Dòng 1 */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <TextField
              autoFocus
              label="Họ tên"
              fullWidth
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Dòng 2 */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <TextField
              label="Bio"
              fullWidth
              multiline
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
            <TextField
              label="Avatar URL"
              fullWidth
              value={formData.avatarURL}
              onChange={(e) => setFormData({ ...formData, avatarURL: e.target.value })}
            />
          </div>

          {/* Dòng 3 */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <TextField
              label="Followers"
              type="number"
              fullWidth
              value={formData.followers}
              onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) })}
              InputProps={{
                endAdornment: <InputAdornment position="end">người</InputAdornment>
              }}
            />
            <Select
              label="Trạng thái thanh toán"
              fullWidth
              value={formData.payment_status}
              onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
            >
              <MenuItem value="pending">Chờ xử lý</MenuItem>
              <MenuItem value="completed">Hoàn thành</MenuItem>
              <MenuItem value="failed">Thất bại</MenuItem>
            </Select>
          </div>

          {/* Dòng 4 */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.premium_status}
                  onChange={(e) => setFormData({ ...formData, premium_status: e.target.checked })}
                />
              }
              label="Premium"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.activity_status}
                  onChange={(e) => setFormData({ ...formData, activity_status: e.target.checked })}
                />
              }
              label="Hoạt động"
            />
            <Select
              label="Vai trò"
              fullWidth
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="user">Người dùng</MenuItem>
              <MenuItem value="admin">Quản trị viên</MenuItem>
              <MenuItem value="moderator">Điều hành viên</MenuItem>
            </Select>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Hủy
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default UserCard;