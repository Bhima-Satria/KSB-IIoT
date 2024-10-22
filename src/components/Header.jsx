import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu'; // Icon for the hamburger menu
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded'; // Icon for each unit in the list
import { useNavigate } from 'react-router-dom'; // For navigation between routes
import Logo from '../img/ksblogo.png'; // Path to the logo image

// Styled component for the logo image
const LogoImage = styled('img')(({ theme }) => ({
    height: 40, // Logo height
    marginRight: theme.spacing(2),
    cursor: 'pointer', // Changes cursor to pointer on hover
}));

// Styled component for the sidebar
const Sidebar = styled(Box)(({ theme }) => ({
    width: 270, // Width of the sidebar
    height: '100%', // Full height
    background: 'linear-gradient(180deg, rgba(51, 102, 153, 1) 30%, rgba(0, 32, 64, 1) 70%)', // Gradient background
    color: '#fff', // Text color
}));

const Header = () => {
    const [drawerOpen, setDrawerOpen] = useState(false); // State for controlling the sidebar's open/close status
    const [headerTitle, setHeaderTitle] = useState('KSB IoT Product'); // Set initial title
    const navigate = useNavigate(); // Hook for navigation

    // Data for the units displayed in the sidebar
    const chartsData = [
        { id: 1, title: 'KSB-Unit 67' },
        { id: 2, title: 'KSB-Unit 68' },
        { id: 3, title: 'KSB-Unit 69' },
        { id: 4, title: 'KSB-Unit 70' },
        { id: 5, title: 'KSB-Unit 71' },
        { id: 6, title: 'KSB-Unit 72' },
        { id: 7, title: 'KSB-Unit 73' },
        { id: 8, title: 'KSB-Unit 74' },
        { id: 9, title: 'KSB-Unit 75' },
        { id: 10, title: 'KSB-Unit 76' },
        { id: 11, title: 'KSB-Unit 77' },
        { id: 12, title: 'KSB-Unit 78' },
    ];

    // Function to toggle the sidebar
    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    // Function to navigate to a specific unit's page and close the sidebar
    const handleMenuClick = (title) => {
        setHeaderTitle(title); // Update header title based on clicked unit
        navigate(`/unit/${title}`); // Navigates to the unit's page
        handleDrawerToggle(); // Closes the sidebar
    };

    // Function to navigate back to the home page when the logo is clicked
    const handleLogoClick = () => {
        setHeaderTitle('KSB IoT Product'); // Reset to the initial title when going home
        navigate('/'); // Navigate back to home
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="logo" onClick={handleLogoClick}>
                    <LogoImage src={Logo} alt="Logo" />
                </IconButton>

                <Box sx={{ flexGrow: 1 }}>
                    <Typography
                        variant="h6"
                        component="div"
                        align="center"
                        marginRight={8}
                        sx={{
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Text shadow effect
                            fontWeight: 'bold', // Bold text
                            color: '#fff', // White text color
                            fontSize: '1.5rem', // Font size
                            letterSpacing: '0.05em', // Letter spacing
                        }}
                    >
                        {headerTitle} {/* Display the current title */}
                    </Typography>
                </Box>

                {/* Button to open the sidebar */}
                <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleDrawerToggle}
                    sx={{ marginRight: 2 }} // Margin on the right side
                >
                    <MenuIcon />
                </IconButton>
            </Toolbar>

            {/* Sidebar Drawer */}
            <Drawer
                anchor="right" // Drawer opens from the right
                open={drawerOpen}
                onClose={handleDrawerToggle} // Close drawer when clicking outside or pressing ESC
            >
                <Sidebar
                    role="presentation"
                    onClick={handleDrawerToggle} // Closes the sidebar when an item is clicked
                    onKeyDown={handleDrawerToggle}
                >
                    <Box sx={{ textAlign: 'center', padding: 2 }}>
                        <LogoImage src={Logo} alt="Logo" onClick={handleLogoClick} /> {/* Logo with navigation */}
                    </Box>

                    <Typography
                        variant="h6"
                        sx={{
                            padding: 0,
                            textAlign: 'center',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)', // Text shadow for the sidebar title
                            color: '#fff', // White text color
                            borderRadius: '4px', // Rounded corners for the title
                        }}
                    >
                        {/* Optional Sidebar Title */}
                    </Typography>

                    <Divider sx={{ backgroundColor: '#fff', marginY: 1 }} /> {/* Divider line */}

                    <List>
                        {chartsData.map((item) => (
                            <ListItem
                                button
                                key={item.id} // Changed key to id for better uniqueness
                                onClick={() => handleMenuClick(item.title)} // Handle item click
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Background color on hover
                                    },
                                    cursor: 'pointer', // Pointer cursor on hover
                                }}
                            >
                                <ListItemIcon>
                                    <FiberManualRecordRoundedIcon sx={{ color: '#fff', fontSize: '20px' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.title}
                                    sx={{
                                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', // Text shadow for unit titles
                                        color: '#fff', // White text color
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Sidebar>
            </Drawer>
        </AppBar>
    );
};

export default Header;
