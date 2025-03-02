import React, { useState } from 'react';
import { Grid, TextField, Button, Typography, Alert, Card } from '@mui/material';
import { COLORS } from '../utils/constants';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Chuyển hướng đến Dashboard sau khi đăng nhập thành công
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ height: '100vh', backgroundColor: COLORS.BACKGROUND }}
    >
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ backgroundColor: COLORS.CARD, padding: 4, boxShadow: 3 }}>
          <Typography variant="h4" sx={{ color: COLORS.TEXT, textAlign: 'center', marginBottom: 2 }}>
            Login to CocktailFreshness
          </Typography>
          {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              sx={{ marginBottom: 2, backgroundColor: '#3D3D3D', '& .MuiOutlinedInput-root': { color: COLORS.TEXT } }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              sx={{ marginBottom: 2, backgroundColor: '#3D3D3D', '& .MuiOutlinedInput-root': { color: COLORS.TEXT } }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ backgroundColor: COLORS.PRIMARY, '&:hover': { backgroundColor: '#45A049' }, padding: 1.5 }}
            >
              Login
            </Button>
          </form>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LoginScreen;