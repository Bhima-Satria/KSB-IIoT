import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './dataService';
import { FaFacebook, FaInstagram, FaLinkedin, FaGlobe, FaYoutube } from 'react-icons/fa';

const KSBLogo = '../img/ksblogo.png';
const BackgroundImage = '../img/KSB67.webp';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        setTimeout(() => setFadeIn(true), 100); // Delay agar efek terlihat
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(username, password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden'
        }}>
            <div style={{
                flex: '8',
                backgroundColor: 'rgb(0, 32, 64)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '60px',
                position: 'relative',
                backgroundImage: `url(${BackgroundImage})`,
                backgroundSize: '100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
                opacity: '1'
            }}>

                <div style={{
                    opacity: fadeIn ? 1 : 0,
                    transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 1s ease-out, transform 3s ease-out'
                }}>
                    <h1 style={{ fontSize: '70px', fontWeight: 'bold', marginBottom: '10px', lineHeight: '1' }}>
                        KSB<br />INDONESIA<br />SMART PRODUCT
                    </h1>
                    <p style={{ fontSize: '18px', maxWidth: '600px', color: '#ddd' }}>
                        Real-time Monitoring for Peak Performance and Efficiency!
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '30px',
                    marginBottom: '10px',
                    position: 'relative',
                    opacity: fadeIn ? 1 : 0,
                    transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 1s ease-out 0.3s, transform 1s ease-out 0.3s'
                }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#ffffff' }}>📊 Real-time Monitoring</h3>
                        <p>Monitor unit parameters such as pressure, temperature, and flow with continuously updated data.</p>
                    </div>
                    <div style={{ width: '2px', backgroundColor: 'white' }}></div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#ffffff' }}>📈 Performance Analysis</h3>
                        <p>Analyze unit performance over time to optimize operational efficiency.</p>
                    </div>
                    <div style={{ width: '2px', backgroundColor: 'white' }}></div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#ffffff' }}>⚠️ Error Detection</h3>
                        <p>Identify and track system errors in real-time to prevent failures.</p>
                    </div>
                </div>
            </div>



            {/* Right Side (20%) - White Background */}
            <div style={{
                flex: '2',
                backgroundColor: 'white',
                color: 'black',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between', // Menjaga elemen di atas & footer tetap di bawah
                alignItems: 'center',
                padding: '40px',
                minHeight: '100vh' // Pastikan div mengambil tinggi penuh layar
            }}>
                {/* Login Title */}
                <div style={{
                    textAlign: 'left',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 'bold',
                    lineHeight: '1.2',
                    alignSelf: 'flex-start',
                }}>
                    <h2 style={{
                        fontSize: '26px',
                        marginBottom: '0px',
                        color: 'rgb(51, 102, 153)',
                        letterSpacing: '1px',
                        animation: 'fadeIn 1s ease-in-out',
                    }}>
                        WELCOME TO <br /> KSB INDONESIA
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        fontWeight: 'normal',
                        marginTop: '0px',
                        marginBottom: '150px',
                        color: 'rgb(51, 102, 153)',
                        transition: 'all 0.3s ease-in-out',
                    }}>
                        Please login to access the system.
                    </p>
                </div>

                {/* Login Form Section */}
                <div style={{
                    width: '100%',
                    maxWidth: '320px',
                    backgroundColor: '#fff',
                    padding: '30px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}>
                    <img src={KSBLogo} alt="KSB Logo" style={{ width: '50%', height: 'auto', marginBottom: '30px' }} />
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '15px' }}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '14px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                    outline: 'none',
                                    backgroundColor: '#f7f7f7',
                                    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)'
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '14px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                    outline: 'none',
                                    backgroundColor: '#f7f7f7',
                                    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)'
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
                                borderRadius: '5px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                        {/* Pesan Kesalahan */}
                        {error && (
                            <p style={{
                                marginTop: '10px',
                                color: 'red',
                                fontSize: '14px',
                                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                borderRadius: '5px',
                                padding: '5px',
                            }}>
                                ❌ Invalid username or password. Please try again.
                            </p>
                        )}
                    </form>
                </div>

                {/* Divider Line */}
                <div style={{
                    marginTop: '50px',
                    borderTop: '1px solid #ccc',
                    width: '80%',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <span style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        backgroundColor: 'white',
                        padding: '0 10px',
                        transform: 'translateX(-50%)',
                        fontSize: '14px',
                    }}>Find Us</span>
                </div>

                {/* Social Media Icons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px' }}>
                    <a href="https://www.facebook.com/KSB.Company/" target="_blank" rel="noopener noreferrer">
                        <FaFacebook size={26} color="#4267B2" />
                    </a>
                    <a href="https://www.instagram.com/ksb.indonesia/?hl=en" target="_blank" rel="noopener noreferrer">
                        <FaInstagram size={26} color="#E4405F" />
                    </a>
                    <a href="https://id.linkedin.com/company/ksb-indonesia" target="_blank" rel="noopener noreferrer">
                        <FaLinkedin size={26} color="#0077B5" />
                    </a>
                    <a href="https://www.ksb.com/id-id/perusahaan" target="_blank" rel="noopener noreferrer">
                        <FaGlobe size={26} color="#555" />
                    </a>
                    <a href="https://www.youtube.com/user/ksbcompany" target="_blank" rel="noopener noreferrer">
                        <FaYoutube size={30} color="#FF0000" />
                    </a>
                </div>

                {/* Footer - Tetap di Bawah */}
                <div style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#777',
                    marginTop: 'auto', // Menjaga footer tetap di bawah
                    paddingBottom: '20px' // Jarak bawah agar tidak terlalu mepet
                }}>
                    &copy; 2025 KSB Indonesia. All rights reserved.
                </div>
            </div>

        </div>
    );
};

export default LoginPage;