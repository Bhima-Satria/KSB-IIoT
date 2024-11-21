import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

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
    '&.active': {
        borderBottom: '2px solid #fff', // Menambahkan border bawah untuk tombol aktif
        fontSize: '1.8rem', // Ukuran font lebih besar saat tombol aktif
    },
    transition: 'opacity 0.3s ease, transform 0.5s ease, font-size 0.3s ease', // Transisi untuk opacity dan transform
}));

const Header = () => {
    const [headerTitle, setHeaderTitle] = useState(''); // Judul awal kosong
    const [activeMenu, setActiveMenu] = useState('');
    const [isButtonClicked, setIsButtonClicked] = useState(false); // Menandakan apakah tombol sudah diklik
    const navigate = useNavigate();

    const chartsData = [
        { id: 1, title: 'KSB-Unit 60' },
        { id: 2, title: 'KSB-Unit 64' },
        { id: 3, title: 'KSB-Unit 67' },
        { id: 4, title: 'KSB-Double Drive' },
        { id: 5, title: 'Overview' },
        { id: 6, title: 'Tes API' },
    ];

    const handleMenuClick = (title) => {
        setHeaderTitle(title); // Set title saat tombol diklik
        setActiveMenu(title); // Menandai menu yang aktif
        setIsButtonClicked(true); // Mengatur tombol diklik
        if (title === 'Overview') {
            navigate('/Overview');
        } else if (title === 'Tes API') {
            navigate('/API');
        } else {
            navigate(`/unit/${title}`);
        }
    };

    const handleLogoClick = () => {
        setHeaderTitle(''); // Menghapus title saat logo diklik
        setActiveMenu(''); // Menghapus penanda aktif
        setIsButtonClicked(false); // Reset tombol
        navigate('/');
    };

    return (
        <AppBar position="static" sx={{ background: 'linear-gradient(180deg, rgba(51, 102, 153, 1) 30%, rgba(0, 32, 64, 1) 70%)', minHeight: '64px' }}>
            <Toolbar sx={{ justifyContent: 'space-between', position: 'relative', height: '64px' }}>
                {/* Logo */}
                <IconButton edge="start" color="inherit" aria-label="logo" onClick={handleLogoClick}>
                    <LogoImage src={Logo} alt="Logo" />
                </IconButton>

                {/* Judul yang akan muncul setelah tombol diklik */}
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    {headerTitle && (
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 'bold',
                                color: '#fff',
                                fontSize: '1.5rem',
                                letterSpacing: '0.05em',
                                position: 'absolute', // Pastikan title berada di tengah header
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)', // Memastikan title di tengah
                                transition: 'opacity 0.5s ease', // Efek transisi untuk title
                                opacity: isButtonClicked ? 1 : 0, // Mengubah opacity sesuai dengan ada tidaknya title
                                marginLeft : '210px'
                            }}
                        >
                            {headerTitle}
                        </Typography>
                    )}
                </Box>

                {/* Menu Items */}
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    {chartsData.map((item) => (
                        <MenuButton
                            key={item.id}
                            onClick={() => handleMenuClick(item.title)}
                            className={activeMenu === item.title ? 'active' : ''}
                            sx={{
                                opacity: activeMenu === item.title && isButtonClicked ? 0 : 1, // Mengatur opacity tombol yang aktif ke 0 setelah diklik
                                transform: activeMenu === item.title && isButtonClicked
                                    ? 'translate(-50%, -50%)' // Pergeseran tombol aktif ke tengah
                                    : 'none', // Tombol yang tidak aktif tetap di posisi aslinya
                                width: 'unset',
                                position: activeMenu === item.title && isButtonClicked ? 'absolute' : 'relative', // Tombol yang aktif di-set absolute
                                top: activeMenu === item.title && isButtonClicked ? '50%' : 'auto', // Tombol yang aktif bergerak ke tengah
                                left: activeMenu === item.title && isButtonClicked ? '50%' : 'auto', // Tombol yang aktif bergerak ke tengah
                                transition: 'opacity 0.5s ease, transform 0.5s ease',
                            }}
                        >
                            {item.title}
                        </MenuButton>
                    ))}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
