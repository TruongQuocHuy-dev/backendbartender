import React, { useState } from 'react';
import { auth, db } from '../../services/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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

function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Tạo tài khoản bằng Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Cập nhật hồ sơ người dùng với tên đầy đủ
            await updateProfile(user, {
                displayName: fullName,
            });

            // Lưu thông tin người dùng vào Firestore
            await setDoc(doc(db, 'users', user.uid), {
                fullName,
                email,
                userId: user.uid,
                createdAt: new Date(),
            });

            // Điều hướng tới trang đăng nhập sau khi đăng ký thành công
            navigate('/login');
        } catch (err) {
            setError('Đăng ký thất bại: ' + err.message);
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
                <Box textAlign="center" mb={3}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Đăng Ký
                    </Typography>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Họ và tên"
                                variant="outlined"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </Grid>
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
                                type="password"
                                label="Mật khẩu"
                                variant="outlined"
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
                                Đăng Ký
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                <Box textAlign="center" mt={2}>
                    <Typography variant="body2">
                        Bạn đã có tài khoản?{' '}
                        <Button
                            onClick={() => navigate('/login')}
                            variant="text"
                            size="small"
                        >
                            Đăng nhập
                        </Button>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}

export default Register;