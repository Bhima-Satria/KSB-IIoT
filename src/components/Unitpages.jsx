import React, { useEffect, useState } from 'react';
import { Grid, Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { fetchData } from './dataService';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, Button } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import annotationPlugin from 'chartjs-plugin-annotation';

// Daftarkan plugin
ChartJS.register(annotationPlugin);

// Import images according to unitId
const marker_icon = '../img/marker-icon.png'; // Ganti dengan path gambar marker
const marker_shadow = '../img/marker-shadow.png'; // Ganti dengan path gambar shadow

// Register the required components for Chart.js
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

// Default marker icon with local backup
const defaultIcon = new L.Icon({
    iconUrl: marker_icon, // Local marker icon URL
    iconSize: [25, 41], // Size of the marker icon
    iconAnchor: [12, 41], // Where the icon is anchored
    popupAnchor: [1, -34], // Position of popup relative to marker
    shadowUrl: marker_shadow, // Local shadow URL
    shadowSize: [41, 41],  // Size of shadow
    shadowAnchor: [12, 41], // Where the shadow is anchored
});

// Komponen Bubble untuk menampilkan data (Atur agar menyesuaikan layar)
const Bubble = ({ title, value, unit, Icon }) => {
    return (
        <Box
            sx={{
                width: { xs: '100%', sm: '200px' }, // Lebar responsif
                height: 'auto',
                backgroundColor: '#336699', // Warna latar utama
                borderRadius: '12px', // Membuat ujung bulat
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)', // Bayangan lembut
                padding: '10px',
                transition: 'all 0.3s ease', // Transisi halus untuk hover
                '&:hover': {
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)', // Menambah bayangan saat hover
                    transform: 'translateY(-4px)', // Mengangkat sedikit saat hover
                    backgroundColor: '#FF9E33', // Mengubah warna latar saat hover
                },
            }}
        >
            <Icon sx={{ fontSize: '20px', color: 'white', boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)' }} />
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                {title}
            </Typography>
            <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
                {value} {unit}
            </Typography>
        </Box>
    );
};

const Alarm = ({ title, coilValue }) => {
    const isWarning = coilValue === 1; // Check if the coil value indicates a warning
    const iconBackgroundColor = isWarning ? '#FF0000' : '#008000'; // Red for warning, green for normal
    const [blinkStyle, setBlinkStyle] = useState({ opacity: 1 }); // State for blinking effect
    const [showPopup, setShowPopup] = useState(false); // State for popup visibility
    const [blinkTextStyle, setBlinkTextStyle] = useState({ opacity: 1 }); // State for blinking text effect

    useEffect(() => {
        let blinkInterval;
        if (isWarning) {
            blinkInterval = setInterval(() => {
                setBlinkStyle((prevStyle) => ({
                    opacity: prevStyle.opacity === 1 ? 0 : 1, // Toggle opacity for blinking icon
                }));
            }, 300); // Blinking every 300ms

            setShowPopup(true); // Show popup when warning occurs
        } else {
            setBlinkStyle({ opacity: 1 }); // Reset icon opacity
            setShowPopup(false); // Hide popup when no warning
        }

        return () => clearInterval(blinkInterval); // Cleanup on unmount
    }, [isWarning]);

    useEffect(() => {
        let blinkTextInterval;
        if (isWarning && showPopup) {
            blinkTextInterval = setInterval(() => {
                setBlinkTextStyle((prevStyle) => ({
                    opacity: prevStyle.opacity === 1 ? 0 : 1, // Toggle opacity for blinking text
                }));
            }, 500); // Blinking text every 1 second
        }

        return () => clearInterval(blinkTextInterval); // Cleanup on unmount
    }, [isWarning, showPopup]);

    useEffect(() => {
        let timeout;
        if (isWarning && !showPopup) {
            timeout = setTimeout(() => {
                setShowPopup(true); // Re-show popup after 5 minutes if warning persists
            }, 3 * 60 * 1000); // 5 minutes
        }

        return () => clearTimeout(timeout); // Cleanup timeout on unmount or state change
    }, [isWarning, showPopup]);

    const Icon = isWarning ? Icons.WarningAmberOutlined : Icons.GppGoodOutlined; // Select icon based on warning

    return (
        <Box
            sx={{
                width: { xs: '100%', sm: '200px' },  // Responsive width for small and large screens
                height: { xs: '20px', sm: '50px' }, // Responsive height for small and large screens
                backgroundColor: '#F5F5F5',
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                alignItems: 'center',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.3)',
                padding: { xs: '4px', sm: '0px' }, // Adjust padding based on screen size
                marginBottom: 3,
                border: '1px solid #DDDDDD',
            }}
        >
            {/* Icon box */}
            <Box
                sx={{
                    backgroundColor: iconBackgroundColor, // Red for warning, green for normal
                    borderRadius: '5px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: { xs: '20px', sm: '50px' },  // Responsive width for icon box
                    height: { xs: '20px', sm: '50px' }, // Responsive height for icon box
                    marginRight: '10px',
                    padding: { xs: '5px', sm: '0' }, // Adjust padding based on screen size
                }}
            >
                <Icon sx={{
                    fontSize: { xs: '10px', sm: '40px' },  // Responsive icon size
                    color: 'white',
                    ...blinkStyle,
                }} />
            </Box>

            {/* Text box */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                marginLeft: { xs: '10px', sm: '0px' }, // Adjust text margin for smaller screens
            }}>
                <Typography variant="body1" sx={{
                    fontWeight: 'bold',
                    color: 'black',
                    fontSize: { xs: '14px', sm: '16px' },  // Responsive font size
                }}>
                    {title}
                </Typography>
            </Box>

            {/* Error Popup */}
            <Modal
                open={showPopup}
                onClose={() => setShowPopup(false)} // Close popup on user action
                aria-labelledby="error-modal-title"
                aria-describedby="error-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: 300, sm: 400 },
                        bgcolor: 'white',
                        border: '2px solid #000',
                        boxShadow: 24,
                        borderRadius: 2,
                        p: 3,
                    }}
                >
                    <Typography
                        id="error-modal-title"
                        variant="h4"
                        sx={{
                            color: '#FF0000',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            mb: 2,
                            ...blinkTextStyle, // Apply blinking text effect
                        }}
                    >
                        Warning!
                    </Typography>
                    <Typography
                        id="error-modal-description"
                        sx={{ color: 'black', mb: 3, textAlign: 'center' }}
                    >
                        {title} requires immediate attention!
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            onClick={() => setShowPopup(false)} // Close button
                            sx={{
                                bgcolor: '#FF0000',
                                color: 'white',
                                '&:hover': { bgcolor: '#cc0000' },
                            }}
                        >
                            OK
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

const Vacuum = ({ title, coilValue }) => {
    const isWarning = coilValue === 1; // Check if the coil value indicates a warning
    const iconBackgroundColor = isWarning ? '#008000' : '#FF0000'; // Red for warning, green for normal

    const Icon = isWarning ? Icons.PowerSettingsNewOutlined : Icons.PowerSettingsNewOutlined; // Select icon based on warning

    return (
        <Box
            sx={{
                width: { xs: '100%', sm: '200px' },  // Responsif width for small and large screens
                height: { xs: '20px', sm: '50px' }, // Responsif height for small and large screens
                backgroundColor: '#F5F5F5',
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                alignItems: 'center',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.3)',
                padding: { xs: '4px', sm: '0px' }, // Adjust padding based on screen size
                marginBottom: 3,
                border: '1px solid #DDDDDD',
            }}
        >
            {/* Icon box */}
            <Box
                sx={{
                    backgroundColor: iconBackgroundColor, // Red for warning, green for normal
                    borderRadius: '5px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: { xs: '20px', sm: '50px' },  // Responsif width for icon box
                    height: { xs: '20px', sm: '50px' }, // Responsif height for icon box
                    marginRight: '10px',
                    padding: { xs: '5px', sm: '0' }, // Adjust padding based on screen size
                }}
            >
                <Icon sx={{
                    fontSize: { xs: '10px', sm: '40px' },  // Responsif icon size
                    color: 'white',
                }} />
            </Box>

            {/* Text box */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                marginLeft: { xs: '10px', sm: '0px' }, // Adjust text margin for smaller screens
            }}>
                <Typography variant="body1" sx={{
                    fontWeight: 'bold',
                    color: 'black',
                    fontSize: { xs: '14px', sm: '16px' },  // Responsif font size
                }}>
                    {title}
                </Typography>
            </Box>
        </Box>
    );
};

const LevelSensor = ({ title, coilValue }) => {
    const isWarning = coilValue === 1; // Check if the coil value indicates a warning
    const iconBackgroundColor = isWarning ? '#008000' : '#FF0000'; // Red for warning, green for normal

    const Icon = isWarning ? Icons.Opacity : Icons.Opacity; // Select icon based on warning

    return (
        <Box
            sx={{
                width: { xs: '100%', sm: '200px' },  // Responsif width for small and large screens
                height: { xs: '20px', sm: '50px' }, // Responsif height for small and large screens
                backgroundColor: '#F5F5F5',
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                alignItems: 'center',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.3)',
                padding: { xs: '4px', sm: '0px' }, // Adjust padding based on screen size
                marginBottom: 3,
                border: '1px solid #DDDDDD',
            }}
        >
            {/* Icon box */}
            <Box
                sx={{
                    backgroundColor: iconBackgroundColor, // Red for warning, green for normal
                    borderRadius: '5px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: { xs: '20px', sm: '50px' },  // Responsif width for icon box
                    height: { xs: '20px', sm: '50px' }, // Responsif height for icon box
                    marginRight: '10px',
                    padding: { xs: '5px', sm: '0' }, // Adjust padding based on screen size
                }}
            >
                <Icon sx={{
                    fontSize: { xs: '10px', sm: '40px' },  // Responsif icon size
                    color: 'white',
                }} />
            </Box>

            {/* Text box */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                marginLeft: { xs: '10px', sm: '0px' }, // Adjust text margin for smaller screens
            }}>
                <Typography variant="body1" sx={{
                    fontWeight: 'bold',
                    color: 'black',
                    fontSize: { xs: '14px', sm: '16px' },  // Responsif font size
                }}>
                    {title}
                </Typography>
            </Box>
        </Box>
    );
};

const DataCard = ({ title, value, unit, Icon, Duty }) => {
    return (
        <Card sx={{
            backgroundColor: 'white',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            padding: { xs: 1, sm: 2 }, // Padding responsif
            margin: 1,
            flex: 1,
            minWidth: { xs: '120px', sm: '200px' },
            maxWidth: '100%', // Membatasi lebar maksimal
        }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                        {title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                        {value} {unit}
                    </Typography>
                </Box>
                <Box sx={{
                    width: { xs: '50px', sm: '80px' }, // Responsif lebar ikon
                    height: { xs: '50px', sm: '80px' }, // Responsif tinggi ikon
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 2
                }}>
                    <Icon sx={{
                        fontSize: { xs: '40px', sm: '70px' }, // Responsif ukuran ikon
                        color: '#FF8A00',
                    }} />
                </Box>
            </CardContent>
            <Box sx={{
                borderTop: '1px solid #e0e0e0', width: '100%',
                textAlign: 'center', marginTop: 1, display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
                padding: { xs: '0.5rem', sm: '1rem' }, // Responsif padding bawah
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                        {Duty}
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};

const CardStatus = ({ title, value, lastUpdatedDate }) => {
    // Menentukan status berdasarkan value
    const isOn = value >= 1;

    // State untuk mengatur blinking pada ikon
    const [isBlinking, setIsBlinking] = useState(false);
    const [blinkStyle, setBlinkStyle] = useState({}); // State untuk gaya blinking

    useEffect(() => {
        if (isOn) {
            setIsBlinking(true);
            const interval = setInterval(() => {
                setBlinkStyle((prevStyle) => ({
                    opacity: prevStyle.opacity === 1 ? 0 : 1,
                }));
            }, 500); // Interval blinking 500ms

            return () => clearInterval(interval); // Membersihkan interval saat komponen di-unmount
        } else {
            setIsBlinking(false);
            setBlinkStyle({ opacity: 1 }); // Set opacity ke 1 saat off
        }
    }, [isOn]);

    // Memilih ikon berdasarkan status
    const statusIcon = isOn ? (
        <Icons.PowerSettingsNew sx={{
            color: '#4CAF50',
            fontSize: { xs: '50px', sm: '70px', md: '100px' }, // Ukuran responsif
            opacity: blinkStyle.opacity,
        }} />
    ) : (
        <Icons.PowerSettingsNew sx={{
            color: '#FF0000',
            fontSize: { xs: '50px', sm: '70px', md: '100px' }, // Ukuran responsif
        }} />
    );

    const statusText = isOn ? 'Running' : 'Stop';

    return (
        <Card sx={{
            backgroundColor: 'white',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            padding: { xs: 1, sm: 2 }, // Padding responsif
            margin: 1,
            flex: 1,
            minWidth: { xs: '120px', sm: '200px' },
            maxWidth: '100%', // Membatasi lebar maksimal agar sesuai dengan layar
        }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                        {title}
                    </Typography>
                    <Typography variant="h5" sx={{
                        fontWeight: 'bold',
                        fontSize: { xs: '1rem', sm: '1.5rem' }, // Ukuran teks responsif
                    }}>
                        {statusText}
                    </Typography>
                </Box>
                <Box sx={{
                    width: { xs: '40px', sm: '80px' },
                    height: { xs: '40px', sm: '80px' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 2
                }}>
                    <Box sx={{
                        width: { xs: '60px', sm: '80px', md: '100px' },
                        height: { xs: '60px', sm: '80px', md: '100px' },
                        borderRadius: '50%',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {statusIcon}
                    </Box>
                </Box>
            </CardContent>
            <Box sx={{
                borderTop: '1px solid #e0e0e0', width: '100%',
                textAlign: 'center', marginTop: 1, display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
                padding: 1
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                        Latest Online: {lastUpdatedDate}
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};


const UnitPage = () => {
    const { unitId } = useParams(); // Mendapatkan unitId dari params URL
    const [cardData, setCardData] = useState([]); // Menyimpan data untuk ditampilkan di UI
    const [cardDataCoil, setCardDataCoil] = useState([]); // Menyimpan data coil untuk ditampilkan di UI
    const [gpsData, setGpsData] = useState([]); // Menyimpan data GPS
    const [loading, setLoading] = useState(true); // Loading state
    const [lastUpdated, setLastUpdated] = useState(null); // Waktu terakhir data diperbarui
    const [isDataEmpty, setIsDataEmpty] = useState(false); // Status apakah data kosong
    const [parsedDate, setParsedDate] = useState(''); // Waktu terformat
    const [currentSlide, setCurrentSlide] = useState(0); // Slide yang aktif untuk slideshow
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Indeks gambar aktif
    const [fade, setFade] = useState(true); // State untuk transisi gambar
    const [headerTitle, setHeaderTitle] = useState(''); // Judul awal kosong



    const [chartData, setChartData] = useState({
        labels: [], // Menyimpan waktu dalam detik (atau format lain)
        datasets: [
            {
                label: 'Flow/Head',
                data: [], // Menyimpan data Flow dan Duty Head
                borderColor: 'rgba(255,0,0,1)',
                fill: false,
                pointRadius: 5, // Radius titik pada grafik
            },

        ],
    });

    const addData = (data) => {
        // Tambahkan data baru dengan efek blinking
        setChartData((prevState) => ({
            ...prevState,
            datasets: prevState.datasets.map((dataset, index) => {
                if (index === 0) {
                    return {
                        ...dataset,
                        data: [{ x: data.flow, y: data.head }], // Ganti data lama dengan data baru
                        pointBackgroundColor: 'green', // Warna titik untuk blinking
                        pointBorderColor: 'green',
                        pointRadius: 8, // Ukuran titik untuk efek blinking
                    };
                }
                return dataset;
            }),
        }));

        // Kembalikan ke tampilan normal setelah 500ms
        setTimeout(() => {
            setChartData((prevState) => ({
                ...prevState,
                datasets: prevState.datasets.map((dataset, index) => {
                    if (index === 0) {
                        return {
                            ...dataset,
                            pointBackgroundColor: 'rgba(255,0,0,1)', // Warna asli titik
                            pointBorderColor: 'rgba(255,0,0,1)',
                            pointRadius: 5, // Ukuran asli titik
                        };
                    }
                    return dataset;
                }),
            }));
        }, 500); // Durasi blinking dalam milidetik
    };




    const parseDateUTC = (dateString) => {
        try {
            const [datePart, timePart] = dateString.split(" ");
            const [day, month, year] = datePart.split("/").map(Number);
            const [hour, minute, second] = timePart.split(":").map(Number);

            const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
            const localDate = utcDate.toLocaleString("en-GB", {
                timeZoneName: "short",
                hour12: false,
            });

            return localDate;
        } catch (error) {
            console.error("Error parsing date:", error);
            return dateString;
        }
    };

    const slideData = [
        {
            title: "Flow",
            value: cardData[0]?.FLOW.toFixed(0),
            unit: "m3/h",
            Icon: Icons.Water,
            Duty: "Duty Flow: 600 m3/h"
        },
        {
            title: "Total Flow",
            value: cardData[0]?.FLOW_TOTAL.toFixed(0),
            unit: "m3",
            Icon: Icons.Water,
            Duty: "-"
        },
        {
            title: "Discharge Pressure",
            value: cardData[0]?.DISCHARGE_PRESSURE.toFixed(2),
            unit: "Bar",
            Icon: Icons.Commit,
            Duty: "Duty Pressure: 16.2 Bar"
        },
        {
            title: "Engine Speed",
            value: cardData[0]?.ENGINE_SPEED.toFixed(0),
            unit: "RPM",
            Icon: Icons.Speed,
            Duty: "Duty Speed: 1450 RPM"
        },
        {
            title: "Engine Load",
            value: cardData[0]?.ENGINE_LOAD.toFixed(0),
            unit: "%",
            Icon: Icons.ElectricCar,
            Duty: "Duty Engine: 80%"
        },
        {
            title: "Pump DE Temp",
            value: cardData[0]?.PUMP_DE_TEMP.toFixed(2),
            unit: "°C",
            Icon: Icons.Thermostat,
            Duty: "Temp Duty: 90°C"
        },
        {
            title: "Pump NDE Temp",
            value: cardData[0]?.PUMP_NDE_TEMP.toFixed(2),
            unit: "°C",
            Icon: Icons.Thermostat,
            Duty: "Temp Duty: 90°C"
        },
        {
            title: "Engine Run Hour",
            value: cardData[0]?.ENGINE_RUN_HOUR.toFixed(2),
            unit: "Hours",
            Icon: Icons.ManageHistory,
            Duty: "-"
        },
        {
            title: "Fuel Rate",
            value: cardData[0]?.ENGINE_FUEL_CONSUMPTIONS.toFixed(1),
            unit: "L/h",
            Icon: Icons.LocalGasStation,
            Duty: "Duty Fuel: 100 L/h"
        },
        {
            title: "Pump DE Vib Y",
            value: cardData[0]?.PUMP_DE_VIB_Y.toFixed(2),
            unit: "mm/s",
            Icon: Icons.Sensors,
            Duty: "Duty Vib: - mm/s"
        },
        {
            title: "Pump NDE Vib X1",
            value: cardData[0]?.PUMP_NDE_VIB_X1.toFixed(2),
            unit: "mm/s",
            Icon: Icons.Sensors,
            Duty: "Duty Vib: - mm/s"
        },
        {
            title: "Pump NDE Vib X2",
            value: cardData[0]?.PUMP_NDE_VIB_X2.toFixed(1),
            unit: "mm/s",
            Icon: Icons.Sensors,
            Duty: "Duty Vib: - mm/s"
        }
    ];

    const groupedCards = [];
    for (let i = 0; i < slideData.length; i += 4) {
        groupedCards.push(slideData.slice(i, i + 4));
    }

    // Fungsi untuk menghasilkan path gambar berdasarkan unitId dan jumlah gambar
    const loadImagesByUnit = (unitId, imageCount) => {
        const imagePaths = [];
        for (let i = 1; i <= imageCount; i++) {
            imagePaths.push(`/img/${unitId}/image${i}.webp`);
        }
        return imagePaths;
    };

    useEffect(() => {
        if (!unitId) return;
        setHeaderTitle(`${unitId}`); // Set judul berdasarkan unitId
        const fetchInterval = setInterval(async () => {
            await getData();
        }, 1000); // Interval untuk getData setiap 1 detik

        const sliderInterval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % groupedCards.length);
        }, 10000); // Interval untuk slider setiap 10 detik

        // Mengubah gambar setiap 3 detik (3000 ms)
        const interval = setInterval(() => {
            setFade(false); // Mengatur opacity ke 0 sebelum berganti gambar
            setTimeout(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
                setFade(true); // Mengatur opacity kembali ke 1 setelah gambar berganti
            }, 500); // Waktu untuk efek transisi
        }, 3000); // Ganti gambar setiap 3 detik

        const getData = async () => {
            try {
                const response = await fetchData(unitId);
                console.log(response);
                console.log(unitId);

                const data = response.realTimeData;
                const dataCoil = response.coilData;
                const dataGPS = response.gpsData;

                if (!data) {
                    setIsDataEmpty(true);
                } else {
                    setIsDataEmpty(false);
                    setCardData([data]);
                    setCardDataCoil([dataCoil]);
                    setGpsData([dataGPS]);
                    setLastUpdated(response.date);

                    const dateObj = parseDateUTC(response.date);
                    setParsedDate(dateObj);

                    // Kirim data ke `addData` untuk memperbarui grafik
                    addData({
                        time: dateObj.split(' ')[1], // Waktu diambil dari respons
                        flow: parseFloat(data.FLOW.toFixed(2)), // Nilai flow
                        head: parseFloat((data.DISCHARGE_PRESSURE * 10.2).toFixed(0)), // Nilai head
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsDataEmpty(true);
            } finally {
                setLoading(false);
            }
        };

        getData(); // Ambil data segera saat pertama kali

        return () => {
            clearInterval(fetchInterval);
            clearInterval(sliderInterval);
            clearInterval(interval);
        };
    }, [unitId, groupedCards.length]);

    // Mendapatkan gambar berdasarkan unitId dan jumlah gambar
    const images = loadImagesByUnit(unitId, 3); // Misalnya, ada 5 gambar

    const displayedCards = groupedCards[currentSlide];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            {isDataEmpty ? (
                <Box sx={{
                    textAlign: 'center',
                    mt: 2,
                    paddingLeft: { xs: 5 },
                }}>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                        Data kosong atau tidak tersedia
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <CircularProgress />
                    </Box>
                </Box>
            ) : (
                <Grid container spacing={2} justifyContent="center" direction="row">

                    {/* Kolom untuk Card Status */}
                    <Grid item xs={12}>
                        <Box sx={{
                            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'
                        }}>
                            {cardDataCoil.map((data, index) => (
                                <CardStatus
                                    key={index}
                                    title="Unit Status"
                                    value={data.ENGINE_RUN}
                                    lastUpdatedDate={parsedDate}
                                />
                            ))}
                            {displayedCards.map((data, index) => (
                                <DataCard
                                    key={`${data.title}-${index}`}
                                    title={data.title}
                                    value={data.value}
                                    unit={data.unit}
                                    Icon={data.Icon}
                                    Duty={data.Duty}
                                />
                            ))}
                        </Box>
                    </Grid>

                    {/* Menampilkan Judul Unit di Header */}
                    {headerTitle && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontWeight: 'bold',
                            color: '#fff',
                            textAlign: 'center', // Menyejajarkan teks ke tengah
                            fontSize: '7rem', // Ukuran font lebih besar
                            padding: '20px', // Padding yang lebih besar
                        }}>
                            <Typography><strong>{headerTitle}</strong></Typography>
                        </Box>
                    )}


                    <Grid container spacing={0} sx={{ padding: '20px' }}>
                        {/* Kolom untuk gambar */}
                        {window.innerWidth >= 600 && (
                            <Grid item xs={12} sm={12} md={4} lg={4}>
                                <Box sx={{
                                    height: '400px',
                                    backgroundColor: 'white',
                                    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                    borderRadius: '30px',
                                    margin: '5px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Typography
                                            variant="h6"
                                            color="textSecondary"
                                            sx={{
                                                fontSize: '1.3rem',
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                                            }}
                                        >
                                            {unitId}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        width: '100%',
                                        padding: '10px',
                                        marginBottom: '20px',
                                        height: 'auto',
                                        maxWidth: '100%',
                                    }}>
                                        <img
                                            src={images[currentImageIndex]}
                                            alt="Unit Visual"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                maxWidth: '610px',
                                                borderRadius: '10px',
                                                opacity: fade ? 1 : 0, // Atur opacity untuk efek transisi
                                                transition: 'opacity 0.5s ease-in-out', // Efek transisi opacity
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                        )}


                        {/* Kolom untuk Detail Informasi */}
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Box
                                sx={{
                                    height: '400px',
                                    backgroundColor: 'white',
                                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
                                    borderRadius: '30px',
                                    margin: '5px',
                                    padding: '20px', // Tambahkan padding untuk estetika
                                }}
                            >
                                {/* Tabel Detail Unit */}
                                <TableContainer
                                    component={Paper}
                                    sx={{
                                        maxHeight: '360px',
                                        overflowY: 'scroll', // Biarkan scroll untuk Y
                                        '&::-webkit-scrollbar': {
                                            display: 'none', // Menyembunyikan scrollbar di WebKit browsers (Chrome, Safari)
                                        },
                                        '&': {
                                            scrollbarWidth: 'none', // Menyembunyikan scrollbar di Firefox
                                        },
                                    }}
                                >
                                    <Table stickyHeader aria-label="detail unit table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell
                                                    colSpan={2}
                                                    sx={{
                                                        backgroundColor: '#336699',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        textAlign: 'center',
                                                        fontSize: '1.3rem', // Atur ukuran font lebih besar
                                                        padding: '8px', // Mengurangi padding di header
                                                    }}
                                                >
                                                    <strong>Unit Information</strong>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(() => {
                                                // Tentukan data berdasarkan unitId
                                                const unitDetails =
                                                    unitId === 'KSB 67'
                                                        ? [
                                                            { label: 'Unit Name', value: 'KSB 67' },
                                                            { label: 'Type Pump', value: 'ISP-D150' },
                                                            { label: 'Customer', value: 'PT Adaro Tirta Sarana (Sera)' },
                                                            { label: 'Duty Flow', value: '600 m3/h' },
                                                            { label: 'Duty Head', value: '165.24 m' },
                                                            { label: 'Speed', value: '1450 RPM' },
                                                        ]
                                                        : unitId === 'KSB 64'
                                                            ? [
                                                                { label: 'Unit Name', value: 'KSB 64' },
                                                                { label: 'Type Pump', value: 'ISP-D200' },
                                                                { label: 'Customer', value: 'PT TRB (Tanjung Raya Bersama)' },
                                                                { label: 'Duty Flow', value: '800 m3/h' },
                                                                { label: 'Duty Head', value: '160 m' },
                                                                { label: 'Speed', value: '1500 RPM' },
                                                            ]
                                                            : []; // Default kosong jika unitId tidak sesuai

                                                return unitDetails.map(({ label, value }, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell sx={{ padding: '13px', fontSize: '1.1rem' }}>{label}</TableCell>
                                                        <TableCell sx={{ padding: '13px', fontSize: '1.1rem' }}>{value}</TableCell>
                                                    </TableRow>
                                                ));
                                            })()}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Grid>




                        {/* Kolom untuk Data Instruments */}
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Box
                                sx={{
                                    height: '400px',
                                    backgroundColor: 'white',
                                    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                    borderRadius: '30px',
                                    margin: '5px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    overflow: 'auto',
                                    padding: '10px',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{
                                        fontSize: '1.3rem',  // Adjust font size as needed
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                                        marginBottom: '10px'  // Add margin below the title
                                    }}
                                >
                                    Data Instruments {unitId}
                                </Typography>

                                <Grid container spacing={1} justifyContent="center">
                                    {cardData.map((data, index) => (
                                        <React.Fragment key={index}>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Flow" value={data.FLOW.toFixed(0)} unit="m3/h" Icon={Icons.Water} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Engine Load" value={data.ENGINE_LOAD.toFixed(2)} unit="%" Icon={Icons.ElectricCar} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Pump DE Vib X1" value={data.PUMP_NDE_VIB_X1.toFixed(2)} unit="mm/s" Icon={Icons.Sensors} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Discharge Pressure" value={data.DISCHARGE_PRESSURE.toFixed(2)} unit="Bar" Icon={Icons.Commit} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Bearing Temp" value={data.PUMP_NDE_TEMP.toFixed(2)} unit="°C" Icon={Icons.Thermostat} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Pump NDE VIb X2" value={data.PUMP_NDE_VIB_X2.toFixed(2)} unit="mm/s" Icon={Icons.Sensors} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Total Head" value={(data.DISCHARGE_PRESSURE * 10.2).toFixed(2)} unit="m" Icon={Icons.AirlineStopsOutlined} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Fuel Rate" value={data.ENGINE_FUEL_CONSUMPTIONS.toFixed(2)} unit="L/h" Icon={Icons.LocalGasStation} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Pump NDE Vib Y" value={data.PUMP_DE_VIB_Y.toFixed(2)} unit="mm/s" Icon={Icons.Sensors} />
                                            </Grid>
                                            {/* Additional Bubbles */}
                                        </React.Fragment>
                                    ))}
                                </Grid>
                            </Box>
                        </Grid>

                        {/* Kolom kosong 1 diisi Map */}
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            {gpsData.map((data, index) => (
                                <Box
                                    sx={{
                                        height: '400px',
                                        backgroundColor: 'white',
                                        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                        borderRadius: '30px',
                                        margin: '5px',
                                        overflow: 'hidden',
                                        padding: '10px',
                                    }}
                                    key={index} // Menambahkan key untuk mencegah peringatan di console
                                >
                                    <Typography
                                        variant="h6"
                                        color="textPrimary"
                                        sx={{
                                            fontSize: '1.3rem',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                                        }}
                                    >
                                        Location {unitId}
                                    </Typography>

                                    <Box
                                        sx={{
                                            height: '340px',
                                            width: '100%',
                                            border: '2px solid #4A90E2',
                                            borderRadius: '20px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <MapContainer center={[data.LAT, data.LONG]} zoom={5} style={{ width: '100%', height: '100%' }}>
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />

                                            {/* Marker dengan koordinat dari gpsData */}
                                            <Marker position={[data.LAT, data.LONG]} icon={defaultIcon}>
                                                <Popup>
                                                    Location : {data.LAT}, {data.LONG}
                                                </Popup>
                                            </Marker>

                                            {/* Circle effect around the marker */}
                                            <Circle
                                                center={[data.LAT, data.LONG]} // Menggunakan data LAT, LONG
                                                radius={200} // Radius in meters
                                                pathOptions={{
                                                    color: 'red',
                                                    weight: 1,
                                                    fillColor: 'red',
                                                    fillOpacity: 0.1, // 10% transparency
                                                }}
                                            />
                                        </MapContainer>
                                    </Box>
                                </Box>
                            ))}
                        </Grid>

                        {/* Kolom kosong 5 diisi Chart */}
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Box
                                sx={{
                                    backgroundColor: 'white',
                                    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                    borderRadius: '30px',
                                    height: '400px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '5px',
                                }}
                            >
                                <Box
                                    sx={{
                                        height: '100%',
                                        width: '100%',
                                        padding: '12px',
                                        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                        borderRadius: '30px',
                                    }}
                                >
                                    <Line
                                        data={chartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: true,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Performance Curve', // Judul grafik
                                                },
                                                tooltip: {
                                                    enabled: false, // Nonaktifkan tooltip default
                                                },
                                                annotation: chartData.datasets[0]?.data.length
                                                    ? {
                                                        annotations: chartData.datasets[0].data.map((point, index) => ({
                                                            type: 'label',
                                                            xValue: point.x,
                                                            yValue: point.y,
                                                            backgroundColor: 'rgba(200, 200, 200, 0.8)', // Latar belakang abu-abu muda
                                                            borderColor: 'rgba(0,0,0,0.3)', // Garis border abu-abu
                                                            borderWidth: 1,
                                                            content: [`Flow: ${point.x} m3/h`, `Head: ${point.y} m`],
                                                            font: {
                                                                size: 12, // Ukuran font
                                                                weight: 'bold',
                                                            },
                                                            display: true,
                                                            xAdjust: 50, // Tetap di tengah secara horizontal
                                                            yAdjust: 30, // Geser lebih jauh ke atas
                                                        })),
                                                    }
                                                    : undefined,
                                            },
                                            scales: {
                                                x: {
                                                    type: 'linear', // Skala linear untuk flow
                                                    title: {
                                                        display: true,
                                                        text: 'Flow (m3/h)', // Label untuk sumbu X
                                                    },
                                                    grid: {
                                                        display: true,
                                                    },
                                                    ticks: {
                                                        autoSkip: true,
                                                        maxTicksLimit: 10,
                                                    },
                                                    min: 0, // Rentang minimum untuk sumbu X
                                                    max: chartData.datasets[0]?.data.length
                                                        ? Math.max(...chartData.datasets[0].data.map((d) => d.x)) + 150
                                                        : undefined, // Tambahkan offset 100 jika data tersedia
                                                },
                                                y: {
                                                    title: {
                                                        display: true,
                                                        text: 'Duty Head (m)', // Label untuk sumbu Y
                                                    },
                                                    grid: {
                                                        display: true,
                                                    },
                                                    min: 0, // Rentang minimum untuk sumbu Y
                                                    max: 200, // Rentang maksimum untuk sumbu Y
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Grid>


                        {/* Kolom kosong 4 diisi Alarm List */}
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Box
                                sx={{
                                    height: '400px',  // Mengatur tinggi otomatis, agar box tidak memaksa mengisi ruang
                                    backgroundColor: 'white',
                                    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                    borderRadius: '30px',
                                    margin: '4px',  // Maximum margin around the Box
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',  // Align content to the top
                                    alignItems: 'center',  // Center content horizontally
                                    overflow: 'auto',
                                    padding: '15px',  // Mengurangi padding utama untuk lebih rapat
                                }}
                            >
                                {/* Separator Box for Vacuum Pump & Level Sensor Status */}
                                <Box
                                    sx={{
                                        backgroundColor: 'white',  // Color for embush (light yellow)
                                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',  // Strong shadow for clear separation
                                        borderRadius: '20px',
                                        width: '100%',
                                        margin: '5px 0',  // Mengurangi margin antar box
                                        padding: '5px',
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontSize: '1.3rem',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                                            marginTop: '5px', // Spacing sedikit di atas title
                                            marginBottom: '12px', // Spacing sedikit di bawah title
                                        }}
                                    >
                                        Vacuum Pump & Level Sensor Status
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',  // Grid with auto-fill and dynamic width
                                            gap: '0px',  // Mengurangi gap menjadi 0 untuk jarak antar card lebih rapat
                                            width: '100%',  // Full width of the box
                                            justifyItems: 'center',  // Center grid items horizontally
                                            alignItems: 'start',  // Align grid items to the top
                                        }}
                                    >
                                        {cardDataCoil.map((data, index) => (
                                            <React.Fragment key={index}>
                                                <Vacuum title="Vacuum Pump" coilValue={data.VACUM_ON} />
                                                <LevelSensor title="Low Level" coilValue={data.LOW_LEVEL} />
                                                <LevelSensor title="High Level" coilValue={data.HIGH_LEVEL} />
                                            </React.Fragment>
                                        ))}
                                    </Box>
                                </Box>

                                {/* Box for Alarm List */}
                                <Box
                                    sx={{
                                        backgroundColor: 'white',  // White background for Alarm List Box
                                        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                        borderRadius: '30px',
                                        padding: '10px',  // Mengurangi padding untuk Box Alarm agar lebih rapat
                                        width: '100%',
                                        marginBottom: '5px',  // Margin sedikit antar box
                                        marginTop: '5px',  // Margin sedikit antar box
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontSize: '1.3rem',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                                            marginBottom: '12px', // Spacing sedikit di bawah title
                                        }}
                                    >
                                        Alarm List For {unitId}
                                    </Typography>

                                    {/* Render each Alarm card with hardcoded titles and coilValue = 1 */}
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',  // Grid with auto-fill and dynamic width
                                            gap: '0px',  // Mengurangi gap menjadi 0 untuk jarak antar card lebih rapat
                                            width: '100%',  // Full width of the box
                                            justifyItems: 'center',  // Center grid items horizontally
                                            alignItems: 'start',  // Align grid items to the top
                                        }}
                                    >
                                        {cardDataCoil.map((data, index) => (
                                            <React.Fragment key={index}>
                                                <Alarm title="Pump DE Temp" coilValue={1} />
                                                <Alarm title="Oil Lube Cloging" coilValue={data.OIL_LUB_CLOG} />
                                                <Alarm title="Oil Lube No Flow" coilValue={data.OIL_LUB_NO_FLOW} />
                                                <Alarm title="DE Vibration Y" coilValue={data.PUMP_ALARM_DE_VIB_Y1} />
                                                <Alarm title="NDE Vibration X1" coilValue={data.PUMP_ALARM_NDE_VIB_X1} />
                                                <Alarm title="NDE Vibration X2" coilValue={data.PUMP_ALARM_NDE_VIB_X2} />
                                            </React.Fragment>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>



                    </Grid>
                </Grid>
            )}
        </Box>
    );

};

export default UnitPage;
