import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { getUsers } from '../services/usersService';
import { getPosts } from '../services/postsService';
import { getPayments } from '../services/paymentsService';
import { COLORS } from '../utils/constants';

// Hàm hỗ trợ parse chuỗi thời gian
const parseDate = (dateString) => {
  // Nếu là Timestamp từ Firestore, trả về trực tiếp
  if (dateString instanceof Date) return dateString;
  if (typeof dateString === 'object' && dateString.seconds) {
    return new Date(dateString.seconds * 1000); // Chuyển Timestamp Firestore
  }
  
  // Xử lý chuỗi "March 15, 2025 at 7:04:40 PM UTC+7"
  const cleanedDate = dateString.replace(' at ', ' ').replace(' UTC+7', '');
  const date = new Date(cleanedDate);
  
  if (isNaN(date.getTime())) {
    console.error('Invalid Date:', dateString);
    return new Date(); // Trả về ngày hiện tại nếu không parse được
  }
  return date;
};

const DashboardScreen = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalPosts: 0,
    newPosts: 0,
    totalJobs: 0,
    totalRevenue: 0,
    newRevenue: 0,
    revenueGrowth: [],
    revenueByPeriod: [],
    postCategories: [],
    userGrowth: [],
    postGrowth: [],
    quarterlyData: [],
  });

  const [timeRange, setTimeRange] = useState('day');
  const [revenuePeriod, setRevenuePeriod] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      const [users, posts, payments] = await Promise.all([
        getUsers(),
        getPosts(),
        getPayments()
      ]);

      const now = new Date();
      let startDate;
      switch (timeRange) {
        case 'day':
          startDate = new Date(now - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now - 24 * 60 * 60 * 1000);
      }

      const newUsers = users.filter(user => parseDate(user.createdAt) > startDate);
      const newPosts = posts.filter(post => parseDate(post.timePosts) > startDate);
      const newPayments = payments.filter(payment => 
        parseDate(payment.paymentDate) > startDate && payment.status === 'completed'
      );

      const userGrowthData = users.reduce((acc, user) => {
        const date = parseDate(user.createdAt).toLocaleDateString('vi-VN');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      const userGrowth = Object.keys(userGrowthData).map((date) => ({
        date,
        count: userGrowthData[date],
      }));

      const postGrowthData = posts.reduce((acc, post) => {
        const date = parseDate(post.timePosts).toLocaleDateString('vi-VN');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      const postGrowth = Object.keys(postGrowthData).map((date) => ({
        date,
        count: postGrowthData[date],
      }));

      const revenueGrowthData = payments.reduce((acc, payment) => {
        if (payment.status === 'completed') {
          const date = parseDate(payment.paymentDate).toLocaleDateString('vi-VN');
          acc[date] = (acc[date] || 0) + payment.amount;
        }
        return acc;
      }, {});
      const revenueGrowth = Object.keys(revenueGrowthData).map((date) => ({
        date,
        count: revenueGrowthData[date],
      }));

      const revenueByPeriodData = payments.reduce((acc, payment) => {
        if (payment.status === 'completed') {
          const paymentDate = parseDate(payment.paymentDate);
          let periodKey;
          if (revenuePeriod === 'month') {
            periodKey = paymentDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
          } else {
            const quarter = Math.floor(paymentDate.getMonth() / 3) + 1;
            periodKey = `Q${quarter} ${paymentDate.getFullYear()}`;
          }
          acc[periodKey] = (acc[periodKey] || 0) + payment.amount;
        }
        return acc;
      }, {});
      const revenueByPeriod = Object.keys(revenueByPeriodData).map((period) => ({
        period,
        amount: revenueByPeriodData[period],
      }));

      const postCategoriesData = {
        'Bài viết thông thường': posts.filter(p => !p.jobType || p.jobType === undefined).length,
        'Tuyển dụng': posts.filter(p => p.jobType === 'hire').length,
        'Tìm việc': posts.filter(p => p.jobType === 'seek').length,
      };
      const postCategories = [
        { label: 'Bài viết thông thường', value: postCategoriesData['Bài viết thông thường'] },
        { label: 'Tuyển dụng', value: postCategoriesData['Tuyển dụng'] },
        { label: 'Tìm việc', value: postCategoriesData['Tìm việc'] },
      ];

      const quarterlyData = [
        { quarter: 'Q1', normal: 54, other: 30 },
        { quarter: 'Q2', normal: 76, other: 45 },
        { quarter: 'Q3', new: 60, other: 25 },
        { quarter: 'Q4', normal: 80, other: 50 },
      ].map(item => ({
        quarter: item.quarter,
        normal: newUsers.length * (Math.random() * 10),
        other: newPosts.length * (Math.random() * 10),
      }));

      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      const newRevenue = newPayments.reduce((sum, payment) => sum + payment.amount, 0);

      setStats({
        totalUsers: users.length,
        newUsers: newUsers.length,
        totalPosts: posts.length,
        newPosts: newPosts.length,
        totalJobs: posts.filter(p => p.jobType === 'hire' || p.jobType === 'seek').length,
        totalRevenue,
        newRevenue,
        revenueGrowth,
        revenueByPeriod,
        userGrowth,
        postGrowth,
        postCategories,
        quarterlyData,
      });
    };
    fetchData();
  }, [timeRange, revenuePeriod]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleRevenuePeriodChange = (event) => {
    setRevenuePeriod(event.target.value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Box sx={{ padding: 2, backgroundColor: COLORS.BACKGROUND }}>
      <Typography variant="h4" sx={{ color: COLORS.TEXT, mb: 2 }}>
        Bảng Điều Khiển
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl sx={{ minWidth: 120, mr: 2, mb: 2 }}>
            <InputLabel sx={{ color: COLORS.TEXT }}>Khoảng Thời Gian</InputLabel>
            <Select
              value={timeRange}
              label="Khoảng Thời Gian"
              onChange={handleTimeRangeChange}
              sx={{
                color: COLORS.TEXT,
                backgroundColor: COLORS.CARD,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.SUBTEXT },
              }}
            >
              <MenuItem value="day">24 Giờ Qua</MenuItem>
              <MenuItem value="week">7 Ngày Qua</MenuItem>
              <MenuItem value="month">30 Ngày Qua</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120, mb: 2 }}>
            <InputLabel sx={{ color: COLORS.TEXT }}>Kỳ Doanh Thu</InputLabel>
            <Select
              value={revenuePeriod}
              label="Kỳ Doanh Thu"
              onChange={handleRevenuePeriodChange}
              sx={{
                color: COLORS.TEXT,
                backgroundColor: COLORS.CARD,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.SUBTEXT },
              }}
            >
              <MenuItem value="month">Theo Tháng</MenuItem>
              <MenuItem value="quarter">Theo Quý</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: COLORS.CARD, color: COLORS.TEXT }}>
            <CardContent>
              <Typography variant="h6">Tổng Người Dùng</Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Mới: {stats.newUsers} (Trong {timeRange === 'day' ? '24 giờ' : timeRange === 'week' ? '7 ngày' : '30 ngày'})
              </Typography>
              <LineChart
                xAxis={[{ data: stats.userGrowth.map(item => item.date), label: 'Ngày' }]}
                series={[{ data: stats.userGrowth.map(item => item.count), label: 'Tổng Người Dùng' }]}
                height={150}
                sx={{ '& .MuiChartsAxis-line': { stroke: COLORS.TEXT }, '& .MuiChartsAxis-tickLabel': { fill: COLORS.TEXT } }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: COLORS.CARD, color: COLORS.TEXT }}>
            <CardContent>
              <Typography variant="h6">Tổng Bài Đăng</Typography>
              <Typography variant="h4">{stats.totalPosts}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Mới: {stats.newPosts} (Trong {timeRange === 'day' ? '24 giờ' : timeRange === 'week' ? '7 ngày' : '30 ngày'})
              </Typography>
              <LineChart
                xAxis={[{ data: stats.postGrowth.map(item => item.date), label: 'Ngày' }]}
                series={[{ data: stats.postGrowth.map(item => item.count), label: 'Tổng Bài Đăng' }]}
                height={150}
                sx={{ '& .MuiChartsAxis-line': { stroke: COLORS.TEXT }, '& .MuiChartsAxis-tickLabel': { fill: COLORS.TEXT } }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: COLORS.CARD, color: COLORS.TEXT }}>
            <CardContent>
              <Typography variant="h6">Tổng Công Việc</Typography>
              <Typography variant="h4">{stats.totalJobs}</Typography>
              <LineChart
                xAxis={[{ data: stats.postGrowth.map(item => item.date), label: 'Ngày' }]}
                series={[{ data: stats.postGrowth.map(item => item.count), label: 'Tổng Công Việc' }]}
                height={150}
                sx={{ '& .MuiChartsAxis-line': { stroke: COLORS.TEXT }, '& .MuiChartsAxis-tickLabel': { fill: COLORS.TEXT } }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: COLORS.CARD, color: COLORS.TEXT }}>
            <CardContent>
              <Typography variant="h6">Tổng Doanh Thu</Typography>
              <Typography variant="h4">{formatCurrency(stats.totalRevenue)}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Mới: {formatCurrency(stats.newRevenue)} (Trong {timeRange === 'day' ? '24 giờ' : timeRange === 'week' ? '7 ngày' : '30 ngày'})
              </Typography>
              <LineChart
                xAxis={[{ data: stats.revenueGrowth.map(item => item.date), label: 'Ngày' }]}
                series={[{ data: stats.revenueGrowth.map(item => item.count), label: 'Doanh Thu' }]}
                height={150}
                sx={{ '& .MuiChartsAxis-line': { stroke: COLORS.TEXT }, '& .MuiChartsAxis-tickLabel': { fill: COLORS.TEXT } }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: COLORS.CARD, color: COLORS.TEXT }}>
            <CardContent>
              <Typography variant="h6">Doanh Thu Theo {revenuePeriod === 'month' ? 'Tháng' : 'Quý'}</Typography>
              <BarChart
                xAxis={[{ scaleType: 'band', data: stats.revenueByPeriod.map(item => item.period), label: revenuePeriod === 'month' ? 'Tháng' : 'Quý' }]}
                series={[
                  { data: stats.revenueByPeriod.map(item => item.amount), label: 'Doanh Thu', color: COLORS.PRIMARY },
                ]}
                height={200}
                sx={{ '& .MuiChartsAxis-line': { stroke: COLORS.TEXT }, '& .MuiChartsAxis-tickLabel': { fill: COLORS.TEXT } }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: COLORS.CARD, color: COLORS.TEXT }}>
            <CardContent>
              <Typography variant="h6">Phân Loại Bài Đăng</Typography>
              <PieChart
                series={[{ data: stats.postCategories, innerRadius: 30, outerRadius: 100, paddingAngle: 5, cornerRadius: 5 }]}
                height={200}
                sx={{ '& .MuiChartsAxis-tickLabel': { fill: COLORS.TEXT } }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardScreen;