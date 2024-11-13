// src/App.jsx
import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Content from './components/Content';
import UnitPage from './components/Unitpages'; // Perhatikan perbaikan nama komponen
import Overview from './components/Overview'; // Import Overview component
import theme from './components/theme';
import API from './components/API'; // Import API component
import { Helmet } from 'react-helmet'; // Import Helmet

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Helmet>
          <title>KSB IoT</title>
          <link rel="icon" href="../favicon.ico" /> {/* Path to default icon */}
        </Helmet>
        <Box sx={{ flexGrow: 1 }}>
          <Header />
          <Routes>
            <Route path="/" element={<Content />} />
            <Route path="/unit/:unitId" element={<UnitPage />} /> {/* Perhatikan perbaikan path */}
            <Route path="/overview" element={<Overview />} /> {/* Add route for Overview component */}
            <Route path="/API" element={<API />} /> {/* Add route for API component */}
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
    
  );
};

export default App;
