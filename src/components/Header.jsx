import React, { useState } from 'react';
import {
    AppBar, Toolbar, IconButton, Box, Button, Drawer, List,
    ListItem, ListItemText, Menu, MenuItem, useMediaQuery, useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { logout } from './dataService'; // Sesuaikan path dengan struktur proyek Anda

const Logo = '../img/ksblogo.png';

const LogoImage = styled('img')(({ theme }) => ({
    height: 40,
    marginRight: theme.spacing(2),
    cursor: 'pointer',
}));

const MenuButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(1),
    color: '#fff',
    textTransform: 'none',
    fontWeight: 'bold',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    transition: 'box-shadow 0.3s ease',
}));

const Header = () => {
    const [activeMenu, setActiveMenu] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const chartsData = [
        { id: 1, title: 'KSB 60' },
        { id: 2, title: 'KSB 64' },
        { id: 3, title: 'KSB 67' },
        { id: 4, title: 'KSB 72' },
    ];

    // Navigasi dengan window.location.href untuk memastikan reload penuh
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

                {/* Menu Icon untuk layar kecil */}
                <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="menu"
                    sx={{ display: { xs: 'block', sm: 'none' } }}
                    onClick={() => toggleDrawer(true)}
                >
                    <MenuIcon />
                </IconButton>

                {!isSmallScreen && (
                    <Box sx={{ display: 'flex', alignItems: 'center', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        {chartsData.map((item) => (
                            <MenuButton
                                key={item.id}
                                onClick={() => handleMenuClick(item.title)}
                                className={activeMenu === item.title ? 'active' : ''}
                                sx={{
                                    backgroundColor: activeMenu === item.title ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                                }}
                            >
                                {item.title}
                            </MenuButton>
                        ))}
                        <IconButton onClick={handleClick} color="inherit">
                            <ArrowDropDownIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>

            {/* Sidebar Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => toggleDrawer(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: '#0A2540',
                        color: '#fff',
                    },
                }}
            >
                <Box sx={{ width: 250, padding: '20px' }}>
                    <List>
                        {chartsData.map((item) => (
                            <ListItem
                                button
                                key={item.id}
                                onClick={() => {
                                    handleMenuClick(item.title);
                                    toggleDrawer(false);
                                }}
                                selected={activeMenu === item.title}
                            >
                                <ListItemText primary={item.title} />
                            </ListItem>
                        ))}
                        <ListItem button onClick={handleLogout}>
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
        </AppBar>
    );
};

export default Header;
