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
import dayjs from 'dayjs'; // For date and time formatting

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

// Komponen Bubble
const Bubble = ({ title, value, unit, Icon }) => {
    const [maxValue, setMaxValue] = useState(value); // State untuk menyimpan nilai maksimum

    // Periksa apakah value baru lebih besar dari maxValue
    useEffect(() => {
        if (value > maxValue) {
            setMaxValue(value); // Perbarui nilai maksimum
        }
    }, [value, maxValue]);

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
            <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', }}>
                {value} {unit}
            </Typography>
            <Typography variant="caption" sx={{ color: '#FFD700', textAlign: 'center' }}>
                Highest Value: {maxValue} {unit}
            </Typography>
        </Box>
    );
};

const Alarm = ({ title, coilValue, onAlarmUpdate }) => {
    const isWarning = coilValue === 1; // Active alarm if coilValue is 1
    const iconBackgroundColor = isWarning ? '#FF0000' : '#008000'; // Red for active, green for normal
    const [blinkStyle, setBlinkStyle] = useState({ opacity: 1 });

    useEffect(() => {
        let blinkInterval;
        if (isWarning) {
            blinkInterval = setInterval(() => {
                setBlinkStyle((prev) => ({
                    opacity: prev.opacity === 1 ? 0 : 1,
                }));
            }, 300);
        } else {
            setBlinkStyle({ opacity: 1 });
        }

        // Notify parent about the alarm status
        onAlarmUpdate(title, isWarning);

        return () => {
            clearInterval(blinkInterval);
            onAlarmUpdate(title, false); // Cleanup to remove alarm
        };
    }, [isWarning, onAlarmUpdate, title]);

    return (
        <Box
            sx={{
                width: { xs: '100%', sm: '145px' },  // Responsif width dikurangi 15%
                height: { xs: '17px', sm: '43px' }, // Responsif height dikurangi 15%
                backgroundColor: '#F5F5F5',
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: 0, // Hapus padding untuk mengurangi spasi
                marginBottom: 1, // Hapus marginBottom
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.3)',
                border: '1px solid #DDDDDD', // Bisa dihilangkan jika tidak diperlukan
            }}
        >
            {/* Icon Box */}
            <Box
                sx={{
                    backgroundColor: iconBackgroundColor,
                    borderRadius: '5px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: { xs: '17px', sm: '43px' },  // Responsif width icon box dikurangi 15%
                    height: { xs: '17px', sm: '43px' }, // Responsif height icon box dikurangi 15%
                    marginRight: 0.5, // Hapus marginRight
                }}
            >
                <Icons.WarningAmberOutlined
                    sx={{
                        fontSize: { xs: '8px', sm: '34px' },  // Responsif icon size dikurangi 15%
                        color: 'white',
                        ...blinkStyle,
                    }}
                />
            </Box>

            {/* Text Box */}
            <Box sx={{ textAlign: 'left', marginLeft: 0 }}> {/* Hapus marginLeft */}
                <Typography
                    variant="body1"
                    sx={{
                        fontWeight: 'bold',
                        color: isWarning ? '#FF0000' : '#000',
                        fontSize: { xs: '9px', sm: '11px' },  // Responsif font size dikurangi 15%
                    }}
                >
                    {title}
                </Typography>
            </Box>
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
                width: { xs: '100%', sm: '145px' },  // Responsif width for small and large screens (dikurangi 15%)
                height: { xs: '17px', sm: '43px' }, // Responsif height for small and large screens (dikurangi 15%)
                backgroundColor: '#F5F5F5',
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                alignItems: 'center',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.3)',
                padding: 0, // Adjust padding based on screen size (dikurangi 15%)
                marginBottom: 1,
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
                    width: { xs: '17px', sm: '43px' },  // Responsif width for icon box (dikurangi 15%)
                    height: { xs: '17px', sm: '43px' }, // Responsif height for icon box (dikurangi 15%)
                    marginRight: 0.5, // Adjusted for a smaller margin (dikurangi 15%)
                    padding: 0, // Adjust padding based on screen size
                }}
            >
                <Icon sx={{
                    fontSize: { xs: '8px', sm: '34px' },  // Responsif icon size (dikurangi 15%)
                    color: 'white',
                }} />
            </Box>

            {/* Text box */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                marginLeft: { xs: '8px', sm: '0px' }, // Adjust text margin for smaller screens (dikurangi 15%)
            }}>
                <Typography variant="body1" sx={{
                    fontWeight: 'bold',
                    color: 'black',
                    fontSize: { xs: '11px', sm: '13px' },  // Responsif font size (dikurangi 15%)
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
                width: { xs: '100%', sm: '145px' },  // Responsif width for small and large screens (dikurangi 15%)
                height: { xs: '17px', sm: '43px' }, // Responsif height for small and large screens (dikurangi 15%)
                backgroundColor: '#F5F5F5',
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                alignItems: 'center',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.3)',
                padding: 0, // Adjust padding based on screen size (dikurangi 15%)
                marginBottom: 1,
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
                    width: { xs: '17px', sm: '43px' },  // Responsif width for icon box (dikurangi 15%)
                    height: { xs: '17px', sm: '43px' }, // Responsif height for icon box (dikurangi 15%)
                    marginRight: 0.5, // Adjusted for a smaller margin (dikurangi 15%)
                    padding: 0, // Adjust padding based on screen size
                }}
            >
                <Icon sx={{
                    fontSize: { xs: '8px', sm: '34px' },  // Responsif icon size (dikurangi 15%)
                    color: 'white',
                }} />
            </Box>

            {/* Text box */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                marginLeft: { xs: '8px', sm: '0px' }, // Adjust text margin for smaller screens (dikurangi 15%)
            }}>
                <Typography variant="body1" sx={{
                    fontWeight: 'bold',
                    color: 'black',
                    fontSize: { xs: '11px', sm: '13px' },  // Responsif font size (dikurangi 15%)
                }}>
                    {title}
                </Typography>
            </Box>
        </Box>
    );
};


const DataCard = ({ title, value, unit, Icon, Duty }) => {
    return (
        <Card
            sx={{
                backgroundColor: 'white',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)', // Lebih ringan shadow-nya
                display: 'flex',
                flexDirection: 'column',
                padding: { xs: 0.5, sm: 1 }, // Padding lebih kecil
                margin: 1,
                flex: 1,
                minWidth: { xs: '100px', sm: '150px' }, // Ukuran minimum lebih kecil
                maxWidth: '100%', // Membatasi lebar maksimal
            }}
        >
            <CardContent
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    paddingBottom: '4px', // Kurangi jarak bawah
                    paddingTop: '4px', // Kurangi jarak atas
                }}
            >
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px', // Kurangi jarak antar teks
                    }}
                >
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                            fontSize: { xs: '0.8rem', sm: '1rem' }, // Ukuran font lebih kecil
                            marginBottom: '2px', // Jarak bawah kecil
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: { xs: '1rem', sm: '1.2rem' }, // Ukuran font lebih kecil
                            marginTop: '2px', // Jarak atas kecil
                        }}
                    >
                        {value} {unit}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        width: { xs: '40px', sm: '50px' }, // Responsif lebar ikon lebih kecil
                        height: { xs: '40px', sm: '50px' }, // Responsif tinggi ikon lebih kecil
                        borderRadius: '50%',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 1, // Kurangi margin kiri
                    }}
                >
                    <Icon
                        sx={{
                            fontSize: { xs: '30px', sm: '40px' }, // Responsif ukuran ikon lebih kecil
                            color: '#FF8A00',
                        }}
                    />
                </Box>
            </CardContent>

            {/* Kurangi marginTop untuk mengurangi ruang kosong bawah */}
            <Box
                sx={{
                    borderTop: '1px solid #e0e0e0',
                    width: '100%',
                    textAlign: 'center',
                    marginTop: '2px', // Kurangi margin atas
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: { xs: '2px', sm: '4px' }, // Padding bawah lebih kecil
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                            fontSize: { xs: '0.7rem', sm: '0.9rem' }, // Ukuran font lebih kecil
                        }}
                    >
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
            fontSize: { xs: '28px', sm: '42px', md: '56px' }, // Ukuran ikon dikurangi sekitar 30%
            opacity: blinkStyle.opacity,
        }} />
    ) : (
        <Icons.PowerSettingsNew sx={{
            color: '#FF0000',
            fontSize: { xs: '28px', sm: '42px', md: '56px' }, // Ukuran ikon dikurangi sekitar 30%
        }} />
    );

    const statusText = isOn ? 'Running' : 'Stop';

    return (
        <Card sx={{
            backgroundColor: 'white',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            padding: { xs: 0.7, sm: 1.4 }, // Padding dikurangi sekitar 30%
            margin: 1,
            flex: 1,
            minWidth: { xs: '85px', sm: '140px' }, // Ukuran minimum box dikurangi sekitar 30%
            maxWidth: '100%', // Membatasi lebar maksimal agar sesuai dengan layar
        }}>
            <CardContent sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                paddingBottom: '3px', // Padding bawah dikurangi
                paddingTop: '3px', // Padding atas dikurangi
            }}>
                <Box sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px', // Gap antar teks dikurangi
                }}>
                    <Typography variant="body2" color="textSecondary" sx={{
                        fontSize: { xs: '0.6rem', sm: '0.8rem' }, // Ukuran font dikurangi sekitar 30%
                        marginBottom: '3px',
                    }}>
                        {title}
                    </Typography>
                    <Typography variant="h6" sx={{
                        fontWeight: 'bold',
                        fontSize: { xs: '0.8rem', sm: '1.1rem' }, // Ukuran font dikurangi sekitar 30%
                        marginTop: '3px', // Jarak atas dikurangi
                    }}>
                        {statusText}
                    </Typography>
                </Box>
                <Box sx={{
                    width: { xs: '28px', sm: '42px' }, // Ukuran box ikon dikurangi sekitar 30%
                    height: { xs: '28px', sm: '42px' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 2
                }}>
                    <Box sx={{
                        width: { xs: '35px', sm: '60px', md: '55px' }, // Ukuran box di sekitar ikon dikurangi sekitar 30%
                        height: { xs: '35px', sm: '60px', md: '55px' },
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
                padding: { xs: '0.4rem', sm: '0.6rem' }, // Padding bawah dikurangi sekitar 30%
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary" sx={{
                        fontSize: { xs: '0.5rem', sm: '0.7rem' }, // Ukuran font bawah dikurangi sekitar 30%
                    }}>
                        Latest Online: {lastUpdatedDate}
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};

const TotalFlowCalculator = ({ title, value, unit }) => {
    // State untuk menyimpan total flow
    const [totalFlow, setTotalFlow] = useState(0);

    // Menghitung aliran per detik
    const flowRatePerSecond = value / 3600; // Konversi m³/jam ke m³/detik

    // Mengupdate total flow setiap detik
    useEffect(() => {
        const interval = setInterval(() => {
            setTotalFlow((prevTotalFlow) => prevTotalFlow + flowRatePerSecond);
        }, 1000); // Update setiap detik

        // Bersihkan interval saat komponen di-unmount
        return () => clearInterval(interval);
    }, [value]);

    // Fungsi untuk mereset total flow
    const resetTotalFlow = () => {
        setTotalFlow(0);
    };

    return (
        <Box
            sx={{
                width: { xs: '90%', sm: '170px' }, // Lebar lebih kecil dan responsif
                height: 'auto',
                backgroundColor: '#336699', // Warna latar utama
                borderRadius: '12px', // Membuat ujung bulat
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)', // Bayangan lembut
                padding: '8px', // Padding lebih kecil
                transition: 'all 0.3s ease', // Transisi halus untuk hover
                '&:hover': {
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)', // Menambah bayangan saat hover
                    transform: 'translateY(-4px)', // Mengangkat sedikit saat hover
                    backgroundColor: '#FF9E33', // Mengubah warna latar saat hover
                },
            }}
        >
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '0.85rem' }}>
                Counting {title} <br />
                <span style={{ color: '#FFD700', textAlign: 'center' }}>
                    {totalFlow.toFixed(2)} {unit}
                </span>
            </Typography>

            <Button
                onClick={resetTotalFlow}
                sx={{
                    backgroundColor: '#FF0000',
                    color: 'white',
                    padding: '1px 7px', // Ukuran tombol lebih kecil
                    borderRadius: '6px', // Border radius lebih tipis
                    fontSize: '0.7rem', // Ukuran font tombol lebih kecil
                    fontWeight: 'bold', // Membuat tulisan bold
                    '&:hover': {
                        backgroundColor: '#D10000',
                    },
                    marginTop: 1, // Menambahkan jarak antara tombol dan teks
                }}
            >
                Reset
            </Button>

        </Box>
    );
};

const UnitInfoTable = ({ unitId }) => {
    const [unitInfo, setUnitInfo] = useState([]);

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await fetchData(unitId);
                const fetchedUnitInfo = response.unitInfo;

                if (fetchedUnitInfo) {
                    // Ubah object ke array agar mudah di-mapping
                    const formattedUnitInfo = Object.entries(fetchedUnitInfo).map(([label, value]) => ({
                        label,
                        value,
                    }));
                    setUnitInfo(formattedUnitInfo);
                }
            } catch (error) {
                console.error('Error fetching unit information:', error);
            }
        };

        getData();
    }, [unitId]);

    return (
        <TableBody>
            {unitInfo.length > 0 ? (
                unitInfo.map(({ label, value }, index) => (
                    <TableRow key={index}>
                        <TableCell sx={{ padding: '13px', fontSize: '1.1rem' }}>{label}</TableCell>
                        <TableCell sx={{ padding: '13px', fontSize: '1.1rem' }}>{value}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={2} sx={{ textAlign: 'center' }}>
                        No data available
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    );
};

const UnitPage_DD = () => {
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
    const [activeAlarms, setActiveAlarms] = useState([]);
    const [dismissed, setDismissed] = useState(false); // Tambahkan state untuk dismiss status

    // Fungsi untuk mengupdate alarm
    const updateAlarms = (title, isActive) => {
        setActiveAlarms((prevAlarms) => {
            // Jika alarm aktif, tambahkan ke daftar jika belum ada
            if (isActive) {
                if (!prevAlarms.some((alarm) => alarm.title === title)) {
                    return [...prevAlarms, { title, timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss') }];
                }
            }

            // Tidak menghapus alarm jika coil status berubah menjadi tidak aktif
            return prevAlarms;
        });
    };

    // Fungsi untuk dismiss alarm
    const handleDismiss = () => {
        setDismissed(true); // Menyembunyikan popup dengan set dismissed menjadi true
        setActiveAlarms([]); // Menghapus semua alarm yang aktif

        // Set timeout untuk 5 menit
        setTimeout(() => {
            // Memeriksa apakah ada alarm yang masih aktif setelah 5 menit
            const stillActiveAlarms = cardDataCoil.some((data) => {
                return (
                    data.OIL_LUB_NO_FLOW === 1 ||
                    data.PUMP_ALARM_DE_VIB_Y1 === 1 ||
                    data.PUMP_ALARM_NDE_VIB_X1 === 1 ||
                    data.PUMP_ALARM_NDE_VIB_X2 === 1
                );
            });

            if (stillActiveAlarms) {
                setActiveAlarms((prev) => [...prev]); // Update alarm jika masih ada yang aktif
            }

            // Reset dismissed menjadi false setelah 5 menit
            setDismissed(false);
        }, 5 * 60 * 1000); // Tunggu selama 5 menit
    };


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
            title: "Pump DE Temp",
            value: cardData[0]?.PUMP_DE_TEMP.toFixed(2),
            unit: "°C",
            Icon: Icons.Thermostat,
            Duty: "Temp Duty: 90°C"
        },
        {
            title: "First Engine Speed",
            value: cardData[0]?.ENGINE_1_SPEED.toFixed(0),
            unit: "RPM",
            Icon: Icons.Speed,
            Duty: "Duty Speed: 1560 RPM"
        },
        {
            title: "Second Engine Speed",
            value: cardData[0]?.ENGINE_2_SPEED.toFixed(0),
            unit: "RPM",
            Icon: Icons.Speed,
            Duty: "Duty Speed: 1560 RPM"
        },
        {
            title: "First Engine Load",
            value: cardData[0]?.ENGINE_1_LOAD.toFixed(2),
            unit: "%",
            Icon: Icons.ElectricCar,
            Duty: "Duty Engine: 80%"
        },
        {
            title: "Second Engine Load",
            value: cardData[0]?.ENGINE_2_LOAD.toFixed(2),
            unit: "%",
            Icon: Icons.ElectricCar,
            Duty: "Duty Engine: 80%"
        },
        {
            title: "First Engine Run Hour",
            value: cardData[0]?.ENGINE_1_RUN_HOUR.toFixed(2),
            unit: "Hours",
            Icon: Icons.ManageHistory,
            Duty: "-"
        },
        {
            title: "Second Engine Run Hour",
            value: cardData[0]?.ENGINE_2_RUN_HOUR.toFixed(2),
            unit: "Hours",
            Icon: Icons.ManageHistory,
            Duty: "-"
        },
        {
            title: "First Engine Fuel Rate",
            value: cardData[0]?.ENGINE_1_FUEL_CONSUMPTIONS.toFixed(1),
            unit: "L/h",
            Icon: Icons.LocalGasStation,
            Duty: "Duty Fuel: 100 L/h"
        },
        {
            title: "Second Engine Fuel Rate",
            value: cardData[0]?.ENGINE_2_FUEL_CONSUMPTIONS.toFixed(1),
            unit: "L/h",
            Icon: Icons.LocalGasStation,
            Duty: "Duty Fuel: 100 L/h"
        },
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
                // console.log(response);
                // console.log(unitId);

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
                                    title="Fisrt Engine Status"
                                    value={data.ENGINE_1_RUN}
                                    lastUpdatedDate={parsedDate}
                                />
                            ))}
                            {cardDataCoil.map((data, index) => (
                                <CardStatus
                                    key={index}
                                    title="Second Engine Status"
                                    value={data.ENGINE_2_RUN}
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
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
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
                                                maxHeight: '400px',
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
                                                    unitId === 'KSB 72'
                                                        ? [
                                                            { label: 'Unit Name', value: 'KSB 72 Double Drive' },
                                                            { label: 'Type Pump', value: 'ISP-D150 U2H' },
                                                            { label: 'Customer', value: 'PT. Thriveni Indomining' },
                                                            { label: 'Duty Flow', value: '600 m3/h' },
                                                            { label: 'Duty Head', value: '250 m' },
                                                            { label: 'Speed', value: '1560 RPM' },
                                                        ]
                                                        : [
                                                            { label: 'No Data Available' }]; // Default kosong jika unitId tidak sesuai

                                                return unitDetails.map(({ label, value }, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell sx={{ padding: '13px', fontSize: '1.1rem' }}>{label}</TableCell>
                                                        <TableCell sx={{ padding: '13px', fontSize: '1.1rem' }}>{value}</TableCell>
                                                    </TableRow>
                                                ));
                                            })()}

                                            {/* <UnitInfoTable unitId={unitId} /> */}
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
                                                <Bubble title="Engine 1 Fuel Rate" value={data.ENGINE_1_FUEL_CONSUMPTIONS.toFixed(2)} unit="L/h" Icon={Icons.LocalGasStation} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Engine 1 Oil Pressure" value={data.ENGINE_1_OIL_PRESSURE.toFixed(2)} unit="Bar" Icon={Icons.Commit} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Discharge Pressure" value={data.DISCHARGE_PRESSURE.toFixed(2)} unit="Bar" Icon={Icons.Commit} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Engine 2 Fuel Rate" value={data.ENGINE_2_FUEL_CONSUMPTIONS.toFixed(2)} unit="L/h" Icon={Icons.LocalGasStation} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Engine 2 Oil Pressure" value={data.ENGINE_2_OIL_PRESSURE.toFixed(2)} unit="Bar" Icon={Icons.Commit} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Total Head" value={(data.DISCHARGE_PRESSURE * 10.2).toFixed(2)} unit="m" Icon={Icons.AirlineStopsOutlined} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Pump DE Temp" value={data.PUMP_DE_TEMP.toFixed(2)} unit="°C" Icon={Icons.Thermostat} />
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
                                                    max: 300, // Rentang maksimum untuk sumbu Y
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Grid>


                        {/* Kolom kosong 6 diisi Alarm List */}
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

                                <Box
                                    sx={{
                                        height: '180px', // Total tinggi box (2 baris)
                                        width: '380px',  // Lebar box
                                        backgroundColor: 'white',
                                        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                        borderRadius: '20px',
                                        margin: '5px',
                                        padding: '10px',
                                    }}
                                >
                                    {/* Mengatur isi box menjadi dua kolom kiri dan kanan */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between', // Membagi menjadi dua kolom
                                            alignItems: 'center',
                                            height: '100%',  // Menggunakan seluruh tinggi yang ada
                                        }}
                                    >
                                        {/* Kolom Kiri: Total Flow */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '10px' }}>
                                            {cardData.map((data, index) => (
                                                <React.Fragment key={index}>
                                                    <TotalFlowCalculator title="Total Flow" value={data.FLOW.toFixed(0)} unit="m³" />
                                                </React.Fragment>
                                            ))}
                                        </Box>

                                        {/* Kolom Kanan: Total Fuel */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            {cardData.map((data, index) => (
                                                <React.Fragment key={index}>
                                                    <TotalFlowCalculator title="Total Fuel" value={data.ENGINE_1_FUEL_CONSUMPTIONS.toFixed(1)} unit="L" />
                                                </React.Fragment>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Box for Alarm List */}
                                <Box
                                    sx={{
                                        backgroundColor: 'white',  // White background for Alarm List Box
                                        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                        borderRadius: '20px',
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
                                            marginBottom: '10px', // Spacing sedikit di bawah title
                                        }}
                                    >
                                        Level Sensor Status & Alarm List For {unitId}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 2fr))', // Grid with auto-fill and dynamic width
                                            gap: '0px',  // Mengatur jarak antar card menjadi fixed 5px
                                            width: '100%',  // Full width of the box
                                            justifyItems: 'center',  // Center grid items horizontally
                                            alignItems: 'start',  // Align grid items to the top
                                            marginTop: '0px',  // Margin atas fixed 5px
                                            marginBottom: '0px',  // Margin bawah fixed 5px
                                        }}
                                    >
                                        {cardDataCoil.map((data, index) => (
                                            <React.Fragment key={index}>
                                                <Vacuum title="Vacuum Pump" coilValue={data.VACUM_ON} />
                                                <LevelSensor title="Low Level" coilValue={data.LOW_LEVEL} />
                                                <LevelSensor title="High Level" coilValue={data.HIGH_LEVEL} />
                                                <Alarm
                                                    title="Pump DE Temp"
                                                    coilValue={data.PUMP_DE_OVER_TEMP}
                                                    onAlarmUpdate={updateAlarms}
                                                />
                                                <Alarm
                                                    title="Oil Lube Clogging"
                                                    coilValue={data.OIL_LUB_CLOGGING}
                                                    onAlarmUpdate={updateAlarms}
                                                />
                                                <Alarm
                                                    title="Oil Lube No Flow"
                                                    coilValue={data.OIL_LUB_NO_FLOW}
                                                    onAlarmUpdate={updateAlarms}
                                                />
                                                <Alarm
                                                    title="DE Vibration Y"
                                                    coilValue={data.PUMP_ALARM_DE_VIB_Y1}
                                                    onAlarmUpdate={updateAlarms}
                                                />
                                                <Alarm
                                                    title="NDE Vibration X1"
                                                    coilValue={data.PUMP_ALARM_NDE_VIB_X1}
                                                    onAlarmUpdate={updateAlarms}
                                                />
                                                <Alarm
                                                    title="NDE Vibration X2"
                                                    coilValue={data.PUMP_ALARM_NDE_VIB_X2}
                                                    onAlarmUpdate={updateAlarms}
                                                />
                                            </React.Fragment>
                                        ))}

                                        {/* Popup for Active Alarms */}
                                        {activeAlarms.length > 0 && !dismissed && (
                                            <Modal
                                                open={true}
                                                onClose={() => setDismissed(false)} // Jangan tutup popup kecuali lewat "Dismiss"
                                                aria-labelledby="active-alarms-popup"
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex', // Gunakan flexbox untuk alignment
                                                        justifyContent: 'center', // Pusatkan secara horizontal
                                                        alignItems: 'center', // Pusatkan secara vertikal
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100vw', // Pastikan lebar box penuh
                                                        height: '100vh', // Pastikan tinggi box penuh
                                                        bgcolor: 'rgba(0, 0, 0, 0.5)', // Latar belakang transparan
                                                        padding: 3,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            bgcolor: 'white',
                                                            borderRadius: 2,
                                                            boxShadow: 24,
                                                            maxWidth: 800,
                                                            width: '100%',
                                                            overflowY: 'auto',
                                                            padding: 3,
                                                        }}
                                                    >
                                                        {/* Teks Warning */}
                                                        <Typography
                                                            id="active-alarms-popup"
                                                            variant="h4"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                textAlign: 'center',
                                                                color: '#FF0000',
                                                                marginBottom: 2,
                                                                animation: 'blinking 1s infinite',
                                                                fontSize: '50px',
                                                            }}
                                                        >
                                                            Warning!
                                                        </Typography>

                                                        {/* Daftar Alarm */}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                flexWrap: 'wrap',
                                                                justifyContent: 'center',
                                                                gap: 2, // Tambahkan jarak antar card
                                                            }}
                                                        >
                                                            {activeAlarms.map((alarm, idx) => (
                                                                <Box
                                                                    key={idx}
                                                                    sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        padding: 2,
                                                                        borderRadius: 2,
                                                                        backgroundColor: '#f8d7da',
                                                                        width: '200px',
                                                                    }}
                                                                >
                                                                    {/* Judul Alarm */}
                                                                    <Typography
                                                                        sx={{
                                                                            fontWeight: 'bold',
                                                                            color: '#FF0000',
                                                                            fontSize: '20px',
                                                                            textAlign: 'center',
                                                                            marginBottom: 1,
                                                                        }}
                                                                    >
                                                                        {alarm.title}
                                                                    </Typography>

                                                                    {/* Waktu Alarm Terakhir */}
                                                                    <Typography
                                                                        sx={{
                                                                            color: '#555',
                                                                            fontSize: '15px',
                                                                            textAlign: 'center',
                                                                        }}
                                                                    >
                                                                        Last Alarm: <br />
                                                                        {alarm.timestamp}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>

                                                        {/* Tombol Dismiss */}
                                                        <Box sx={{ textAlign: 'center', marginTop: 3 }}>
                                                            <Button
                                                                variant="contained"
                                                                onClick={handleDismiss}
                                                                sx={{
                                                                    bgcolor: '#FF0000',
                                                                    color: 'white',
                                                                    '&:hover': { bgcolor: '#cc0000' },
                                                                }}
                                                            >
                                                                Dismiss
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Modal>
                                        )}

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

export default UnitPage_DD;
