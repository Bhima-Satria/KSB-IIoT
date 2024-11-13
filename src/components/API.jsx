import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { fetchData } from './dataService'; // Pastikan path ini benar ke file fetchData.js

const UnitPage = () => {
    const [cardData, setCardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isDataEmpty, setIsDataEmpty] = useState(false);
    const [parsedDate, setParsedDate] = useState('');

    const unitId = "KSB-Unit 67"; // Ganti dengan unitId yang sesuai

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
            const newFlowData = [...prevData.datasets[0].data, newData.FLOW];
            const newTemperatureData = [...prevData.datasets[1].data, newData.PUMP_DE_TEMP];
            const newDischargePressureData = [...prevData.datasets[2].data, newData.DISCHARGE_PRESSURE];

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
                // Fetch data menggunakan fetchData
                const response = await fetchData(unitId);
    
                // Periksa apakah data ada
                if (!response || !response.server_name || !response.date) {
                    setCardData(null); // Set data ke null jika tidak ada
                    setIsDataEmpty(true);
                    return;
                }
    
                // Set data ke state cardData
                setCardData(response);
    
                // Ambil tanggal update terakhir dari response data
                const lastUpdated = response.date || "No date available";
                setLastUpdated(lastUpdated);
    
                // Parsing tanggal dalam format "DD/MM/YYYY HH:mm:ss"
                const parseDate = (dateStr) => {
                    const [day, month, year, hour, minute, second] = dateStr.split(/[\s/:]/);
                    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
                };
    
                const dateObj = parseDate(lastUpdated);
                const options = {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                };
    
                // Periksa apakah tanggal valid
                if (isNaN(dateObj.getTime())) {
                    setParsedDate("Invalid Date");
                } else {
                    setParsedDate(dateObj.toLocaleString('en-GB', options));
                }
    
                // Ambil data dari response dan pastikan properti yang diperlukan ada
                const realData = response.READ_REAL;
    
                if (realData) {
                    const realDataObj = {
                        label: dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                        FLOW: realData.FLOW || 0, // Langsung akses data
                        PUMP_DE_TEMP: realData.PUMP_DE_TEMP || 0, // Langsung akses data
                        DISCHARGE_PRESSURE: realData.DISCHARGE_PRESSURE || 0 // Langsung akses data
                    };
    
                    // Menambahkan data baru ke chartData
                    addData(realDataObj);
                } else {
                    console.warn("READ_REAL data is missing or malformed");
                }
    
                setIsDataEmpty(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsDataEmpty(true);
            } finally {
                setLoading(false);
            }
        };
    
        // Panggil getData pertama kali
        getData();
    
        // Set interval untuk mengambil data setiap 1000ms (1 detik)
        const intervalId = setInterval(getData, 1000);
    
        // Bersihkan interval saat komponen unmount
        return () => clearInterval(intervalId);
    }, [unitId]); // Trigger ulang jika unitId berubah
     // Trigger ulang jika unitId berubah

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <h1>Unit Page: {unitId}</h1>
            <p><strong>Last Updated:</strong> {parsedDate}</p>

            <h2>Real-Time Data</h2>
            <div>
                {cardData ? (
                    <div>
                        <p><strong>Server Name:</strong> {cardData.server_name}</p>
                        <p><strong>Date:</strong> {cardData.date}</p>
                        {/* Tampilkan data langsung */}
                        <p><strong>Flow:</strong> {cardData.READ_REAL.FLOW}</p>
                        <p><strong>Temperature (Pump DE):</strong> {cardData.READ_REAL.PUMP_DE_TEMP} °C</p>
                        <p><strong>Discharge Pressure:</strong> {cardData.READ_REAL.DISCHARGE_PRESSURE} Bar</p>
                    </div>
                ) : (
                    <p>No data available for this unit.</p>
                )}
            </div>

            {/* Tampilkan chart data */}
            <div>
                {/* Implementasi chart dengan chart.js atau pustaka chart lainnya */}
            </div>
        </div>
    );
};

export default UnitPage;