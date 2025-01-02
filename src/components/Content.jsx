import React, { useState, useEffect, useRef } from 'react';
import { Typography, Button, Grid, Box } from '@mui/material';
import { CSSTransition } from 'react-transition-group';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Content = () => {
    const navigate = useNavigate(); // useNavigate for navigation
    const chartsData = [
        { id: 1, title: 'KSB 64', image: '/img/KSB64.webp' },
        { id: 2, title: 'KSB 67', image: '/img/KSB67.webp' },
        { id: 3, title: 'KSB Double Drive', image: '/img/KSBDoubleDrive.webp' },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [inProp, setInProp] = useState(true);
    const [isZoomingIn, setIsZoomingIn] = useState(false); // Control zoom in animation

    const imageRef = useRef(null); // Create a ref for the image container

    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 20000); // Change image every 20 seconds

        return () => clearInterval(interval); // Clear interval on component unmount
    }, []);

    const handleNext = () => {
        setInProp(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % chartsData.length);
            setInProp(true);
        }, 300); // Delay for animation
    };

    const handlePrev = () => {
        setInProp(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + chartsData.length) % chartsData.length);
            setInProp(true);
        }, 300); // Delay for animation
    };

    const handleImageClick = (title) => {
        setIsZoomingIn(true); // Start zoom-in animation
        document.title = "KSB IoT"; // Change page title
        setTimeout(() => {
            navigate(`/unit/${title}`); // Navigate after animation completes
        }, 500); // Delay navigation to match animation duration
    };

    return (
        <Box sx={{ p: 2, backgroundColor: 'white', minHeight: '100vh' }}>
            <Grid container spacing={2} sx={{ mt: 3 }} justifyContent="center">
                <Grid item xs={12} sm={6} md={4}>
                    <Box
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative', // Create position for the buttons
                        }}
                    >
                        {/* Title below image */}
                        <Typography
                            variant="h4"
                            align="center"
                            paddingLeft={5}
                            sx={{
                                color: 'black',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Shadow for visual effect
                                mb: 0, // Remove bottom margin to bring text closer to image
                                zIndex: 10, // Ensure text appears above the buttons
                                '&:hover': {
                                    textDecoration: 'underline', // Underline on hover
                                },
                            }}
                        >
                            {chartsData[currentIndex].title}
                        </Typography>

                        <Box
                            sx={{
                                height: 800,
                                width: 800,
                                my: 2,
                                transition: 'transform 0.5s ease, opacity 0.5s ease', // Smooth transition for hover effects
                                transform: isZoomingIn ? 'scale(1.2)' : 'scale(1)', // Zoom-in effect
                                opacity: isZoomingIn ? 0 : 1, // Fade out after zoom
                                '&:hover': { transform: 'scale(1.1)' }, // Enlarge image on hover
                                cursor: 'pointer',
                            }}
                            onClick={() => handleImageClick(chartsData[currentIndex].title)} // Navigate on image click
                        >
                            <CSSTransition
                                in={inProp}
                                timeout={300}
                                classNames="fade"
                                unmountOnExit
                            >
                                <img
                                    ref={imageRef} // Apply the ref directly
                                    src={chartsData[currentIndex].image}
                                    alt={chartsData[currentIndex].title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain', // Keep image intact without cropping
                                    }}
                                />
                            </CSSTransition>
                        </Box>

                        {/* Navigation buttons */}
                        <Button
                            variant="contained"
                            onClick={handlePrev}
                            sx={{
                                backgroundColor: 'transparent',
                                color: 'black',
                                fontSize: '8rem',
                                position: 'absolute',
                                left: '-30%',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                opacity: 0.08,
                                '&:hover': { backgroundColor: 'transparent' },
                                border: 'none',
                            }}
                        >
                            &#9664; {/* Left arrow icon */}
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{
                                backgroundColor: 'transparent',
                                color: 'black',
                                fontSize: '8rem',
                                position: 'absolute',
                                right: '-30%',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                opacity: 0.08,
                                '&:hover': { backgroundColor: 'transparent' },
                                border: 'none',
                            }}
                        >
                            &#9654; {/* Right arrow icon */}
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            {/* Animation CSS */}
            <style>
                {`
                    .fade-enter {
                        opacity: 0;
                    }
                    .fade-enter-active {
                        opacity: 1;
                        transition: opacity 300ms;
                    }
                    .fade-exit {
                        opacity: 1;
                    }
                    .fade-exit-active {
                        opacity: 0;
                        transition: opacity 300ms;
                    }
                `}
            </style>
        </Box>
    );
};

export default Content;
