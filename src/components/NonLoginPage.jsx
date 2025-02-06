import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loginKsbengdev } from './dataService';  // Mengimpor fungsi login otomatis ksbengdev

const NonLoginPage = () => {
    const navigate = useNavigate();
    const { redirectPath } = useParams(); // Menangkap path dinamis

    useEffect(() => {
        const handleLogin = async () => {
            try {
                let unitId = '';

                // Tentukan unitId berdasarkan redirectPath
                if (redirectPath === 'yMuD$2p67') {
                    unitId = 'KSB 67';
                } else if (redirectPath === 'yMuD$2p64') {
                    unitId = 'KSB 64';
                } 
                else if (redirectPath === 'yMuD$2p60') {
                    unitId = 'KSB 60';
                }
                else if (redirectPath === 'yMuD$2pDD72') {
                    unitId = 'KSB 72';
                }
                else {
                    // Jika redirectPath tidak valid, tidak lanjutkan ke login otomatis
                    console.error("Invalid redirect path");
                    navigate('/login', { replace: true });
                    return;
                }

                // Jika redirectPath valid, login otomatis menggunakan kredensial ksbengdev
                const token = await loginKsbengdev();
                if (token) {
                    // Arahkan ke halaman unit yang sesuai setelah login berhasil
                    navigate(`/unit/${unitId}`, { replace: true });
                } else {
                    console.error("Login failed:", error);
                    navigate('/login', { replace: true });  // Jika login gagal, arahkan ke halaman login
                }
            } catch (error) {
                console.error("Login failed:", error);
                navigate('/login', { replace: true });  // Jika terjadi error, arahkan ke halaman login
            }
        };

        // Jalankan login otomatis jika redirectPath valid
        handleLogin();
    }, [navigate, redirectPath]);

    return (
        <div>
            <h2>Logging in...</h2>
        </div>
    );
};

export default NonLoginPage;
