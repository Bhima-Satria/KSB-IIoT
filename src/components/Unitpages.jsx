import React, { useEffect, useState } from 'react';
import { Grid, Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { fetchData } from './dataService';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';

// Import images according to unitId
import imageUnit1 from '../img/KSB-Unit 67.png'; // Replace with image path for unit 1
import imageUnit2 from '../img/KSB-Unit 68.png'; // Ganti dengan path gambar unit 2

// Register the required components for Chart.js
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const Bubble = ({ title, value, unit, Icon }) => {
    return (
        <Box
            sx={{
                width: '140px',
                height: 'auto',
                backgroundColor: '#FF8A00', // Warna latar utama
                borderRadius: '12px', // Membuat ujung bulat
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)', // Bayangan lembut awal
                padding: '10px',
                transition: 'all 0.3s ease', // Transisi halus untuk hover
                '&:hover': {
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)', // Menambah bayangan saat hover
                    transform: 'translateY(-4px)', // Mengangkat sedikit saat hover
                    backgroundColor: '#FF9E33', // Mengubah warna latar saat hover
                },
            }}
        >
            <Icon sx={{ fontSize: '20px', color: 'White', boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)' }} />
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                {title}
            </Typography>
            <Typography variant="h6" sx={{ color: 'white' }}>
                {value}{unit}
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
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
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
                    <Grid item xs={12}>
                        <Box sx={{
                            backgroundColor: 'white',
                            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                            display: 'flex',
                            alignItems: 'space-between',
                            position: 'relative',
                            marginTop: '1px',
                            padding: '16px',
                            borderRadius: '30px'
                        }}> {/* Atur marginTop untuk mengurangi jarak */}

                            <Box sx={{
                                height: '500px',
                                width: '100%',
                                padding: '12px',
                                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                borderRadius: '30px'
                            }}>
                                <Line data={chartData} options={{
                                    responsive: true,
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
                                }} />
                            </Box>

                            {window.innerWidth >= 600 && ( // Mengatur agar gambar hanya ditampilkan di atas ukuran layar minimum (misalnya 600px)
                                <img
                                    src={getImageByUnitId(unitId)}
                                    alt="Unit Visual"
                                    style={{
                                        width: 'auto', height: 'auto',
                                        marginRight: '10px',
                                        marginLeft: '10px',
                                        maxWidth: '27%',
                                        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                        borderRadius: '30px'
                                    }} // Ukuran gambar kecil dan margin kanan
                                />
                            )}

                            <Box sx={{
                                padding: '20px',
                                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                                borderRadius: '40px'
                            }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        sx={{
                                            fontSize: '1.5rem',
                                            textAlign: 'center',
                                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' // Menambahkan shadow pada teks
                                        }}
                                    >
                                        {unitId} Data
                                    </Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    {cardData.map((data, index) => (
                                        <Grid item xs={12} key={index}>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={3}>
                                                    <Bubble title="Flow" value={data.flow} unit=" L/m" Icon={Icons.AcUnitRounded} />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Bubble title="Temperature" value={data.pump_de_temperature} unit="°C" Icon={Icons.AcUnitRounded} />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Bubble title="Disch. Press" value={data.discharge_pressure} unit=" Bar" Icon={Icons.AcUnitRounded} />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Bubble title="Engine Run Hour" value={data.engine_run_hour} unit=" H" Icon={Icons.AcUnitRounded} />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Bubble title="Engine Speed" value={data.engine_speed} unit=" Rpm" Icon={Icons.AcUnitRounded} />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Bubble title="Engine Load" value={data.engine_load} unit=" %" Icon={Icons.AcUnitRounded} />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Bubble title="Fuel Rate" value={data.engine_fuel_rate} unit=" L" Icon={Icons.AcUnitRounded} />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Bubble title="Pump Vib Y" value={data.pump_de_vib_y} unit=" mm/s" Icon={Icons.AcUnitRounded} />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Bubble title="Pump Vib X" value={data.pump_de_vib_x} unit=" mm/s" Icon={Icons.AcUnitRounded} />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Bubble title="Total Flow" value={data.total_flow} unit=" L" Icon={Icons.AcUnitRounded} />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>


                        </Box>
                    </Grid>
                </Grid>
            )}
        </Box>
    );

};

export default UnitPage;
