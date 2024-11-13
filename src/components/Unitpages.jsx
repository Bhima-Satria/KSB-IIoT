import React, { useEffect, useState } from 'react';
import { Grid, Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { fetchData } from './dataService';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import images according to unitId
import imageUnit1 from '../img/KSB64.webp'; // Replace with image path for unit 1
import imageUnit2 from '../img/KSB67.webp'; // Replace with image path for unit 2
import imageUnit3 from '../img/KSBDoubleDrive.webp'; // Replace with image path for unit 3
import marker_icon from '../img/marker-icon.png'; // Ganti dengan path gambar marker
import marker_shadow from '../img/marker-shadow.png'; // Ganti dengan path gambar shadow

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


const DataCard = ({ title, value, unit, Icon, Duty }) => {
    return (
        <Card sx={{
            backgroundColor: 'white',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            padding: 2,
            margin: 1,
            flex: 1,
            minWidth: { xs: '120px', sm: '200px' },
        }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                        {title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                        {value} {unit}
                    </Typography>
                </Box>
                <Box sx={{
                    width: '60px', // Ubah lebar box sesuai kebutuhan
                    height: '60px', // Ubah tinggi box sesuai kebutuhan
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 2
                }}>
                    <Icon sx={{ fontSize: '50px', color: '#FF8A00' }} /> {/* Ubah ukuran ikon di sini */}
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
                        {Duty}
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};


const CardStatus = ({ title, value, lastUpdatedDate }) => {
    // Menentukan status berdasarkan value
    const isOn = value > 1;

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
            fontSize: '100px',
            opacity: blinkStyle.opacity,
        }} />
    ) : (
        <Icons.PowerSettingsNew sx={{
            color: '#FF0000',
            fontSize: '100px'
        }} />
    );

    const statusText = isOn ? 'Running' : 'Stop';

    return (
        <Card sx={{
            backgroundColor: 'white',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            padding: 2,
            margin: 1,
            flex: 1,
            minWidth: { xs: '120px', sm: '200px' },
        }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                        {title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                        {statusText}
                    </Typography>
                </Box>
                <Box sx={{
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 2
                }}>
                    <Box sx={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '100%',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: -5
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
                        Latest Online : {lastUpdatedDate}
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};


const UnitPage = () => {
    const { unitId } = useParams(); // Mendapatkan unitId dari params URL
    const [cardData, setCardData] = useState([]); // Menyimpan data untuk ditampilkan di UI
    const [loading, setLoading] = useState(true); // Loading state
    const [lastUpdated, setLastUpdated] = useState(null); // Waktu terakhir data diperbarui
    const [isDataEmpty, setIsDataEmpty] = useState(false); // Status apakah data kosong
    const [parsedDate, setParsedDate] = useState(''); // Waktu terformat

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Flow',
                data: [],
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
            },
            {
                label: 'Temperature',
                data: [],
                borderColor: 'rgba(255,99,132,1)',
                fill: false,
            },
            {
                label: 'Discharge Pressure',
                data: [],
                borderColor: 'rgba(255,205,86,1)',
                fill: false,
            },
        ],
    });

    const getImageByUnitId = (id) => {
        switch (id) {
            case 'KSB-Unit 67':
                return imageUnit1; // Pastikan imageUnit1 sudah didefinisikan
            case 'KSB-Unit 68':
                return imageUnit2; // Pastikan imageUnit2 sudah didefinisikan
            default:
                return null;
        }
    };

    // Function to parse date from the API's format "DD/MM/YYYY HH:mm:ss"
    const parseDate = (dateString) => {
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/');
        const [hours, minutes, seconds] = timePart.split(':');
        const formattedDate = new Date(year, month - 1, day, hours, minutes, seconds);
        return formattedDate;
    };

    const addData = (newData) => {
        setChartData((prevData) => {
            const newLabels = [...prevData.labels, newData.label];
            const newFlowData = [...prevData.datasets[0].data, newData.FLOW];
            const newTemperatureData = [...prevData.datasets[1].data, newData.temperature];
            const newDischargePressureData = [...prevData.datasets[2].data, newData.dischargePressure];

            if (newLabels.length > 100) {
                newLabels.shift();
                newFlowData.shift();
                newTemperatureData.shift();
                newDischargePressureData.shift();
            }

            return {
                labels: newLabels,
                datasets: [
                    { ...prevData.datasets[0], data: newFlowData },
                    { ...prevData.datasets[1], data: newTemperatureData },
                    { ...prevData.datasets[2], data: newDischargePressureData },
                ],
            };
        });
    };

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await fetchData(unitId); // Ambil data API
                console.log(response); // Melihat respon API

                const data = response.READ_REAL; // Mengambil data READ_REAL dari respon API

                if (!data) {
                    setIsDataEmpty(true); // Menandakan data kosong
                    const lastData = JSON.parse(localStorage.getItem('lastData')); // Ambil data terakhir dari localStorage
                    if (lastData) {
                        setCardData([lastData]);
                        setLastUpdated(lastData.lastUpdated);
                        setParsedDate(lastData.parsedDate);
                    }
                } else {
                    setIsDataEmpty(false);
                    setCardData([data]); // Pastikan cardData adalah array meskipun hanya satu objek
                    setLastUpdated(response.date);

                    // Memformat tanggal
                    const dateObj = parseDate(response.date); // Gunakan fungsi custom parseDate
                    const options = {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                    };
                    const formattedDate = dateObj.toLocaleString('en-GB', options);
                    setParsedDate(formattedDate);

                    // Menambahkan data ke chart
                    addData({
                        label: dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                        FLOW: data.FLOW,
                        temperature: data.PUMP_DE_TEMP,
                        dischargePressure: data.DISCHARGE_PRESSURE / 10,
                    });

                    // Simpan data terakhir ke localStorage
                    const lastData = {
                        FLOW: data.FLOW.toFixed(3),
                        temperature: data.PUMP_DE_TEMP,
                        dischargePressure: data.DISCHARGE_PRESSURE.toFixed(3),
                        lastUpdated: response.date,
                        parsedDate: formattedDate,
                    };
                    localStorage.setItem('lastData', JSON.stringify(lastData));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsDataEmpty(true); // Jika error, data dianggap kosong
                const lastData = JSON.parse(localStorage.getItem('lastData')); // Ambil data terakhir dari localStorage
                if (lastData) {
                    setCardData([lastData]);
                    setLastUpdated(lastData.lastUpdated);
                    setParsedDate(lastData.parsedDate);
                }
            } finally {
                setLoading(false); // Menandakan bahwa loading selesai
            }
        };

        getData(); // Ambil data pertama kali saat komponen dimuat

        const intervalId = setInterval(getData, 1000); // Refresh data setiap 1000ms (1 detik)

        return () => clearInterval(intervalId); // Bersihkan interval ketika komponen di-unmount
    }, [unitId]);

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
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            {cardData.map((data, index) => (
                                <CardStatus
                                    key={index}
                                    title="Unit Status"
                                    value={data.ENGINE_SPEED}
                                    lastUpdatedDate={parsedDate}
                                />
                            ))}
                            {cardData.map((data, index) => (
                                <DataCard
                                    key={index}
                                    title="Flow"
                                    value={data.FLOW.toFixed(3)}
                                    unit="m3/h"
                                    Icon={Icons.Water}
                                    Duty="Duty Flow : 600 m3/h"
                                />
                            ))}
                            {cardData.map((data, index) => (
                                <DataCard
                                    key={index}
                                    title="Discharge Pressure"
                                    value={data.DISCHARGE_PRESSURE.toFixed(3)}
                                    unit="Bar"
                                    Icon={Icons.Commit}
                                    Duty="Duty Pressure : 16.2 Bar"
                                />
                            ))}
                            {cardData.map((data, index) => (
                                <DataCard
                                    key={index}
                                    title="Engine Speed"
                                    value={data.ENGINE_SPEED}
                                    unit="RPM"
                                    Icon={Icons.Speed}
                                    Duty="Duty Speed : 1450 RPM"
                                />
                            ))}
                            {cardData.map((data, index) => (
                                <DataCard
                                    key={index}
                                    title="Engine Load"
                                    value={data.ENGINE_LOAD}
                                    unit="%"
                                    Icon={Icons.ElectricCar}
                                    Duty="Duty Engine : 80% "
                                />
                            ))}
                        </Box>
                    </Grid>

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
                                            variant="h6"  // Use h6 for the title
                                            color="textSecondary"
                                            sx={{
                                                fontSize: '1.3rem',  // Adjust font size as needed
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
                                    }}>
                                        <img
                                            src={getImageByUnitId(unitId)}
                                            alt="Unit Visual"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                maxWidth: '450px',
                                                borderRadius: '20px',
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
                                            {[
                                                { label: 'Unit Name', value: unitId }, // Make Bold Text
                                                { label: 'Type Pump', value: 'ISP-D150' },
                                                { label: 'Customer', value: 'PT Adaro Tirta Sarana' },
                                                { label: 'Duty Flow', value: '600 m3/h' },
                                                { label: 'Duty Head', value: '165.24 m' },
                                                { label: 'Speed', value: '1450 RPM' },
                                            ].map(({ label, value }, index) => (
                                                <TableRow key={index}>
                                                    <TableCell
                                                        sx={{ padding: '13px', fontSize: '1.1rem' }}
                                                    >
                                                        {label}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{ padding: '13px', fontSize: '1.1rem' }}
                                                    >
                                                        {value}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
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
                                                <Bubble title="Flow" value={data.FLOW.toFixed(3)} unit="m3/h" Icon={Icons.Water} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Pump DE Temp" value={data.PUMP_DE_TEMP.toFixed(3)} unit="°C" Icon={Icons.Thermostat} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Engine Run Hour" value={data.ENGINE_RUN_HOUR.toFixed(3)} unit="Hours" Icon={Icons.ManageHistory} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Engine Speed" value={data.ENGINE_SPEED} unit="RPM" Icon={Icons.Speed} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Engine Load" value={data.ENGINE_LOAD} unit="%" Icon={Icons.ElectricCar} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Fuel Rate" value={data.ENGINE_FUEL_CONSUMPTIONS.toFixed(3)} unit="L/h" Icon={Icons.LocalGasStation} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Pump DE Vib Y" value={data.PUMP_DE_VIB_Y.toFixed(3)} unit="mm/s" Icon={Icons.Sensors} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Pump NDE Vib X1" value={data.PUMP_NDE_VIB_X1.toFixed(3)} unit="mm/s" Icon={Icons.Sensors} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                            <Bubble title="Pump NDE Vib X2" value={data.PUMP_NDE_VIB_X2.toFixed(3)} unit="mm/s" Icon={Icons.Sensors} />
                                            </Grid>
                                            {/* Additional Bubbles */}
                                        </React.Fragment>
                                    ))}
                                </Grid>
                            </Box>
                        </Grid>

                        {/* Kolom kosong 1 diisi Map */}
                        <Grid item xs={12} sm={12} md={4} lg={4}>
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
                                    <MapContainer center={[-1.83333, 115.55]} zoom={5} style={{ width: '100%', height: '100%' }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />

                                        {/* Default Marker */}
                                        <Marker position={[-1.83333, 115.55]} icon={defaultIcon}>
                                            <Popup>
                                                Location : -1.83333, 115.55
                                            </Popup>
                                        </Marker>

                                        {/* Circle effect around the marker */}
                                        <Circle
                                            center={[-1.83333, 115.55]}  // Position of the circle
                                            radius={200}  // Radius in meters
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
                        </Grid>


                        {/* Kolom kosong 3 diisi Chart*/}
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Box sx={{
                                backgroundColor: 'white',
                                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                borderRadius: '30px',
                                height: '400px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '5px',
                            }}>
                                <Box sx={{
                                    height: '100%',
                                    width: '100%',
                                    padding: '12px',
                                    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                    borderRadius: '30px',
                                }}>
                                    <Line
                                        data={chartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Monitoring Data Chart',
                                                },
                                            },
                                            scales: {
                                                x: {
                                                    title: {
                                                        display: true,
                                                        text: 'Time',
                                                    },
                                                },
                                                y: {
                                                    title: {
                                                        display: true,
                                                        text: 'Values',
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Grid>

                        {/* Kolom untuk Tombol Buka Kamera */}
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Box sx={{
                                height: '400px',
                                background: 'white',
                                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
                                borderRadius: '30px',
                                margin: '5px',
                                padding: '10px',
                                display: 'flex',
                                flexDirection: 'column',  // Menyusun konten secara vertikal
                                justifyContent: 'flex-start',  // Judul di atas
                                alignItems: 'center',
                            }}>
                                {/* Judul di bagian atas */}
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontSize: '1.3rem',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                                    }}
                                >
                                    IPC Camera {unitId}
                                </Typography>

                                {/* Memberikan ruang untuk ikon dan keterangan */}
                                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <IconButton
                                        onClick={() => window.open('https://ipc.bardi.co.id/login', '_blank')}
                                        sx={{
                                            padding: '0',  // Menghapus padding default
                                            width: '80%',  // Mengatur lebar responsif
                                            height: 'auto',  // Tinggi otomatis untuk menjaga proporsi
                                        }}
                                    >
                                        <Icons.SmartDisplay sx={{ width: '100%', height: 'auto', color: '#336699' }} /> {/* Ikon responsif */}
                                    </IconButton>
                                    {/* Keterangan di bawah ikon */}
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            marginTop: '5px',
                                            textAlign: 'center',
                                            color: 'gray', // Warna keterangan
                                        }}
                                    >
                                        Click to open IPC camera.
                                    </Typography>
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
