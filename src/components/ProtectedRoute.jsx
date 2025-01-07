import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (token && location.pathname === '/login') {
            navigate('/', { replace: true }); // Paksa user tetap di halaman utama
        }
    }, [token, location, navigate]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
