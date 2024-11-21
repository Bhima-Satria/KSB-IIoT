import React, { useEffect, useState } from 'react';
import { fetchData } from './dataService';
import * as Icons from '@mui/icons-material';
import { Grid, Box, Card, CardContent, Typography, Paper, CircularProgress} from '@mui/material';


// Path ke gambar langsung
const imageUnit1 = '/img/KSB67.webp';
const imageUnit2 = '/img/KSB64.webp';
const imageUnit3 = '/img/KSBDoubleDrive.webp';


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



const OverviewPage = () => {
    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={2}>
                {/* Kolom 1 */}
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h5">KSB-Unit 64</Typography>

                        {/* Gambar di tengah */}
                        <Box sx={{
                            height: '400px',
                            backgroundColor: 'white',
                            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                            borderRadius: '30px',
                            margin: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img
                                src={imageUnit1}
                                alt="Unit Visual"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxWidth: '450px',
                                    borderRadius: '20px',
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <CardStatus title="Motor 1" value={1} lastUpdatedDate="2021-10-10 10:00:00" />
                        </Box>
                    </Paper>
                </Grid>

                {/* Kolom 2 */}
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h5">KSB-Unit 67</Typography>
                        {/* Gambar di tengah */}
                        <Box sx={{
                            height: '400px',
                            backgroundColor: 'white',
                            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                            borderRadius: '30px',
                            margin: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img
                                src={imageUnit2}
                                alt="Unit Visual"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxWidth: '450px',
                                    borderRadius: '20px',
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* Kolom 3 */}
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h5">KSB-Double Drive</Typography>
                        {/* Gambar di tengah */}
                        <Box sx={{
                            height: '400px',
                            backgroundColor: 'white',
                            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                            borderRadius: '30px',
                            margin: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img
                                src={imageUnit3}
                                alt="Unit Visual"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxWidth: '450px',
                                    borderRadius: '20px',
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OverviewPage;
