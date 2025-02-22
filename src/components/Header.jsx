import React, { useState } from 'react';
import {
    AppBar, Toolbar, IconButton, Box, Drawer, List,
    ListItem, ListItemText, Menu, MenuItem, useMediaQuery, useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { logout } from './dataService'; // Sesuaikan path dengan struktur proyek Anda

const Logo = '../img/ksblogo.png';

const LogoImage = styled('img')(({ theme }) => ({
    height: 40,
    marginRight: theme.spacing(2),
    cursor: 'pointer',
}));

const Header = () => {
    const [activeMenu, setActiveMenu] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const theme = useTheme();

    const chartsData = [
        { id: 1, title: 'KSB 60' },
        { id: 2, title: 'KSB 64' },
        { id: 3, title: 'KSB 67' },
        { id: 4, title: 'KSB 72' },
    ];

    const handleMenuClick = (title) => {
        setActiveMenu(title);
        if (title === 'KSB 72') {
            window.location.href = `/Unit_DD/${title}`;
        } else {
            window.location.href = `/unit/${title}`;
        }
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login'; // Setelah logout, redirect ke halaman login
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const toggleDrawer = (open) => {
        setDrawerOpen(open);
    };

    return (
        <AppBar
            position="static"
            sx={{
                background: 'linear-gradient(180deg, rgba(51, 102, 153, 1) 30%, rgba(0, 32, 64, 1) 70%)',
                minHeight: '64px',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', position: 'relative', height: '64px' }}>
                {/* Logo */}
                <IconButton edge="start" color="inherit" aria-label="logo" onClick={() => window.location.href = '/'}>
                    <LogoImage src={Logo} alt="Logo" />
                </IconButton>

                {/* Menu Icon untuk layar kecil dan besar */}
                <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="menu"
                    onClick={() => toggleDrawer(true)}
                    sx={{ display: 'block' }}
                >
                    <MenuIcon />
                </IconButton>
            </Toolbar>

            {/* Sidebar Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => toggleDrawer(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: '200px',
                        height: '100%',
                        background: 'linear-gradient(180deg, rgba(51, 102, 153, 100%) 30%, rgba(0, 32, 64, 0.7) 100%)',
                        overflowY: 'auto',
                        padding: '10px',
                        color: 'white',
                        borderRadius: '5px',
                    },
                }}
            >
                {/* Header Box */}
                <Box
                    sx={{
                        background: 'linear-gradient(180deg, rgba(51, 102, 153, 1) 30%, rgba(0, 32, 64, 1) 70%)',
                        padding: '5px',
                        borderRadius: '5px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: 'white',
                        marginBottom: '5px',
                    }}
                >
                    Unit List
                </Box>

                <List disablePadding>
                    {/* Chart Menu Items */}
                    {chartsData.map((item) => (
                        <ListItem
                            key={item.id}
                            onClick={() => {
                                handleMenuClick(item.title);
                                toggleDrawer(false); // Close drawer after selection
                            }}
                            selected={activeMenu === item.title}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                color: 'white',
                                backgroundColor: activeMenu === item.title ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                                padding: '5px',
                            }}
                        >
                            <ListItemText
                                primary={item.title}
                                sx={{
                                    fontSize: '12px',
                                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', // Text shadow effect
                                }}
                            />
                        </ListItem>
                    ))}
                </List>

                {/* Logout Button at Bottom */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '30px', // 30px from the bottom of the Drawer
                        left: 0,
                        width: '100%',
                        textAlign: 'center',
                    }}
                >
                    <button
                        style={{
                            width: '100%',
                            padding: '8px 10px', // Adjusted padding for a smaller button
                            backgroundColor: 'rgba(255, 255, 255, 0.15)', // Similar background to list items
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '12px', // Text size adjusted to 12px
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', // Matching text shadow effect
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)', // Hover effect similar to list items
                                transform: 'scale(1.05)', // Slight scale effect on hover
                            },
                            '&:active': {
                                transform: 'scale(1)', // Shrink back to normal size on click
                                backgroundColor: 'rgba(255, 255, 255, 0.4)', // Slightly brighter on active
                            },
                        }}
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </Box>
            </Drawer>

        </AppBar>
    );
};

export default Header;
