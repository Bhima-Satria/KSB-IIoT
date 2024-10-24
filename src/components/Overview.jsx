import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

import imageUnit1 from '../img/KSB64.webp'; // Pastikan untuk mengganti dengan path gambar yang sesuai
import imageUnit2 from '../img/KSB67.webp'; // Pastikan untuk mengganti dengan path gambar yang sesuai
import imageUnit3 from '../img/KSBDoubleDrive.webp'; // Pastikan untuk mengganti dengan path gambar yang sesuai

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
