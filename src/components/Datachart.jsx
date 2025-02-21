import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, MenuItem, Select, Button, CircularProgress, Grid } from '@mui/material';
import dayjs from 'dayjs';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, } from 'chart.js';
import { fetchDataChart } from './dataService';

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend
);

const UNIT_IDS = [
    'KSB 60',
    'KSB 64',
    'KSB 67',
    'KSB 72'
];

const SP_FIELDS = [
    'FLOW',
    'PUMP_DE_TEMP',
    'PUMP_NDE_TEMP',
    'PUMP_DE_VIB_Y',
    'PUMP_NDE_VIB_X1',
    'PUMP_NDE_VIB_X2',
    'FLOW_TOTAL',
    'OIL_LUB_PRESS',
    'DISCHARGE_PRESSURE',
    'ENGINE_RUN_HOUR',
    'ENGINE_SPEED',
    'ENGINE_LOAD',
    'ENGINE_FUEL_CONSUMPTIONS',
    'ENGINE_OIL_PRESSURE',
    'ENGINE_BATTERY_VOLTAGE'
];

const DataChart = () => {
    const [unitId, setUnitId] = useState(UNIT_IDS[0]);
    const [spField, setSpField] = useState(SP_FIELDS[0]);
    const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [chartData, setChartData] = useState([]);
    const [chartLabels, setChartLabels] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFetchData = async () => {
        setLoading(true);
        try {
            const formattedStartDate = startDate.replace(/-/g, '');
            const formattedEndDate = endDate.replace(/-/g, '');

            if (!formattedStartDate || !formattedEndDate) {
                console.error("Invalid date format");
                return;
            }

            const response = await fetchDataChart(unitId, formattedStartDate, formattedEndDate, spField);
            if (response[spField]) {
                setChartLabels(Object.keys(response[spField]));
                setChartData(Object.values(response[spField]));
            } else {
                setChartLabels([]);
                setChartData([]);
            }
        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFetchData();
    }, [unitId, spField, startDate, endDate]);

    const chartConfig = {
        labels: chartLabels,
        datasets: [
            {
                label: spField,
                data: chartData,
                borderColor: '#42A5F5',
                fill: false,
            },
        ],
    };

    return (
        <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item xs={12} md={10} lg={8}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Historical Data Chart
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <Select
                                    fullWidth
                                    value={unitId}
                                    onChange={(e) => setUnitId(e.target.value)}
                                >
                                    {UNIT_IDS.map((unit) => (
                                        <MenuItem key={unit} value={unit}>
                                            {unit}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Select
                                    fullWidth
                                    value={spField}
                                    onChange={(e) => setSpField(e.target.value)}
                                >
                                    {SP_FIELDS.map((field) => (
                                        <MenuItem key={field} value={field}>
                                            {field}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleFetchData}
                            sx={{ mt: 2 }}
                        >
                            Fetch Data
                        </Button>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={10} lg={8}>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Box sx={{ p: 2 }}>
                        <Line data={chartConfig} />
                    </Box>
                )}
            </Grid>
        </Grid>
    );
};

export default DataChart;