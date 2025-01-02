import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Cek apakah token tersedia
    const token = localStorage.getItem('token');

    // Jika token tidak ada, redirect ke halaman login
    if (!token) {
        return <Navigate to="/login" />;
    }

    // Jika token ada, render komponen anak
    return children;
};

export default ProtectedRoute;
