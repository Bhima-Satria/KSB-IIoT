// Simpan referensi untuk timeout
let refreshTokenTimeout;
let activityTimeout;
let autoLoginTimeout;

// Fungsi untuk login
export const login = async (username, password) => {
    if (username === 'ksbengdev') {
        localStorage.setItem('currentUsername', 'ksbengdev');
        const token = await loginKsbengdev();
        setupAutoLoginForKsbengdev(); // Atur auto-login setiap 4 hari
        return token;
    } else {
        localStorage.setItem('currentUsername', username);
        const token = await loginUserPribadi(username, password);
        return token;
    }
};

// Fungsi untuk login ksbengdev
export const loginKsbengdev = async () => {
    const username = 'ksbengdev';
    const password = 'zWb3Uktb-NGK!vc';
    try {
        const loginUrl = 'https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/login';
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error('Failed to login: Invalid credentials or server error');
        }

        const data = await response.json();

        if (data.access_token && data.refresh_token) {
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);
            localStorage.setItem('ksbengdevLastLoginTime', Date.now());
            setRefreshTimeout(refreshKsbengdevToken, 270 * 1000); // Refresh setiap 4.5 menit
            return data.access_token;
        } else {
            throw new Error('No access token or refresh token found in the response');
        }
    } catch (error) {
        console.error('Login error:', error.message || error);
        throw error;
    }
};

// Fungsi untuk setup auto-login ksbengdev setiap 4 hari
const setupAutoLoginForKsbengdev = () => {
    if (autoLoginTimeout) {
        clearTimeout(autoLoginTimeout);
    }

    const fourDaysInMs = 4 * 24 * 60 * 60 * 1000; // 4 hari dalam milidetik
    autoLoginTimeout = setTimeout(async () => {
        console.log('Auto-login initiated for ksbengdev after 4 days.');
        await loginKsbengdev();
        setupAutoLoginForKsbengdev(); // Reset auto-login timer
    }, fourDaysInMs);
};

// Fungsi untuk refresh token ksbengdev
const refreshKsbengdevToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.warn('Refresh token not found for ksbengdev.');
            return;
        }

        const refreshUrl = 'https://ap-southeast-1bjzveseue.auth.ap-southeast-1.amazoncognito.com/oauth2/token';
        const clientCredentials = 'Basic cmhtOGw2YmEwZGo2YzVobXZ1OWkwMDRwaDoxZmUxbTI0ZWtxNWJkZ3B2MmwzY3RvbW9jZmQ1MGVvOTFocXE3NnNmYmE0czczZWQxc28w';

        const response = await fetch(refreshUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': clientCredentials,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token.');
        }

        const data = await response.json();

        if (data.access_token && data.expires_in) {
            localStorage.setItem('accessToken', data.access_token);

            // Set timeout untuk refresh berikutnya
            setRefreshTimeout(refreshKsbengdevToken, data.expires_in * 1000);
        } else {
            throw new Error('No access token in refresh response');
        }
    } catch (error) {
        console.error('Refresh token error for ksbengdev:', error.message || error);
        await loginKsbengdev(); // Lakukan login ulang jika refresh gagal
    }
};

// Helper untuk set timeout refresh token
const setRefreshTimeout = (callback, delay) => {
    if (refreshTokenTimeout) {
        clearTimeout(refreshTokenTimeout);
    }
    refreshTokenTimeout = setTimeout(callback, delay);
};

// Refresh token saat window load
window.addEventListener('load', () => {
    const currentUsername = localStorage.getItem('currentUsername');
    if (currentUsername === 'ksbengdev') {
        setupAutoLoginForKsbengdev();
        refreshKsbengdevToken();
    } else {
        refreshAccessToken();
    }
});

// Fungsi untuk menangani aktivitas pengguna
const resetActivityTimeout = () => {
    if (activityTimeout) {
        clearTimeout(activityTimeout); // Hapus timer sebelumnya
    }

    // Set timer baru untuk logout setelah 5 menit (300.000 ms)
    activityTimeout = setTimeout(() => {
        const currentUsername = localStorage.getItem('currentUsername');
        if (currentUsername === 'ksbengdev') {
            refreshKsbengdevToken(); // Jangan logout, hanya refresh token
        } else {
            logoutUser(); // Logout otomatis setelah 5 menit tidak ada aktivitas
        }
    }, 5 * 60 * 1000);
};

// Tambahkan event listener untuk mendeteksi aktivitas
window.addEventListener('mousemove', resetActivityTimeout);
window.addEventListener('keydown', resetActivityTimeout);
window.addEventListener('click', resetActivityTimeout);

// Memastikan timer di-reset ketika halaman dimuat
window.addEventListener('load', resetActivityTimeout);

// Fungsi untuk mengambil data
export const fetchData = async (unitId) => {
    try {
        let token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Access token not found');
        }

        const parsedUnitId = unitId.match(/ksb\s*(\d+)/i);
        if (!parsedUnitId || parsedUnitId.length < 2) {
            throw new Error('Invalid unitId format');
        }

        const unit = `KSB${parsedUnitId[1]}`;
        const apiUrl = `https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/${unit}/RealTime`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch real-time data');
        }

        const data = await response.json();

        const gpsApiUrl = `https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/${unit}/GPS`;
        const gpsResponse = await fetch(gpsApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!gpsResponse.ok) {
            throw new Error('Failed to fetch GPS data');
        }

        const gpsData = await gpsResponse.json();

        return {
            realTimeData: data.READ_REAL || {},
            coilData: data.READ_COIL || {},
            gpsData: gpsData.READ_GPS || {},
            serverName: data.server_name || '',
            date: data.date || '',
        };
    } catch (error) {
        console.error('Fetch data error:', error.message || error);
        throw error;
    }
};

// Refresh token saat window load
window.addEventListener('load', () => {
    const currentUsername = localStorage.getItem('currentUsername');
    if (currentUsername === 'ksbengdev') {
        refreshKsbengdevToken();
    } else {
        refreshAccessToken();
    }
});
