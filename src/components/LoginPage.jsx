import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './dataService'; // Sesuaikan path sesuai struktur Anda

const KSBLogo = '../img/ksblogo.png';
const RightBackgroundImage = '../img/KSBDoubleDrive.webp'; // Replace with the actual path of your image

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Untuk redirect pengguna

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Panggil fungsi login untuk mendapatkan token
            const token = await login(username, password);

            // Cetak token atau data API yang diterima
            console.log('Token received:', token); // Menampilkan hasil token di console

            // Simpan token ke localStorage
            localStorage.setItem('token', token);

            // Redirect ke halaman UnitPage dengan ID yang sudah di-encode
            navigate(`/`);
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Left Side - Image */}
            <div style={{
                flex: '4', // Left side is larger, taking up 5/6 of the width
                display: 'flex',
                justifyContent: 'center', // Centers the image horizontally
                alignItems: 'center', // Centers the image vertically
                backgroundImage: `url(${RightBackgroundImage})`,
                backgroundSize: '60%', // Make sure the image fits without stretching
                backgroundRepeat: 'no-repeat', // Ensure the image doesn't repeat
                backgroundPosition: 'center', // Center the image
                opacity: 1, // Optional: Adjust transparency of the image
            }}></div>

            {/* Right Side - Login Form */}
            <div style={{
                flex: '1', // Right side is 1/6 of the width
                backgroundColor: 'rgb(0, 32, 64, 1)', // Blue background
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
            }}>
                <div style={{ width: '100%', maxWidth: '320px', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ textAlign: 'center' }}>
                        <img src={KSBLogo} alt="KSB Logo" style={{ width: '100px', height: 'auto' }} />
                        <h2 style={{ fontSize: '24px', marginTop: '20px', color: 'rgb(0, 0, 0)' }}>Login</h2>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                                Username:
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    fontSize: '16px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                                Password:
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    fontSize: '16px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: 'rgb(51, 102, 153)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgb(45, 90, 135)')}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = 'rgb(51, 102, 153)')}
                        >
                            Login
                        </button>

                        {error && (
                            <div style={{
                                marginTop: '15px',
                                padding: '12px',
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                borderRadius: '4px',
                                border: '1px solid #f5c6cb',
                                fontSize: '14px',
                                textAlign: 'center',
                            }}>
                                <strong>Error:</strong> {error}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
