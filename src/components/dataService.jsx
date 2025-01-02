// Fungsi untuk login
export const login = async (username, password) => {
    if (username === 'ksbengdev') {
        const token = await loginKsbengdev();
        return token;
    } else {
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
            setTimeout(refreshKsbengdevToken, 270 * 1000); // Refresh setiap 1 jam
            return data.access_token;
        } else {
            throw new Error('No access token or refresh token found in the response');
        }
    } catch (error) {
        console.error('Login error:', error.message || error);
        throw error;
    }
};

// Fungsi untuk login pengguna pribadi
export const loginUserPribadi = async (username, password) => {
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
            return data.access_token;
        } else {
            throw new Error('No access token or refresh token found in the response');
        }
    } catch (error) {
        console.error('Login error:', error.message || error);
        throw error;
    }
};

// Fungsi untuk refresh token ksbengdev
const refreshKsbengdevToken = async () => {
    try {
        const refreshUrl = 'https://ap-southeast-1bjzveseue.auth.ap-southeast-1.amazoncognito.com/oauth2/token';
        const clientCredentials = 'Basic cmhtOGw2YmEwZGo2YzVobXZ1OWkwMDRwaDoxZmUxbTI0ZWtxNWJkZ3B2MmwzY3RvbW9jZmQ1MGVvOTFocXE3NnNmYmE0czczZWQxc28w';

        const refreshToken = localStorage.getItem('refreshToken'); // Ambil refresh token dari localStorage

        if (!refreshToken) {
            throw new Error('No refresh token found for ksbengdev');
        }

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
            throw new Error('Failed to refresh token for ksbengdev');
        }

        const data = await response.json();

        if (data.access_token && data.expires_in) {
            localStorage.setItem('accessToken', data.access_token); // Simpan access token baru
            setTimeout(refreshKsbengdevToken, data.expires_in * 1000); // Refresh berdasarkan expires_in
        } else {
            throw new Error('No access token in refresh response');
        }
    } catch (error) {
        console.error('Refresh token error for ksbengdev:', error.message || error);
    }
};


// Fungsi untuk refresh token pengguna pribadi
const refreshAccessTokenForUser = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token found for the user.');
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
            throw new Error('Failed to refresh token for the user.');
        }

        const data = await response.json();

        if (data.access_token && data.expires_in) {
            localStorage.setItem('accessToken', data.access_token);
            setTimeout(refreshAccessTokenForUser, data.expires_in * 1000);
        } else {
            throw new Error('No access token in refresh response');
        }
    } catch (error) {
        console.error('Refresh token error for user:', error.message || error);
        logoutUser();
    }
};

// Logout pengguna pribadi
const logoutUser = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('ksbengdevLastLoginTime');
    window.location.href = '/login';
};

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

// Refresh token ksbengdev saat window load
window.addEventListener('load', () => {
    refreshKsbengdevToken();
});
