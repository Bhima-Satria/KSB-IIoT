import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    const location = useLocation();
    const navigate = useNavigate();

    // Cek jika user sudah login dan mencoba mengakses halaman login
    useEffect(() => {
        if (token && location.pathname === '/login') {
            navigate('/', { replace: true }); // Arahkan ke halaman utama jika sudah login
        }
    }, [token, location, navigate]);

    // Jika tidak ada token, arahkan user ke halaman login
    if (!token && location.pathname !== '/login') {
        return <Navigate to="/login" replace />;
    }

    // Jika ada token dan bukan halaman login, tampilkan halaman yang dilindungi
    return children;
};

export default ProtectedRoute;
