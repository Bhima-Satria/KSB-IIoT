// OverviewPage.js
import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';


// Import image
import imageUnit1 from '../img/KSB64.webp'; // Replace with image path for unit 1
import imageUnit2 from '../img/KSB67.webp'; // Replace with image path for unit 2
import imageUnit3 from '../img/KSBDoubleDrive.webp'; // Replace with image path for unit 3

const OverviewPage = () => {
    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={2}>
                {/* Kolom 1 */}
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h5">KSB-Unit 64</Typography>

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
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        width: '100%',
                                        padding: '10px',
                                        marginBottom: '20px',
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
                                </Box>
                            </Grid>
                        )}
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
