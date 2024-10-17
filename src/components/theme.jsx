// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Atur mode menjadi 'light'
    primary: {
      main: '#336699', // Warna utama (biru navy)
    },
    secondary: {
      main: '#dc004e', // Warna sekunder (merah)
    },
    background: {
      default: '#ffffff', // Warna latar belakang
      paper: '#f5f5f5', // Warna latar belakang kertas
    },
    text: {
      primary: '#000000', // Warna teks utama (hitam)
      secondary: '#333333', // Warna teks sekunder (abu-abu gelap)
    },
  },
});

export default theme;
