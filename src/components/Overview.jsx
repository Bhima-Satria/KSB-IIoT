import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import imageUnit1 from '../img/KSB64.webp'; // Pastikan untuk mengganti dengan path gambar yang sesuai

const OverviewPage = () => {
    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={2}>
                {/* Kolom 1 */}
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center', position: 'relative' }}>
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

                        {/* SVG untuk menggambar garis */}
                        <svg height="100%" width="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                            {/* Garis dari gambar ke area discharge */}
                            <line 
                                x1="225" 
                                y1="400" 
                                x2="300" 
                                y2="100" 
                                stroke="blue" 
                                strokeWidth="2" 
                                markerEnd="url(#arrowhead)" 
                            />
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                                    refX="5" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="blue" />
                                </marker>
                            </defs>
                        </svg>
                    </Paper>
                </Grid>

                {/* Kolom 2 */}
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h5">KSB-Unit 67</Typography>
                        <Typography variant="body1">Detail dan informasi unit 67.</Typography>
                    </Paper>
                </Grid>

                {/* Kolom 3 */}
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h5">KSB-Double Drive</Typography>
                        <Typography variant="body1">Detail dan informasi unit double drive.</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OverviewPage;
