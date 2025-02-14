// Variabel global untuk timer dan waktu idle
let idleTimer;
let refreshTokenTimer;
const DEFAULT_IDLE_TIME_USER = 15 * 60; // 15 menit untuk user pribadi
const DEFAULT_IDLE_TIME_KSBENGDEV = 96 * 60 * 60; // 4 hari untuk ksbengdev
const DEFAULT_REFRESH_TIME = 0.1 * 60 * 60; // Default 5 jam untuk refresh token

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
        // console.log(`Relogin Timer: ${idleTime} seconds`);

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

    let refreshCountDown = DEFAULT_REFRESH_TIME;

    refreshTokenTimer = setInterval(() => {
        refreshCountDown -= 1;
        // console.log(`Refresh Token Timer: ${refreshCountDown} seconds remaining`);

        if (refreshCountDown <= 0) {
            refreshTokenApi(refreshToken);
            refreshCountDown = DEFAULT_REFRESH_TIME;
        }
    }, 1000);
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

        const parsedUnitId = unitId.toUpperCase().match(/KSB\s*(\d+)/i);
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
                return getDefaultData(unit);
            }
        }

        // Process responses safely
        const realTimeResponse = responses[0].status === 'fulfilled' ? await safeJsonParse(responses[0].value) : {};
        const gpsResponse = responses[1].status === 'fulfilled' ? await safeJsonParse(responses[1].value) : {};

        return {
            realTimeData: realTimeResponse.READ_REAL || getDefaultRealTimeData(unit),
            coilData: realTimeResponse.READ_COIL || {},
            gpsData: gpsResponse.READ_GPS || getDefaultGPSData(),
            serverName: realTimeResponse.server_name || '',
            date: realTimeResponse.date || '',
        };
    } catch (error) {
        console.error('Fetch data error:', error);
        return getDefaultData(unitId);
    }

    function handleUnauthorized() {
        if (localStorage.getItem('username') === 'ksbengdev') {
            console.error('Unauthorized: logging out and redirecting to login');
            loginKsbengdev();
        }
        else {
            console.error('Unauthorized: logging out and redirecting to login');
            logout();
        }
    }
};

// Fetch historical data
export const fetchDataChart = async (unitId, startDate, endDate, spField) => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('No access token found');

        const formattedStartDate = startDate.format('YYMMDD');
        const formattedEndDate = endDate.format('YYMMDD');
        const apiUrl = `https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/${unitId}/date/${formattedStartDate}/${formattedEndDate}/${spField}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch data');

        return response.json();
    } catch (error) {
        console.error('Fetch historical data error:', error);
        throw error;
    }
};

// Helper function untuk parse JSON dengan aman
const safeJsonParse = async (response) => {
    try {
        return await response.json();
    } catch (error) {
        console.error('JSON parsing error:', error);
        return {};
    }
};

// Data default untuk READ_REAL berdasarkan unit
const getDefaultRealTimeData = (unit) => {
    if (unit === "KSB72") {
        return {
            FLOW: 0,
            PUMP_DE_TEMP: 0,
            PUMP_NDE_TEMP: 0,
            PUMP_DE_VIB_Y: 0,
            PUMP_NDE_VIB_X1: 0,
            PUMP_NDE_VIB_X2: 0,
            FLOW_TOTAL: 0,
            OIL_LUB_PRESS: 0,
            DISCHARGE_PRESSURE: 0,
            ENGINE_1_RUN_HOUR: 0.0,
            ENGINE_1_SPEED: 0,
            ENGINE_1_LOAD: 0,
            ENGINE_1_FUEL_CONSUMPTIONS: 0,
            ENGINE_1_OIL_PRESSURE: 0,
            ENGINE_1_BATTERY_VOLTAGE: 0,
            ENGINE_2_RUN_HOUR: 0.0,
            ENGINE_2_SPEED: 0,
            ENGINE_2_LOAD: 0,
            ENGINE_2_FUEL_CONSUMPTIONS: 0,
            ENGINE_2_OIL_PRESSURE: 0,
            ENGINE_2_BATTERY_VOLTAGE: 0,
        };
    } else {
        return {
            FLOW: 0,
            PUMP_DE_TEMP: 0,
            PUMP_NDE_TEMP: 0,
            PUMP_DE_VIB_Y: 0,
            PUMP_NDE_VIB_X1: 0,
            PUMP_NDE_VIB_X2: 0,
            FLOW_TOTAL: 0,
            OIL_LUB_PRESS: 0,
            DISCHARGE_PRESSURE: 0,
            ENGINE_RUN_HOUR: 0,
            ENGINE_SPEED: 0,
            ENGINE_LOAD: 0,
            ENGINE_FUEL_CONSUMPTIONS: 0,
            ENGINE_OIL_PRESSURE: 0,
            ENGINE_BATTERY_VOLTAGE: 0,
        };
    }
};

// Data default untuk GPS
const getDefaultGPSData = () => ({
    LAT: 0,
    LONG: 0,
});

// Data default jika seluruh API gagal
const getDefaultData = (unit) => ({
    realTimeData: getDefaultRealTimeData(unit),
    coilData: {},
    gpsData: getDefaultGPSData(),
    serverName: '',
    date: '',
});
