import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loginKsbengdev } from './dataService';

const NonLoginPage = () => {
    const navigate = useNavigate();
    const { redirectPath } = useParams();

    useEffect(() => {
        const handleLogin = async () => {
            try {
                // Tentukan unitId berdasarkan path mapping
                const pathMapping = {
                    'yMuD$2p67': 'KSB 67',
                    'yMuD$2p64': 'KSB 64',
                    'yMuD$2p60': 'KSB 60',
                    'yMuD$2p72': 'KSB 72'
                };

                const unitId = pathMapping[redirectPath];

                // Jika redirectPath tidak valid, arahkan ke login
                if (!unitId) {
                    console.error("Invalid redirect path");
                    navigate('/login', { replace: true });
                    return;
                }

                // Lakukan login otomatis
                const token = await loginKsbengdev();

                if (token) {
                    const path = unitId === 'KSB 72' ? `/unit_DD/${unitId}` : `/unit/${unitId}`;
                    navigate(path, { replace: true });
                } else {
                    console.error("Login failed");
                    navigate('/login', { replace: true });
                }
            } catch (error) {
                console.error("Login failed:", error);
                navigate('/login', { replace: true });
            }
        };

        handleLogin();
    }, [navigate, redirectPath]);

    return (
        <div>
            <h2>Logging in...</h2>
        </div>
    );
};

export default NonLoginPage;
