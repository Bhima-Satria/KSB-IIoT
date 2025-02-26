import React, { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Alert, AlertTitle } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Content from './components/Content';
import UnitPage from './components/Unitpages';
import theme from './components/theme';
import { Helmet } from 'react-helmet';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import NonLoginPage from './components/NonLoginPage';
import UnitPage_DD from './components/Unitpages_DD';
import ChartComponent from './components/Datachart';

const Layout = () => {
    const location = useLocation(); // Mendapatkan lokasi path saat ini
    const hideHeaderOnPaths = ['/login']; // Path yang tidak menampilkan Header

    // Deteksi apakah aplikasi diakses di perangkat mobile atau desktop
    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const checkDevice = () => {
            setIsDesktop(window.innerWidth > 1024); // Set ukuran batas desktop
        };
        
        checkDevice(); // Memeriksa ukuran layar ketika komponen pertama kali dimuat

        // Tambahkan event listener untuk memeriksa perubahan ukuran layar
        window.addEventListener('resize', checkDevice);

        // Hapus event listener saat komponen dibersihkan
        return () => {
            window.removeEventListener('resize', checkDevice);
        };
    }, []);

    // Jika perangkat tidak desktop, tampilkan pesan atau redirect
    if (!isDesktop) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Alert severity="warning" sx={{ width: '80%', boxShadow: 3 }}>
                    <AlertTitle>Peringatan</AlertTitle>
                    Halaman ini hanya dapat diakses di perangkat desktop.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Tampilkan Header hanya jika path saat ini bukan /login */}
            {!hideHeaderOnPaths.includes(location.pathname) && <Header />}

            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/:redirectPath" element={<NonLoginPage />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Content />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/unit/:unitId"
                    element={
                        <ProtectedRoute>
                            <UnitPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/unit_DD/:unitId"
                    element={
                        <ProtectedRoute>
                            <UnitPage_DD />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chart"
                    element={
                        <ProtectedRoute>
                            <ChartComponent />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Box>
    );
};

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Helmet>
                    <title>KSB IoT</title>
                    <link rel="icon" href="../favicon.ico" />
                </Helmet>
                <Layout /> {/* Memisahkan Layout agar bisa menggunakan useLocation */}
            </Router>
        </ThemeProvider>
    );
};

export default App;
