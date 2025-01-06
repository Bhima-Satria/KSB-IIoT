// Global timeouts
let refreshTokenTimeout;
let activityTimeout;
let autoLoginTimeout;

// Login function
export const login = async (username, password) => {
    if (username === 'ksbengdev' && password === 'zWb3Uktb-NGK!vc') {
        const token = await loginKsbengdev();
        setupAutoLoginForKsbengdev();
        return token;
    } else {
        return await loginUserPribadi(username, password);
    }
};

// Helper function to set timeout for refreshing the token
const setRefreshTimeout = (callback, delay) => {
    if (refreshTokenTimeout) {
        clearTimeout(refreshTokenTimeout);
    }
    refreshTokenTimeout = setTimeout(callback, delay);
};

// Login function for ksbengdev
export const loginKsbengdev = async () => {
    const username = 'ksbengdev';
    const password = 'zWb3Uktb-NGK!vc';
    try {
        const loginUrl = 'https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/login';
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) throw new Error('Failed to login');

        const data = await response.json();
        saveTokenData(data);
        setRefreshTimeout(refreshKsbengdevToken, 270 * 1000); // 4.5 minutes
        return data.access_token;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Login function for personal users
export const loginUserPribadi = async (username, password) => {
    try {
        const loginUrl = 'https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/login';
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) throw new Error('Failed to login');

        const data = await response.json();
        saveTokenData(data);
        return data.access_token;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Save token data to localStorage
const saveTokenData = (data) => {
    if (data.access_token && data.refresh_token) {
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('lastLoginTime', Date.now());
    }
};

// Auto-login setup for ksbengdev
const setupAutoLoginForKsbengdev = () => {
    if (autoLoginTimeout) clearTimeout(autoLoginTimeout);
    autoLoginTimeout = setTimeout(async () => {
        await loginKsbengdev();
        setupAutoLoginForKsbengdev();
    }, 4 * 24 * 60 * 60 * 1000); // 4 days
};

// Refresh token for ksbengdev (continuous refresh)
const refreshKsbengdevToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.warn('No refresh token available.');
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
            body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
        });

        if (!response.ok) throw new Error('Failed to refresh token.');

        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        setRefreshTimeout(refreshKsbengdevToken, data.expires_in * 1000);
    } catch (error) {
        console.error('Refresh error:', error);
    }
};

// Refresh token for personal users (depends on activity)
const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.warn('No refresh token available.');
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
            body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
        });

        if (!response.ok) throw new Error('Failed to refresh token.');

        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        setRefreshTimeout(refreshAccessToken, data.expires_in * 1000);
    } catch (error) {
        console.error('Refresh error:', error);
        logoutUser();
    }
};

// Fetch real-time data and GPS
export const fetchData = async (unitId) => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('No access token found');

        const parsedUnitId = unitId.match(/ksb\s*(\d+)/i);
        if (!parsedUnitId || parsedUnitId.length < 2) throw new Error('Invalid unitId format');

        const unit = `KSB${parsedUnitId[1]}`;
        const apiUrl = `https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/${unit}/RealTime`;
        const gpsApiUrl = `https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/${unit}/GPS`;

        const [realTimeResponse, gpsResponse] = await Promise.all([
            fetch(apiUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            }),
            fetch(gpsApiUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            }),
        ]);

        if (!realTimeResponse.ok || !gpsResponse.ok) throw new Error('Failed to fetch data');

        const [realTimeData, gpsData] = await Promise.all([
            realTimeResponse.json(),
            gpsResponse.json(),
        ]);

        return {
            realTimeData: realTimeData.READ_REAL || {},
            coilData: realTimeData.READ_COIL || {},
            gpsData: gpsData.READ_GPS || {},
            serverName: realTimeData.server_name || '',
            date: realTimeData.date || '',
        };
    } catch (error) {
        console.error('Fetch data error:', error);
        throw error;
    }
};

// Logout user
export const logoutUser = () => {
    localStorage.clear();
    clearTimeout(refreshTokenTimeout);
    clearTimeout(activityTimeout);
    clearTimeout(autoLoginTimeout);
    console.log('User logged out.');
    window.location.href = '/login';
};
