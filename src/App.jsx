import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
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
