import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  TextField, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Box, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel 
} from '@mui/material';
import { COLORS } from '../utils/constants';
import { getReports, deleteReport } from '../services/reportsService';

const ReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('reason'); // Tiêu chí lọc mặc định

  useEffect(() => {
    const fetchReports = async () => {
      const reportList = await getReports();
      setReports(reportList || []);
    };
    fetchReports();
  }, []);

  const handleDelete = async (reportId) => {
    try {
      await deleteReport(reportId);
      setReports(reports.filter(report => report.id !== reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const filteredReports = reports.filter(report => {
    if (!searchQuery) return true;
    switch (filterType) {
      case 'reason':
        return report.reason && report.reason.toLowerCase().includes(searchQuery.toLowerCase());
      case 'reportedUserId':
        return report.reportedUserId && report.reportedUserId.toLowerCase().includes(searchQuery.toLowerCase());
      case 'reporterId':
        return report.reporterId && report.reporterId.toLowerCase().includes(searchQuery.toLowerCase());
      default:
        return true;
    }
  });

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Không có thời gian';

    let postTime;
    if (typeof timestamp === 'string') {
      postTime = new Date(timestamp);
    } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      postTime = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    } else {
      console.error('Invalid timestamp format:', timestamp);
      return 'Thời gian không hợp lệ';
    }

    if (isNaN(postTime.getTime())) {
      console.error('Failed to parse timestamp:', timestamp);
      return 'Thời gian không hợp lệ';
    }

    const now = new Date();
    const diffMs = now - postTime;
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
    <Box sx={{ padding: 2, backgroundColor: COLORS.BACKGROUND }}>
      <Typography variant="h4" sx={{ color: COLORS.TEXT, mb: 2 }}>
        Báo Cáo
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel sx={{ color: COLORS.SUBTEXT }}>Lọc theo</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Lọc theo"
              sx={{
                backgroundColor: COLORS.CARD,
                color: COLORS.TEXT,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.PRIMARY },
              }}
            >
              <MenuItem value="reason">Lý Do</MenuItem>
              <MenuItem value="reportedUserId">Người Bị Báo Cáo</MenuItem>
              <MenuItem value="reporterId">Người Báo Cáo</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={9}>
          <TextField
            fullWidth
            placeholder={`Tìm kiếm theo ${filterType === 'reason' ? 'lý do' : filterType === 'reportedUserId' ? 'người bị báo cáo' : 'người báo cáo'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            sx={{
              backgroundColor: COLORS.CARD,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#666' },
                '&.Mui-focused fieldset': { borderColor: COLORS.PRIMARY },
              },
              '& .MuiInputBase-input': { color: COLORS.TEXT },
              '& .MuiInputLabel-root': { color: COLORS.SUBTEXT },
            }}
            InputProps={{
              style: { color: COLORS.TEXT }
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {filteredReports.map(report => (
          <Grid item xs={12} sm={6} md={4} key={report.id}>
            <Card sx={{ backgroundColor: COLORS.CARD, border: '1px solid #333' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: COLORS.TEXT, mb: 1 }}>
                  Báo Cáo #{report.id.slice(0, 8)}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
                  <strong>Comment ID:</strong> {report.commentId || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
                  <strong>Post ID:</strong> {report.postId || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
                  <strong>Lý Do:</strong> {report.reason || 'Không có lý do'}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
                  <strong>Người Bị Báo Cáo:</strong> {report.reportedUserId || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
                  <strong>Người Báo Cáo:</strong> {report.reporterId || 'N/A'}
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.SUBTEXT, mt: 1, display: 'block' }}>
                  <strong>Thời Gian:</strong> {getRelativeTime(report.timestamp)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  onClick={() => handleDelete(report.id)}
                  sx={{ backgroundColor: '#FF4444', '&:hover': { backgroundColor: '#CC0000' }, color: '#FFFFFF', ml: 'auto' }}
                >
                  Xóa
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportsScreen;