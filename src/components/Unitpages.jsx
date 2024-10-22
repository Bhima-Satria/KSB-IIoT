import React, { useEffect, useState } from 'react';
import { Grid, Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { fetchData } from './dataService';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // Pastikan impor ini sudah benar
import 'leaflet/dist/leaflet.css';  // Impor file CSS untuk Leaflet

// Import images according to unitId
import imageUnit1 from '../img/DnD-Engine 2.png'; // Replace with image path for unit 1
import imageUnit2 from '../img/DnD-Engine 2.png'; // Ganti dengan path gambar unit 2

// Register the required components for Chart.js
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const IndicatorLamp = ({ value, maxValue }) => {
    const [isFault, setIsFault] = useState(value > maxValue);
    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
        if (value > maxValue) {
            setIsFault(true);
            setIsBlinking(true);
            const interval = setInterval(() => {
                setIsBlinking((prev) => !prev);
            }, 500); // Kedip setiap 500ms

            return () => clearInterval(interval); // Bersihkan interval saat unmount
        } else {
            setIsFault(false);
            setIsBlinking(false);
        }
    }, [value, maxValue]);

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '37px', // Lebar frame bulat
                height: '37px', // Tinggi frame bulat
                borderRadius: '50%',
                border: '2px solid #ccc', // Ketebalan border
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Efek bayangan untuk 3D
                backgroundColor: 'transparent', // Warna background frame bulat
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isFault ? (isBlinking ? 'red' : 'transparent') : 'green',
                    border: '2px solid #ccc',
                    position: 'absolute', // Agar bisa ditumpuk di tengah frame
                    transition: 'background-color 0.2s, opacity 0.2s', // Transisi untuk efek lebih halus
                    opacity: isFault ? (isBlinking ? 1 : 0.5) : 1, // Efek transparansi saat berkedip

                }}
            />
        </Box>
    );
};

// Komponen Bubble untuk menampilkan data (Atur agar menyesuaikan layar)
const Bubble = ({ title, value, unit, Icon }) => {
    return (
        <Box
            sx={{
                width: { xs: '100%', sm: '220px' }, // Lebar responsif
                height: 'auto',
                backgroundColor: '#0000FF', // Warna latar utama
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


const DataCard = ({ title, value, unit, Icon, lastUpdatedDate }) => {
    return (
        <Card sx={{
            backgroundColor: 'white',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            padding: 2,
            margin: 1,
            flex: 1,
            minWidth: { xs: '150px', sm: '200px' },
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
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 2
                }}>
                    <Icon sx={{ fontSize: '50px', color: '#FF8A00' }} />
                </Box>
            </CardContent>
            <Box sx={{
                borderTop: '1px solid #e0e0e0', width: '100%',
                textAlign: 'center', marginTop: 1, display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
                padding: 1
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Icons.CheckCircleOutline sx={{ color: '#4CAF50', marginRight: 0.5 }} />
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                        {lastUpdatedDate}
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};

const UnitPage = () => {
    const { unitId } = useParams();
    const [cardData, setCardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isDataEmpty, setIsDataEmpty] = useState(false);
    const [parsedDate, setParsedDate] = useState('');

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

    // Function to get image based on unitId
    const getImageByUnitId = (id) => {
        switch (id) {
            case 'KSB-Unit 67':
                return imageUnit1;
            case 'KSB-Unit 68':
                return imageUnit2;
            // Tambahkan case lain sesuai unitId
            default:
                return null;
        }
    };

    // Fungsi untuk menambahkan data baru
    const addData = (newData) => {
        setChartData((prevData) => {
            const newLabels = [...prevData.labels, newData.label];
            const newFlowData = [...prevData.datasets[0].data, newData.Flow];
            const newTemperatureData = [...prevData.datasets[1].data, newData.temperature];
            const newDischargePressureData = [...prevData.datasets[2].data, newData.dischargePressure];

            // Jika jumlah data lebih dari 50, hapus data paling lama
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
                const response = await fetchData(unitId);
                setCardData(response.data || []);

                if (!response.data || response.data.length === 0) {
                    setIsDataEmpty(true);
                } else {
                    setIsDataEmpty(false);
                    setLastUpdated(response.data[0].date);

                    const dateObj = new Date(response.data[0].date);
                    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
                    setParsedDate(dateObj.toLocaleString('en-GB', options));

                    // Tambahkan data baru ke chart
                    addData({
                        label: dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                        Flow: response.data[0].flow, // Pastikan ini merujuk ke data yang benar
                        temperature: response.data[0].pump_de_temperature, // Pastikan ini merujuk ke data yang benar
                        dischargePressure: response.data[0].discharge_pressure / 10 // Pastikan ini merujuk ke data yang benar
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsDataEmpty(true);
            } finally {
                setLoading(false);
            }
        };

        getData(); // Call the data fetching function

        const intervalId = setInterval(getData, 1000); // Refresh data every 1000ms

        return () => clearInterval(intervalId); // Clear interval on component unmount
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
                                <DataCard
                                    key={index}
                                    title="Flow"
                                    value={data.flow}
                                    unit="L/min"
                                    Icon={Icons.Speed}
                                    lastUpdatedDate={parsedDate}
                                />
                            ))}
                            {cardData.map((data, index) => (
                                <DataCard
                                    key={index}
                                    title="Discharge Pressure"
                                    value={data.discharge_pressure / 10}
                                    unit="Bar"
                                    Icon={Icons.FlashOn}
                                    lastUpdatedDate={parsedDate}
                                />
                            ))}
                            {cardData.map((data, index) => (
                                <DataCard
                                    key={index}
                                    title="Pump Temperature"
                                    value={data.pump_de_temperature}
                                    unit="°C"
                                    Icon={Icons.Thermostat}
                                    lastUpdatedDate={parsedDate}
                                />
                            ))}
                            {cardData.map((data, index) => (
                                <DataCard
                                    key={index}
                                    title="Engine Run Hour"
                                    value={data.engine_run_hour}
                                    unit="Hours"
                                    Icon={Icons.BatteryChargingFull}
                                    lastUpdatedDate={parsedDate}
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
                            <Box sx={{
                                height: '400px',
                                backgroundColor: 'white',
                                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
                                borderRadius: '30px',
                                margin: '5px',
                                padding: '20px', // Tambahkan padding untuk estetika
                            }}>
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
                                    }}>
                                    <Table stickyHeader aria-label="detail unit table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell
                                                    colSpan={2}
                                                    sx={{
                                                        backgroundColor: '#0000FF',
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
                                                { label: 'Nama Unit', value: unitId }, // Make Bold Text
                                                { label: 'Type Pump', value: 'ISPV' },
                                                { label: 'Customer', value: 'PT Thriveni' },
                                                { label: 'Duty Flow', value: '3000 L/m' },
                                                { label: 'Duty Head', value: '50 m' },
                                                { label: 'Speed', value: '2900 RPM' },
                                            ].map(({ label, value }, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{ padding: '13px', fontSize: '1.1rem' }}>{label}</TableCell> {/* Atur ukuran font dan padding */}
                                                    <TableCell sx={{ padding: '13px', fontSize: '1.1rem' }}>{value}</TableCell> {/* Atur ukuran font dan padding */}
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
                                                <Bubble title="Flow" value={data.flow} unit="L/min" Icon={Icons.Speed} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Disc Press" value={data.discharge_pressure} unit="Bar" Icon={Icons.FlashOn} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Pump DE Temp" value={data.pump_de_temperature} unit="°C" Icon={Icons.Thermostat} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Engine Run Hour" value={data.engine_run_hour} unit="Hours" Icon={Icons.BatteryChargingFull} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Engine Speed" value={data.engine_speed} unit="RPM" Icon={Icons.Speed} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Engine Load" value={data.engine_load} unit="%" Icon={Icons.BatteryChargingFull} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Fuel Rate" value={data.engine_fuel_rate} unit="L/h" Icon={Icons.Speed} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Pump DE Vib X" value={data.pump_de_vib_x} unit="mm/s" Icon={Icons.Speed} />
                                            </Grid>
                                            <Grid item xs={6} sm={4} md={6} lg={4} container justifyContent="center">
                                                <Bubble title="Pump DE Vib Y" value={data.pump_de_vib_y} unit="mm/s" Icon={Icons.Speed} />
                                            </Grid>
                                            {/* Additional Bubbles */}
                                        </React.Fragment>
                                    ))}
                                </Grid>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Box
                                sx={{
                                    height: '400px', // Height of the outer box
                                    backgroundColor: 'white',
                                    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                    borderRadius: '30px',
                                    margin: '5px',
                                    overflow: 'hidden',  // Prevent overflow
                                    padding: '10px',     // Padding inside the box
                                }}
                            >
                                {/* Title with centered text */}
                                <Typography
                                    variant="h6"  // Use h6 for the title
                                    color="textPrimary"
                                    sx={{
                                        fontSize: '1.3rem',  // Adjust font size as needed
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                                    }}
                                >
                                    Location {unitId}
                                </Typography>

                                {/* Frame around the map */}
                                <Box
                                    sx={{
                                        height: '340px',  // Set a maximum height for the map
                                        width: '100%',
                                        border: '2px solid #4A90E2',  // Frame color and thickness
                                        borderRadius: '20px',         // Border radius for the map
                                        overflow: 'hidden',            // Prevent the map from overflowing the box
                                    }}
                                >
                                    {/* MapContainer for displaying the map */}
                                    <MapContainer
                                        center={[-1.83333, 115.55]}  // Initial map coordinates
                                        zoom={13}
                                        style={{ width: '100%', height: '100%' }}  // Make map fill the box
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        {/* Adding marker */}
                                        <Marker position={[-1.83333, 115.55]}>
                                            <Popup>
                                                Location {unitId}
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </Box>
                            </Box>
                        </Grid>


                        {/* Kolom kosong 3 */}
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

                        {/* Kolom kosong 2 diisi dengan Indicator Fault*/}
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <Box sx={{
                                height: '400px',
                                background: 'white', // Perbaiki warna menjadi putih
                                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)', // Lebih dalam shadow
                                borderRadius: '30px',
                                margin: '10px',
                                padding: '20px', // Tambahkan padding untuk estetika
                            }}>
                                {/* Judul di tengah box */}
                                <Typography variant="h6"
                                    color="textPrimary"
                                    sx={{
                                        textAlign: 'center',
                                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                                        marginBottom: '15px',
                                        color: 'red', // Warna merah untuk menarik perhatian
                                    }}
                                >
                                    Fault Indicator (Under Development)
                                </Typography>

                                <Grid container spacing={1} justifyContent="center">
                                    {cardData.map((data, index) => (
                                        <Grid item xs={4} sm={4} md={4} key={index} container justifyContent="center" alignItems="center">
                                            <Box display="flex" flexDirection="column" alignItems="center">
                                                {/* Lamp Indicator Flow*/}
                                                <IndicatorLamp
                                                    value={parseFloat(data.flow)} // Gunakan flow dari data JSON
                                                    maxValue={3000} // Batas maksimum sesuai kebutuhan
                                                />
                                                {/* Label untuk lamp indicator */}
                                                <Typography variant="subtitle1" sx={{ marginTop: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {'Over Flow Ind.'}
                                                </Typography>

                                                <Box sx={{ height: '10px' }} />

                                                {/* Lamp Indicator Temperature*/}
                                                <IndicatorLamp
                                                    value={parseFloat(data.pump_de_temperature)} // Gunakan temperature dari data JSON
                                                    maxValue={130} // Batas maksimum sesuai kebutuhan
                                                />
                                                {/* Label untuk lamp indicator */}
                                                <Typography variant="subtitle1" sx={{ marginTop: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {'Over Temp'}
                                                </Typography>

                                                <Box sx={{ height: '10px' }} />

                                                {/* Lamp Indicator Pressure*/}
                                                <IndicatorLamp
                                                    value={parseFloat(data.discharge_pressure)} // Gunakan pressure dari data JSON
                                                    maxValue={18} // Batas maksimum sesuai kebutuhan
                                                />
                                                {/* Label untuk lamp indicator */}
                                                <Typography variant="subtitle1" sx={{ marginTop: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {'Over Pressure'}
                                                </Typography>

                                                <Box sx={{ height: '10px' }} />

                                                {/* Lamp Indicator Engine Run Hour*/}
                                                <IndicatorLamp
                                                    value={parseFloat(data.engine_run_hour)} // Gunakan engine run hour dari data JSON
                                                    maxValue={10000} // Batas maksimum sesuai kebutuhan
                                                />
                                                {/* Label untuk lamp indicator */}
                                                <Typography variant="subtitle1" sx={{ marginTop: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {'Over Run Hour'}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                    {/* Menambahkan dua kolom tambahan untuk menampilkan data lebih banyak */}
                                    {cardData.map((data, index) => (
                                        <Grid item xs={4} sm={4} md={4} key={index + cardData.length} container justifyContent="center" alignItems="center">
                                            <Box display="flex" flexDirection="column" alignItems="center">
                                                {/* Lamp Indicator Fuel Rate*/}
                                                <IndicatorLamp
                                                    value={parseFloat(data.engine_fuel_rate)} // Gunakan fuel rate dari data JSON
                                                    maxValue={100} // Batas maksimum sesuai kebutuhan
                                                />
                                                {/* Label untuk lamp indicator */}
                                                <Typography variant="subtitle1" sx={{ marginTop: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {'Engine Fuel Rate'}
                                                </Typography>

                                                <Box sx={{ height: '10px' }} />

                                                {/* Lamp Indicator Vibration Y*/}
                                                <IndicatorLamp
                                                    value={parseFloat(data.pump_de_vib_y)} // Gunakan vibration Y dari data JSON
                                                    maxValue={5} // Batas maksimum sesuai kebutuhan
                                                />
                                                {/* Label untuk lamp indicator */}
                                                <Typography variant="subtitle1" sx={{ marginTop: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {'Pump Vibration Y'}
                                                </Typography>

                                                <Box sx={{ height: '10px' }} />

                                                {/* Lamp Indicator Vibration X*/}
                                                <IndicatorLamp
                                                    value={parseFloat(data.pump_de_vib_x)} // Gunakan vibration X dari data JSON
                                                    maxValue={5} // Batas maksimum sesuai kebutuhan
                                                />
                                                {/* Label untuk lamp indicator */}
                                                <Typography variant="subtitle1" sx={{ marginTop: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {'Pump Vibration X'}
                                                </Typography>

                                                <Box sx={{ height: '10px' }} />

                                                {/* Lamp Indicator Engine Load*/}
                                                <IndicatorLamp
                                                    value={parseFloat(data.engine_load)} // Gunakan engine load dari data JSON
                                                    maxValue={85} // Batas maksimum sesuai kebutuhan
                                                />
                                                {/* Label untuk lamp indicator */}
                                                <Typography variant="subtitle1" sx={{ marginTop: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {'Engine Load'}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}

                                    {cardData.map((data, index) => (
                                        <Grid item xs={4} sm={4} md={4} key={index + cardData.length} container justifyContent="center" alignItems="center">
                                            <Box display="flex" flexDirection="column" alignItems="center">
                                                {/* Lamp Indicator Fuel Rate*/}
                                                <IndicatorLamp
                                                    value={parseFloat(data.engine_fuel_rate)} // Gunakan fuel rate dari data JSON
                                                    maxValue={1} // Batas maksimum sesuai kebutuhan
                                                />
                                                {/* Label untuk lamp indicator */}
                                                <Typography variant="subtitle1" sx={{ marginTop: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {'Oil Lube Pressure'}
                                                </Typography>

                                                <Box sx={{ height: '10px' }} />

                                                {/* Lamp Indicator Data Engine Speed*/}
                                                <IndicatorLamp
                                                    value={parseFloat(data.engine_speed)} // Gunakan engine speed dari data JSON
                                                    maxValue={2000} // Batas maksimum sesuai kebutuhan
                                                />
                                                {/* Label untuk lamp indicator */}
                                                <Typography variant="subtitle1" sx={{ marginTop: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {'Engine Speed'}
                                                </Typography>

                                                <Box sx={{ height: '10px' }} />

                                                {/* Lamp Indicator Data Engine Load*/}
                                                <IndicatorLamp
                                                    value={parseFloat(data.engine_load)} // Gunakan engine load dari data JSON
                                                    maxValue={100} // Batas maksimum sesuai kebutuhan
                                                />
                                                {/* Label untuk lamp indicator */}
                                                <Typography variant="subtitle1" sx={{ marginTop: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {'Engine Load'}
                                                </Typography>

                                                <Box sx={{ height: '10px' }} />

                                                {/* Lamp Indicator Data Engine Fuel Rate*/}
                                                <IndicatorLamp
                                                    value={parseFloat(data.engine_fuel_rate)} // Gunakan engine fuel rate dari data JSON
                                                    maxValue={100} // Batas maksimum sesuai kebutuhan
                                                />
                                                {/* Label untuk lamp indicator */}
                                                <Typography variant="subtitle1" sx={{ marginTop: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {'Engine Fuel Rate'}
                                                </Typography>

                                            </Box>
                                        </Grid>
                                    ))}

                                </Grid>
                            </Box>
                        </Grid>


                    </Grid>
                </Grid>
            )}
        </Box>
    );

};

export default UnitPage;
