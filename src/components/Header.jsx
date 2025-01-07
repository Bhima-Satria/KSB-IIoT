import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Box, Button, Drawer, List, ListItem, ListItemText, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { logout } from './dataService'; // Sesuaikan path dengan struktur proyek Anda
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // Import ikon dropdown

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
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Warna hover tetap ada
    },
    transition: 'box-shadow 0.3s ease', // Transisi halus untuk bayangan
}));

const Header = () => {
    const [activeMenu, setActiveMenu] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false); // Untuk membuka/menutup drawer
    const [anchorEl, setAnchorEl] = useState(null); // Untuk dropdown menu
    const navigate = useNavigate();

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Menentukan apakah ukuran layar kecil

    // Simulasi data
    const chartsData = [
        { id: 1, title: 'KSB 60' },
        { id: 2, title: 'KSB 64' },
        { id: 3, title: 'KSB 67' },
        { id: 4, title: 'KSB Double Drive' },
    ];

    const handleMenuClick = (title) => {
        setActiveMenu(title); // Menandai menu yang aktif
        if (title === 'Overview') {
            navigate('/Overview');
        } else {
            navigate(`/unit/${title}`);
        }
    };

    // Fungsi untuk logout
    const handleLogout = async () => {
        await logout(navigate);
    };

    // Fungsi untuk membuka dan menutup dropdown menu
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget); // Set anchorEl untuk posisi menu
    };

    const handleClose = () => {
        setAnchorEl(null); // Menutup dropdown menu
    };

    // Toggle drawer (sidebar)
    const toggleDrawer = (open) => {
        setDrawerOpen(open);
    };

    return (
        <AppBar position="static" sx={{ background: 'linear-gradient(180deg, rgba(51, 102, 153, 1) 30%, rgba(0, 32, 64, 1) 70%)', minHeight: '64px' }}>
            <Toolbar sx={{ justifyContent: 'space-between', position: 'relative', height: '64px' }}>
                {/* Logo */}
                <IconButton edge="start" color="inherit" aria-label="logo" onClick={() => navigate('/')}>
                    <LogoImage src={Logo} alt="Logo" />
                </IconButton>

                {/* Icon Button untuk membuka Sidebar (Drawer) saat ukuran layar kecil */}
                <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="menu"
                    sx={{ display: { xs: 'block', sm: 'none' } }} // Hanya tampil di layar kecil
                    onClick={() => toggleDrawer(true)}
                >
                    <MenuIcon />
                </IconButton>

                {/* Menu Items yang hanya ditampilkan di layar besar */}
                {!isSmallScreen && (
                    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        {chartsData.map((item) => (
                            <MenuButton
                                key={item.id}
                                onClick={() => handleMenuClick(item.title)}
                                className={activeMenu === item.title ? 'active' : ''}
                                sx={{
                                    backgroundColor: activeMenu === item.title ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    }
                                }}
                            >
                                {item.title}
                            </MenuButton>
                        ))}
                        {/* Tombol Dropdown dengan ikon panah */}
                        <IconButton onClick={handleClick} color="inherit">
                            <ArrowDropDownIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            {/* Opsi Logout */}
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>

            {/* Sidebar / Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => toggleDrawer(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: '#0A2540', // Warna latar belakang sidebar
                        color: '#fff', // Warna teks
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
                                    toggleDrawer(false); // Tutup drawer setelah klik
                                }}
                                selected={activeMenu === item.title}
                            >
                                <ListItemText primary={item.title} />
                            </ListItem>
                        ))}
                        {/* Tombol Logout di Sidebar */}
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
