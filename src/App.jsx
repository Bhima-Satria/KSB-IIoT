import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Content from './components/Content';
import UnitPage from './components/Unitpages';
import Overview from './components/Overview';
import theme from './components/theme';
import { Helmet } from 'react-helmet';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute'; // ProtectedRoute untuk akses terproteksi

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Helmet>
                    <title>KSB IoT</title>
                    <link rel="icon" href="../favicon.ico" />
                </Helmet>
                <Box sx={{ flexGrow: 1 }}>
                    <Header />
                    <Routes>
                        {/* Route untuk login */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Route yang dilindungi menggunakan ProtectedRoute */}
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
                            path="/overview"
                            element={
                                <ProtectedRoute>
                                    <Overview />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Box>
            </Router>
        </ThemeProvider>
    );
};

export default App;
