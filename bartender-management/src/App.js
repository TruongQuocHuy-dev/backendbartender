import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import AppNavigator from './navigation/AppNavigator';
import LoginScreen from './screens/LoginScreen';
import { theme } from './styles/theme';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { CircularProgress, Grid } from '@mui/material';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ height: '100vh', backgroundColor: '#1A1A1A' }}>
        <CircularProgress color="primary" />
      </Grid>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/*" element={user ? <AppNavigator /> : <Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;