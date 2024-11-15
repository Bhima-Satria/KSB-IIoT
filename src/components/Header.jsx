import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, ButtonBase } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import { useNavigate } from 'react-router-dom';
import Logo from '../img/ksblogo.png';

const LogoImage = styled('img')(({ theme }) => ({
    height: 40,
    marginRight: theme.spacing(2),
    cursor: 'pointer',
}));

const Sidebar = styled(Box)(({ theme }) => ({
    width: 270,
    height: '100%',
    background: 'linear-gradient(180deg, rgba(51, 102, 153, 1) 30%, rgba(0, 32, 64, 1) 70%)',
    color: '#fff',
}));

const Header = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [headerTitle, setHeaderTitle] = useState('');
    const navigate = useNavigate();

    const chartsData = [
        { id: 1, title: 'KSB-Unit 60' },
        { id: 2, title: 'KSB-Unit 64' },
        { id: 3, title: 'KSB-Unit 67' },
        { id: 4, title: 'KSB-Double Drive' },
        { id: 5, title: 'Overview' },
        { id: 6, title: 'Tes API' },
    ];

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleMenuClick = (title) => {
        setHeaderTitle(title);
        if (title === 'Overview') {
            navigate('/Overview');
        } else if (title === 'Tes API') {
            navigate('/API');
        } else {
            navigate(`/unit/${title}`);
        }
        handleDrawerToggle();
    };

    const handleLogoClick = () => {
        setHeaderTitle('');
        navigate('/');
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
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                            fontWeight: 'bold',
                            color: '#fff',
                            fontSize: '1.5rem',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {headerTitle}
                    </Typography>
                </Box>

                <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleDrawerToggle}
                    sx={{ marginRight: 2 }}
                >
                    <MenuIcon />
                </IconButton>
            </Toolbar>

            <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
                <Sidebar role="presentation" onClick={handleDrawerToggle} onKeyDown={handleDrawerToggle}>
                    <Box sx={{ textAlign: 'center', padding: 2 }}>
                        <LogoImage src={Logo} alt="Logo" onClick={handleLogoClick} />
                    </Box>

                    <Divider sx={{ backgroundColor: '#fff', marginY: 1 }} />

                    <List>
                        {chartsData.map((item) => (
                            <ListItem
                                key={item.id}
                                component={ButtonBase} // Use ButtonBase to make it clickable
                                onClick={() => handleMenuClick(item.title)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                    cursor: 'pointer',
                                }}
                            >
                                <ListItemIcon>
                                    <FiberManualRecordRoundedIcon sx={{ color: '#fff', fontSize: '20px' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.title}
                                    sx={{
                                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                                        color: '#fff',
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
