import React, { useState, useEffect, useRef } from 'react';
import { Typography, Grid, Box, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSpring, animated } from 'react-spring';
import { fetchData } from './dataService';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Konfigurasi ikon default untuk marker di Leaflet
const defaultIcon = new L.Icon({
    iconUrl: '../img/marker-icon.png',
    shadowUrl: '../img/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const Content = () => {
    const navigate = useNavigate();
    const chartsData = [
        { id: 0, title: 'KSB 60', image: '/img/KSB64.webp' },
        { id: 1, title: 'KSB 64', image: '/img/KSB64.webp' },
        { id: 2, title: 'KSB 67', image: '/img/KSB67.webp' },
        { id: 3, title: 'KSB 72', image: '/img/KSBDoubleDrive.webp' },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomingIn, setIsZoomingIn] = useState(false);
    const [typedDetails, setTypedDetails] = useState([]);
    const [gpsData, setGpsData] = useState({ LAT: -2.0, LONG: 115.0 }); // Default koordinat jika data belum ada
    const imageRef = useRef(null);
    const [headerTitle, setHeaderTitle] = useState(''); // Judul awal kosong

    useEffect(() => {
        const unitId = chartsData[currentIndex]?.title;
        if (unitId) {
            fetchData(unitId).then((data) => {
                if (data.gpsData) {
                    setGpsData(data.gpsData); // Simpan GPS data ke state
                }
            }).catch(error => {
                console.error('Error fetching GPS data:', error);
            });
        }
    }, [currentIndex]); // Akan dipanggil setiap kali currentIndex berubah

    const fadeProps = useSpring({
        opacity: isZoomingIn ? 0 : 1,
        config: { duration: 300 },
    });

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % chartsData.length);
        }, 20000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setHeaderTitle(`Overview`); // Set judul berdasarkan unitId
        const details = unitDetails[chartsData[currentIndex].title] || [];
        let typedText = [];
        setTypedDetails([]);

        details.forEach((detail, i) => {
            setTimeout(() => {
                typedText = [...typedText, detail];
                setTypedDetails([...typedText]);
            }, i * 100);
        });
    }, [currentIndex]);

    const handleImageClick = (title) => {
        setIsZoomingIn(true);
        document.title = "KSB IoT";
        setTimeout(() => {
            if (title === 'KSB 72') {
                navigate(`/unit_DD/${title}`);
            } else {
                navigate(`/unit/${title}`);
            }
        }, 500);
    };

    const unitDetails = {
        'KSB 60': [
            { label: 'Unit Name', value: 'KSB 60' },
            { label: 'Type Pump', value: 'ISP-D200' },
            { label: 'Customer', value: '-' },
            { label: 'Duty Flow', value: '800 m3/h' },
            { label: 'Duty Head', value: '160 m' },
            { label: 'Speed', value: '1550 RPM' },
            { label: 'Position', value: gpsData.LAT + ', ' + gpsData.LONG },
        ],
        'KSB 64': [
            { label: 'Unit Name', value: 'KSB 64' },
            { label: 'Type Pump', value: 'ISP-D200' },
            { label: 'Customer', value: 'PT TRB (Tanjung Raya Bersama)' },
            { label: 'Duty Flow', value: '800 m3/h' },
            { label: 'Duty Head', value: '160 m' },
            { label: 'Speed', value: '1500 RPM' },
            { label: 'Position', value: gpsData.LAT + ', ' + gpsData.LONG },
        ],
        'KSB 67': [
            { label: 'Unit Name', value: 'KSB 67' },
            { label: 'Type Pump', value: 'ISP-D150' },
            { label: 'Customer', value: 'PT Adaro Tirta Sarana (Sera)' },
            { label: 'Duty Flow', value: '600 m3/h' },
            { label: 'Duty Head', value: '165.24 m' },
            { label: 'Speed', value: '1450 RPM' },
            { label: 'Position', value: gpsData.LAT + ', ' + gpsData.LONG },
        ],
        'KSB 72': [
            { label: 'Unit Name', value: 'KSB 72 Double Drive' },
            { label: 'Type Pump', value: 'ISP-D150 U2H' },
            { label: 'Customer', value: 'PT. Thriveni Indomining' },
            { label: 'Duty Flow', value: '600 m3/h' },
            { label: 'Duty Head', value: '250 m' },
            { label: 'Speed', value: '1560 RPM' },
            { label: 'Position', value: gpsData.LAT + ', ' + gpsData.LONG },
        ],
    };

    return (
        <Box sx={{ p: 2, backgroundColor: 'white', minHeight: '100vh', position: 'relative' }}>

            {/* Menampilkan Judul Unit di Header */}
            {headerTitle && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0, // Posisikan di atas
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center', // Menyejajarkan teks ke tengah
                        padding: '20px', // Padding yang lebih besar
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '1.6rem', // Ukuran font lebih besar
                            fontWeight: 'bold', // Bold teks
                            color: '#fff', // Warna putih
                            lineHeight: 1.2, // Mengontrol jarak antar baris
                            wordBreak: 'break-word', // Memastikan teks besar tidak melanggar container
                        }}
                    >
                        {headerTitle}
                    </Typography>
                </Box>
            )}

            {/* Left Overlay - List of Units */}
            <Box
                sx={{
                    position: 'fixed',
                    left: 30,
                    top: 80,
                    width: '250px',
                    height: 'calc(100vh - 110px)', // Memberikan margin bawah 30px
                    background: 'linear-gradient(180deg, rgba(51, 102, 153, 0.7) 30%, rgba(0, 32, 64, 0.7) 70%)',
                    overflowY: 'auto',
                    padding: '5px',
                    color: 'white', // Mengatur warna teks menjadi biru tua
                    borderRadius: '5px',
                    marginBottom: '30px', // Menambahkan margin bawah
                }}
            >
                {/* Header Box */}
                <Box
                    sx={{
                        background: 'linear-gradient(180deg, rgba(51, 102, 153, 1) 30%, rgba(0, 32, 64, 1) 70%)',
                        padding: '5px',
                        borderRadius: '5px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: 'white', // Mengatur warna teks menjadi biru tua
                        marginBottom: '5px', // Menambahkan margin bawah
                    }}
                >
                    Unit List
                </Box>


                {/* List Unit */}
                <Box sx={{ padding: '5px' }}>
                    {chartsData.map((unit, index) => (
                        <Box
                            key={unit.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '5px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                color: 'white',
                                backgroundColor: currentIndex === index ? 'rgba(255,255,255,0.2)' : 'transparent',
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                                marginBottom: '1px',
                            }}
                            onClick={() => setCurrentIndex(index)}
                        >
                            <Typography
                                sx={{
                                    fontSize: '14px',
                                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' // Efek shadow pada teks
                                }}
                            >
                                {unit.title}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>


            {/* Right Overlay - Unit Information */}
            <Box
                sx={{
                    position: 'fixed',
                    right: 30,
                    top: 80,
                    width: '600px',
                    height: '320px',
                    background: 'linear-gradient(180deg, rgba(51, 102, 153, 0.7) 30%, rgba(0, 32, 64, 0.7) 70%)',
                    overflowY: 'auto',
                    padding: '10px',
                    color: 'white',
                    borderRadius: '5px',
                }}
            >
                <Box
                    sx={{
                        background: 'linear-gradient(180deg, rgba(51, 102, 153, 1) 30%, rgba(0, 32, 64, 1) 70%)',
                        padding: '10px',
                        borderRadius: '5px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: 'white',
                        marginBottom: '10px',
                    }}
                >
                    Unit Information
                </Box>
                <Table size="small" sx={{ backgroundColor: 'rgba(255,255,255, 1)', color: 'black', borderRadius: '5px', border: '1px solid black' }}>
                    <TableBody>
                        {typedDetails.map((detail, index) => (
                            <TableRow key={index} sx={{ borderBottom: '1px solid black' }}>
                                <TableCell sx={{ fontWeight: 'bold', textAlign: 'left', borderBottom: '1px solid black' }}>
                                    {detail.label}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'left', borderBottom: '1px solid black' }}>
                                    {detail.value}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            {/* Right Overlay - Unit Location */}
            <Box
                sx={{
                    position: 'fixed',
                    right: 30,
                    top: 420,
                    width: '600px',
                    height: '450px',
                    background: 'linear-gradient(180deg, rgba(51, 102, 153, 0.7) 30%, rgba(0, 32, 64, 0.7) 70%)',
                    overflowY: 'auto',
                    padding: '10px',
                    color: 'white',
                    borderRadius: '5px',
                }}
            >
                <Box
                    sx={{
                        background: 'linear-gradient(180deg, rgba(51, 102, 153, 1) 30%, rgba(0, 32, 64, 1) 70%)',
                        padding: '10px',
                        borderRadius: '5px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: 'white',
                        marginBottom: '10px',
                    }}
                >
                    Unit Location
                </Box>
                {/* Menampilkan Peta */}
                <Grid item xs={12} sm={12} md={4} lg={4}>
                    <Box
                        sx={{
                            height: '370px',
                            backgroundColor: 'white',
                            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                            borderRadius: '10px',
                            margin: '5px',
                            overflow: 'hidden',
                            padding: '10px',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                height: '350px',
                                width: '100%',
                                border: '2px solid #4A90E2',
                                borderRadius: '10px',
                                overflow: 'hidden',
                            }}
                        >
                            <MapContainer
                                center={[gpsData.LAT, gpsData.LONG]}
                                zoom={5}
                                style={{ width: '100%', height: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />

                                {/* Marker dengan koordinat dari gpsData */}
                                <Marker position={[gpsData.LAT, gpsData.LONG]} icon={defaultIcon}>
                                    <Popup>
                                        Location : {gpsData.LAT}, {gpsData.LONG}
                                    </Popup>
                                </Marker>

                                {/* Circle effect around the marker */}
                                <Circle
                                    center={[gpsData.LAT, gpsData.LONG]}
                                    radius={200} // Radius dalam meter
                                    pathOptions={{
                                        color: 'red',
                                        weight: 1,
                                        fillColor: 'red',
                                        fillOpacity: 0.1, // Transparansi 10%
                                    }}
                                />
                            </MapContainer>
                        </Box>
                    </Box>
                </Grid>
            </Box>

            {/* Right Overlay - Unit Status */}
            <Box
                sx={{
                    position: 'fixed',
                    right: 30,
                    bottom: 30,
                    width: '1590px',
                    height: '160px',
                    background: 'linear-gradient(180deg, rgba(51, 102, 153, 0.7) 30%, rgba(0, 32, 64, 0.7) 70%)',
                    overflowY: 'auto',
                    padding: '10px',
                    color: 'white',
                    borderRadius: '5px',
                }}
            >
                <Box
                    sx={{
                        background: 'linear-gradient(180deg, rgba(51, 102, 153, 1) 30%, rgba(0, 32, 64, 1) 70%)',
                        padding: '10px',
                        borderRadius: '5px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: 'white',
                        marginBottom: '10px',
                    }}
                >
                    Unit Status
                </Box>
            </Box>

            {/* Centered Content */}
            <Grid container spacing={2} sx={{ mt: 3 }} justifyContent="center">
                <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box
                            sx={{
                                height: 900,
                                width: 900,
                                my: 2,
                                ml: -45,
                                position: 'relative',
                                transition: 'transform 0.5s ease, opacity 0.5s ease',
                                transform: isZoomingIn ? 'scale(1.2)' : 'scale(1)',
                                opacity: isZoomingIn ? 0 : 1,
                                cursor: 'pointer',
                                zIndex: 1,
                            }}
                        >
                            <animated.div style={fadeProps}>
                                <img
                                    ref={imageRef}
                                    src={chartsData[currentIndex].image}
                                    alt={chartsData[currentIndex].title}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    onClick={() => handleImageClick(chartsData[currentIndex].title)} // Move the click handler here
                                />
                            </animated.div>

                            {/* Overlay teks "Click to redirect" */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '60%', // Posisikan di tengah
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)', // Pastikan tetap terpusat
                                    marginTop: '100px', // Geser teks ke bawah sekitar 100px dari tengah gambar
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    padding: '5px 10px',
                                    borderRadius: '5px',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    zIndex: 2, // Pastikan teks berada di atas gambar
                                }}
                            >
                                Click Image to Redirect
                            </Box>

                        </Box>
                    </Box>
                </Grid>
            </Grid>

        </Box>
    );
};

export default Content;
