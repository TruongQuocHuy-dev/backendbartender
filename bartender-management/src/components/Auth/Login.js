import React, { useState } from 'react';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Grid,
    Paper,
} from '@mui/material';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Đăng nhập với Firebase Authentication
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard'); // Điều hướng tới bảng điều khiển
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                setError('Người dùng không tồn tại.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Mật khẩu không đúng.');
            } else {
                setError('Lỗi đăng nhập: ' + err.message);
            }
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
                <Box textAlign="center" mb={3}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Đăng Nhập
                    </Typography>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Mật khẩu"
                                variant="outlined"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Grid>
                        {error && (
                            <Grid item xs={12}>
                                <Alert severity="error">{error}</Alert>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="large"
                            >
                                Đăng Nhập
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                <Box textAlign="center" mt={2}>
                    <Typography variant="body2">
                        Bạn chưa có tài khoản?{' '}
                        <Button
                            onClick={() => navigate('/register')}
                            variant="text"
                            size="small"
                        >
                            Đăng ký
                        </Button>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}

export default Login;
