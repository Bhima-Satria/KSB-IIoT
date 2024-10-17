// src/App.jsx
import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Content from './components/Content';
import UnitPage from './components/Unitpages'; // Perhatikan perbaikan nama komponen
import theme from './components/theme';
import { Helmet } from 'react-helmet'; // Import Helmet

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Helmet>
          <title>KSB IoT Products</title>
          <link rel="icon" href="/img/ksblogo.png" /> {/* Path to default icon */}
        </Helmet>
        <Box sx={{ flexGrow: 1 }}>
          <Header />
          <Routes>
            <Route path="/" element={<Content />} />
            <Route path="/unit/:unitId" element={<UnitPage />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
