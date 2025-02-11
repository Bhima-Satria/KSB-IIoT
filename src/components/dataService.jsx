// Variabel global untuk timer dan waktu idle
let idleTimer;
let refreshTokenTimer;
const DEFAULT_IDLE_TIME_USER = 15 * 60; // 15 menit untuk user pribadi
const DEFAULT_IDLE_TIME_KSBENGDEV = 96 * 60 * 60; // 4 hari untuk ksbengdev
const DEFAULT_REFRESH_TIME = 8600; // Default 1 menit untuk refresh token

// Menjalankan fungsi setelah halaman dimuat
window.addEventListener('load', () => {
    console.log("Page loaded, starting timers...");

    const refreshToken = localStorage.getItem('refreshToken');
    const username = localStorage.getItem('username');
    const idleTimeLeft = parseInt(localStorage.getItem('idleTimeLeft')) || (username === 'ksbengdev' ? DEFAULT_IDLE_TIME_KSBENGDEV : DEFAULT_IDLE_TIME_USER);

    if (refreshToken) {
        startIdleTimer(idleTimeLeft);
        startRefreshTokenTimer(refreshToken);
    }
});

// Fungsi untuk login
export const login = async (username, password) => {
    try {
        const token = await loginUserPribadi(username, password);
        return token;
    } catch (error) {
        handleCriticalError(error);
    }
};

// Fungsi untuk loginKsbengdev
export const loginKsbengdev = async () => {
    try {
        const response = await fetch('https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'ksbengdev', password: 'zWb3Uktb-NGK!vc' }),
        });

        if (!response.ok) throw new Error('Failed to login');

        const data = await response.json();
        updateStorageTokenData(data.access_token, data.refresh_token, 'ksbengdev');
        startIdleTimer(DEFAULT_IDLE_TIME_KSBENGDEV);
        startRefreshTokenTimer(data.refresh_token);
        return data.access_token;
    } catch (error) {
        console.error('Login error for ksbengdev:', error);
    }
};

// Fungsi untuk loginUserPribadi
const loginUserPribadi = async (username, password) => {
    try {
        const response = await fetch('https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) throw new Error('Failed to login');

        const data = await response.json();
        updateStorageTokenData(data.access_token, data.refresh_token, username);
        startIdleTimer(DEFAULT_IDLE_TIME_USER);
        startRefreshTokenTimer(data.refresh_token);
        return data.access_token;
    } catch (error) {
        handleCriticalError(error);
    }
};

// Fungsi untuk menyimpan token baru
function updateStorageTokenData(accessToken, refreshToken, username) {
    localStorage.setItem('username', username);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('tokenIssuedTime', Date.now().toString());
    console.log('Access token and refresh token saved.');
}

// Fungsi untuk mulai menghitung mundur (idle time)
function startIdleTimer(idleTime) {
    console.log("startIdleTimer called");

    if (idleTimer) clearInterval(idleTimer);

    idleTimer = setInterval(() => {
        idleTime = Math.max(0, idleTime - 1);
        localStorage.setItem('idleTimeLeft', idleTime);
        console.log(`Idle Timer: ${idleTime} seconds`);

        if (idleTime <= 0) {
            clearInterval(idleTimer);
            if (localStorage.getItem('username') === 'ksbengdev') {
                loginKsbengdev();
            } else {
                logout();
            }
        }
    }, 1000);

    if (localStorage.getItem('username') !== 'ksbengdev') {
        window.addEventListener('mousemove', resetIdleTimer);
        window.addEventListener('keydown', resetIdleTimer);
    }

    function resetIdleTimer() {
        idleTime = localStorage.getItem('username') === 'ksbengdev' ? DEFAULT_IDLE_TIME_KSBENGDEV : DEFAULT_IDLE_TIME_USER;
        localStorage.setItem('idleTimeLeft', idleTime);
        console.log("Idle timer reset due to user activity");
    }
}

// Fungsi untuk melakukan refresh token
function startRefreshTokenTimer(refreshToken) {
    console.log("startRefreshTokenTimer called");

    if (refreshTokenTimer) clearInterval(refreshTokenTimer);

    refreshTokenTimer = setInterval(() => {
        refreshTokenApi(refreshToken);
    }, DEFAULT_REFRESH_TIME * 1000);
}

// Fungsi untuk refresh token melalui API
async function refreshTokenApi(refreshToken) {
    try {
        console.log("Refreshing token...");

        const response = await fetch('https://ap-southeast-1bjzveseue.auth.ap-southeast-1.amazoncognito.com/oauth2/token', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic cmhtOGw2YmEwZGo2YzVobXZ1OWkwMDRwaDoxZmUxbTI0ZWtxNWJkZ3B2MmwzY3RvbW9jZmQ1MGVvOTFocXE3NnNmYmE0czczZWQxc28w',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }),
        });

        if (!response.ok) throw new Error('Failed to refresh token');

        const data = await response.json();
        updateStorageTokenData(data.access_token, refreshToken, localStorage.getItem('username'));
        console.log('Token refreshed successfully');
    } catch (error) {
        handleCriticalError(error);
    }
}

// Fungsi untuk logout
export function logout() {
    console.log("Logging out...");
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idleTimeLeft');
    localStorage.removeItem('tokenIssuedTime');
    window.location.href = '/login';
}


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

        const requests = [
            fetch(apiUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            }),
            fetch(gpsApiUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            }),
        ];

        const responses = await Promise.allSettled(requests);

        // Check if any response has 401 status
        for (const response of responses) {
            if (response.status === 'fulfilled' && response.value.status === 401) {
                handleUnauthorized();
                return;
            }
        }

        // Process successful responses
        const realTimeResponse = responses[0].status === 'fulfilled' ? await responses[0].value.json() : {};
        const gpsResponse = responses[1].status === 'fulfilled' ? await responses[1].value.json() : {};

        return {
            realTimeData: realTimeResponse.READ_REAL || {},
            coilData: realTimeResponse.READ_COIL || {},
            gpsData: gpsResponse.READ_GPS || {},
            serverName: realTimeResponse.server_name || '',
            date: realTimeResponse.date || '',
        };
    } catch (error) {
        if (error.message.includes('Unauthorized')) {
            handleUnauthorized();
        } else {
            console.error('Fetch data error:', error);
            throw error;
        }
    }

    function handleUnauthorized() {
        console.error('Unauthorized: logging out and redirecting to login');
        logout();
    }
}
