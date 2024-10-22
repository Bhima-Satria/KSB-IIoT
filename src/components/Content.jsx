import React, { useState, useEffect } from 'react';
import { Typography, Button, Grid, Box } from '@mui/material';
import { CSSTransition } from 'react-transition-group';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Import gambar dari folder src/img/
import pump1 from '../img/DnD-Engine 1.png';
import pump2 from '../img/DnD-Engine 1.png';
import pump3 from '../img/DnD-Engine 2.png';
import pump4 from '../img/DnD-Engine 3.png';
import pump5 from '../img/DnD-Engine 1.png';
import pump6 from '../img/DnD-Engine 2.png';
import pump7 from '../img/DnD-Engine 3.png';
import pump8 from '../img/DnD-Engine 1.png';
import pump9 from '../img/DnD-Engine 2.png';
import pump10 from '../img/DnD-Engine 3.png';
import pump11 from '../img/DnD-Engine 1.png';
import pump12 from '../img/DnD-Engine 2.png';

const Content = () => {
    const navigate = useNavigate(); // useNavigate untuk navigasi
    const chartsData = [
        { id: 1, title: 'KSB-Unit 67', image: pump1 },
        { id: 2, title: 'DnD-Engine', image: pump2 },
        { id: 3, title: 'DnD-Engine', image: pump3 },
        { id: 4, title: 'DnD-Engine', image: pump4 },
        { id: 5, title: 'DnD-Engine', image: pump5 },
        { id: 6, title: 'DnD-Engine', image: pump6 },
        { id: 7, title: 'DnD-Engine', image: pump7 },
        { id: 8, title: 'DnD-Engine', image: pump8 },
        { id: 9, title: 'DnD-Engine', image: pump9 },
        { id: 10, title: 'DnD-Engine', image: pump10 },
        { id: 11, title: 'DnD-Engine', image: pump11 },
        { id: 12, title: 'DnD-Engine', image: pump12 },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [inProp, setInProp] = useState(true);
    const [isZoomingIn, setIsZoomingIn] = useState(false); // Kontrol animasi zoom in

    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 5000); // Ganti gambar setiap 5 detik

        return () => clearInterval(interval); // Membersihkan interval saat komponen unmounted
    }, []);

    const handleNext = () => {
        setInProp(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % chartsData.length);
            setInProp(true);
        }, 300); // Delay for animation
    };

    const handlePrev = () => {
        setInProp(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + chartsData.length) % chartsData.length);
            setInProp(true);
        }, 300); // Delay for animation
    };

    const handleImageClick = (title) => {
        setIsZoomingIn(true); // Memulai animasi zoom in
        setTimeout(() => {
            navigate(`/unit/${title}`); // Navigasi setelah animasi selesai
        }, 500); // Delay 500ms, sesuaikan dengan durasi animasi
    };

    return (
        <Box sx={{ p: 2, backgroundColor: 'white', minHeight: '100vh' }}>
            <Grid container spacing={2} sx={{ mt: 3 }} justifyContent="center">
                <Grid item xs={12} sm={6} md={4}>
                    <Box
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative', // Membuat posisi tombol relatif terhadap gambar
                        }}
                    >
                        {/* Judul di bawah gambar */}
                        <Typography
                            variant="h4"
                            align="center"
                            paddingLeft={5}
                            sx={{
                                color: 'black',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Shadow untuk efek lebih menarik
                                mb: 0, // Mengurangi margin bawah untuk mendekatkan teks ke gambar
                                zIndex: 10, // Agar teks di atas tombol
                                '&:hover': {
                                    textDecoration: 'underline', // Menambahkan efek underline saat hover
                                },
                            }}
                        >
                            {chartsData[currentIndex].title}
                        </Typography>

                        <Box
                            sx={{
                                height: 800, // Ukuran gambar 2x lipat
                                width: 800, // Ukuran gambar 2x lipat
                                my: 2,
                                transition: 'transform 1s ease', // Animasi saat hover
                                transform: isZoomingIn ? 'scale(1.2)' : 'scale(1)', // Zoom in jika diklik
                                opacity: isZoomingIn ? 0 : 1, // Menghilang setelah zoom in
                                '&:hover': { transform: 'scale(1.1)' }, // Memperbesar gambar saat hover
                                cursor: 'pointer', // Mengubah kursor saat hover
                                transition: 'transform 0.5s, opacity 0.5s', // Animasi transisi zoom dan opacity
                            }}
                            onClick={() => handleImageClick(chartsData[currentIndex].title)} // Pindah halaman saat di-klik
                        >
                            <CSSTransition
                                in={inProp}
                                timeout={300}
                                classNames="fade"
                                unmountOnExit
                            >
                                <img
                                    src={chartsData[currentIndex].image}
                                    alt={chartsData[currentIndex].title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',  // Menggunakan 'contain' agar gambar tetap utuh tanpa cropping
                                    }}
                                />
                            </CSSTransition>
                        </Box>

                        {/* Tombol di samping gambar */}
                        <Button
                            variant="contained"
                            onClick={handlePrev}
                            sx={{
                                backgroundColor: 'transparent',
                                color: 'black',
                                fontSize: '8rem', // Ukuran tombol
                                position: 'absolute', // Menggunakan posisi absolute
                                left: '-30%', // Jarak 10% dari kiri
                                top: '50%', // Menempatkan tombol di tengah gambar
                                transform: 'translateY(-50%)', // Memastikan tombol berada tepat di tengah
                                opacity: 0.08, // Transparansi 70%
                                '&:hover': { backgroundColor: 'transparent' }, // Transparan saat hover
                                border: 'none', // Tidak ada border
                            }}
                        >
                            &#9664; {/* Ikon panah kiri */}
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{
                                backgroundColor: 'transparent',
                                color: 'black',
                                fontSize: '8rem', // Ukuran tombol
                                position: 'absolute', // Menggunakan posisi absolute
                                right: '-30%', // Jarak 10% dari kanan
                                top: '50%', // Menempatkan tombol di tengah gambar
                                transform: 'translateY(-50%)', // Memastikan tombol berada tepat di tengah
                                opacity: 0.08, // Transparansi 70%
                                '&:hover': { backgroundColor: 'transparent' }, // Transparan saat hover
                                border: 'none', // Tidak ada border
                            }}
                        >
                            &#9654; {/* Ikon panah kanan */}
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            {/* Animation CSS */}
            <style>
                {`
                    .fade-enter {
                        opacity: 0;
                    }
                    .fade-enter-active {
                        opacity: 1;
                        transition: opacity 300ms;
                    }
                    .fade-exit {
                        opacity: 1;
                    }
                    .fade-exit-active {
                        opacity: 0;
                        transition: opacity 300ms;
                    }
                `}
            </style>
        </Box>
    );
};

export default Content;
