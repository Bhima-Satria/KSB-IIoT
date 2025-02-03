import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loginKsbengdev } from './dataService';  // Mengimpor fungsi login otomatis ksbengdev

const NonLoginPage = () => {
    const navigate = useNavigate();
    const { redirectPath } = useParams(); // Menangkap path dinamis

    useEffect(() => {
        const handleLogin = async () => {
            try {
                // Login otomatis menggunakan kredensial ksbengdev
                const token = await loginKsbengdev();
                if (token) {
                    let unitId = '';

                    // Tentukan unitId berdasarkan redirectPath
                    if (redirectPath === 'yMuD$2p67') {
                        unitId = 'KSB 67';
                    } else if (redirectPath === 'yMuD$2p64') {
                        unitId = 'KSB 64';
                    }

                    // Arahkan ke halaman unit yang sesuai setelah login berhasil
                    if (unitId) {
                        navigate(`/unit/${unitId}`, { replace: true });
                    } else {
                        console.error("Invalid redirect path");
                        navigate('/login', { replace: true });
                    }
                }
            } catch (error) {
                console.error("Login failed:", error);
                navigate('/login', { replace: true });  // Jika login gagal, arahkan ke halaman login
            }
        };

        // Jalankan login otomatis
        handleLogin();
    }, [navigate, redirectPath]);

    return (
        <div>
            <h2>Logging in...</h2>
        </div>
    );
};

export default NonLoginPage;
