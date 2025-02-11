// Variabel global untuk timer dan waktu idle
let idleTimer;
let refreshTokenTimer;
let idleTimeLeft;  // Waktu idle dinamis sesuai dengan jenis pengguna
let refreshTimeLeft = 8600; // Default 1 menit (refresh token time)

// Menjalankan fungsi setelah halaman dimuat
window.addEventListener('load', () => {
    console.log("Page loaded, starting timers...");

    const refreshToken = localStorage.getItem('refreshToken');
    idleTimeLeft = parseInt(localStorage.getItem('idleTimeLeft')) || idleTimeLeft;  // Mengambil waktu idle dari localStorage jika ada
    // Jangan mengambil refreshTimeLeft dari localStorage, reset ke default untuk menghindari penumpukan
    refreshTimeLeft = 8600; // Set ke nilai default saat halaman dimuat (menghindari penumpukan)

    // Jika refreshToken ada, mulai timer
    if (refreshToken) {
        startIdleTimer(idleTimeLeft);  // Mulai timer idle
        startRefreshTokenTimer(refreshToken, refreshTimeLeft);  // Mulai timer refresh token
    }
});

// Fungsi untuk login
export const login = async (username, password) => {
    try {
        const token = (username === 'ksbengdev') ? await loginKsbengdev() : await loginUserPribadi(username, password);
        localStorage.setItem('username', username);  // Simpan username untuk menentukan jenis user
        return token;
    } catch (error) {
        console.error('Login error:', error);
        return Promise.reject(error);
    }
};

// Fungsi untuk loginKsbengdev (login otomatis dengan kredensial tetap)
export const loginKsbengdev = async () => {
    try {
        const username = 'ksbengdev';
        const password = 'zWb3Uktb-NGK!vc';

        // Menggunakan kredensial tetap untuk login
        const loginUrl = 'https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/login';
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) throw new Error('Failed to login');

        const data = await response.json();

        // Menghapus seluruh data dari localStorage
        localStorage.clear();

        // Menyimpan token baru ke localStorage
        saveTokenData(data.access_token, data.refresh_token);

        const accessToken = data.access_token;

        // Simpan username di localStorage
        localStorage.setItem('username', username);

        // Tentukan idleTimeLeft untuk login ksbengdev (4 hari)
        idleTimeLeft = 96 * 60 * 60;   // 4 hari idle time untuk ksbengdev
        // Set refreshTimeLeft ke nilai default (1 menit) untuk menghindari penumpukan
        refreshTimeLeft = 8600;  // Set ke default refresh time
        // Pastikan timer dimulai saat login dan juga setelah halaman di-refresh
        if (accessToken) {
            console.log("Starting idle and refresh token timers...");
            startIdleTimer(idleTimeLeft);   // Memastikan timer mulai dengan 4 hari idle time
            startRefreshTokenTimer(data.refresh_token, refreshTimeLeft); // Memastikan refresh token timer mulai
        }

        return accessToken;
    } catch (error) {
        console.error('Login error:', error);
        return Promise.reject(error);
    }
};

// Fungsi untuk loginUserPribadi
const loginUserPribadi = async (username, password) => {
    try {
        const loginUrl = 'https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/login';
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) throw new Error('Failed to login');

        const data = await response.json();

        // Menghapus seluruh data dari localStorage
        localStorage.clear();

        // Menyimpan token baru ke localStorage
        saveTokenData(data.access_token, data.refresh_token);

        const accessToken = data.access_token;

        // Simpan username di localStorage
        localStorage.setItem('username', username);

        // Tentukan idleTimeLeft untuk user pribadi (15 menit)
        idleTimeLeft = 15 * 60;  // 15 menit idle time untuk user pribadi
        // Set refreshTimeLeft ke nilai default (1 menit) untuk menghindari penumpukan
        refreshTimeLeft = 8600;  // Set ke default refresh time
        // Pastikan timer dimulai saat login dan juga setelah halaman di-refresh
        if (accessToken) {
            console.log("Starting idle and refresh token timers...");
            startIdleTimer(idleTimeLeft);   // Memastikan timer mulai dengan 15 menit idle time untuk user pribadi
            startRefreshTokenTimer(data.refresh_token, refreshTimeLeft); // Memastikan refresh token timer mulai
        }

        return accessToken;
    } catch (error) {
        console.error('Login error:', error);
        return Promise.reject(error);
    }
};

// Fungsi untuk menyimpan token baru
function saveTokenData(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);  // Menyimpan access token baru
    localStorage.setItem('refreshToken', refreshToken);  // Menyimpan refresh token yang lama
    localStorage.setItem('refreshTimeLeft', 8600);  // Menyimpan waktu refresh token dengan nilai default (misal 1 menit)
    console.log('Access token and refresh token saved.');
}

// Fungsi untuk mulai menghitung mundur (idle time)
function startIdleTimer(idleTimeLeft) {
    console.log("startIdleTimer called");

    // Pastikan idleTimeLeft adalah angka yang valid
    idleTimeLeft = (localStorage.getItem('username') === 'ksbengdev') ? 96 * 60 * 60 : 15 * 60

    // Menghentikan interval sebelumnya jika ada
    if (idleTimer) clearInterval(idleTimer);

    // Mengatur ulang timer
    idleTimer = setInterval(() => {
        idleTimeLeft = Math.max(0, idleTimeLeft - 1);
        localStorage.setItem('idleTimeLeft', idleTimeLeft);  // Simpan waktu sisa jika valid
        console.log(`Idle Timer: ${idleTimeLeft} seconds`);

        if (idleTimeLeft <= 0) {
            clearInterval(idleTimer);  // Menghentikan timer ketika waktu habis
            if (localStorage.getItem('username') === 'ksbengdev') {
                console.log("Idle time expired, auto logging in as ksbengdev...");
                window.location.reload();  // Refresh halaman untuk login otomatis
                loginKsbengdev();  // Login otomatis untuk ksbengdev
            } else {
                console.log("Idle time expired, user is not ksbengdev, redirecting to login...");
                logout();  // Redirect ke halaman login jika bukan ksbengdev
            }
        }
    }, 1000);  // Update setiap detik

    if (localStorage.getItem('username') === 'ksbengdev') {
        console.log("Adding event listeners for user activity...");
    } else {
        window.addEventListener('mousemove', resetIdleTimer);
        window.addEventListener('keydown', resetIdleTimer);
    }

    function resetIdleTimer() {
        idleTimeLeft = (localStorage.getItem('username') === 'ksbengdev') ? 96 * 60 * 60 : 15 * 60;
        localStorage.setItem('idleTimeLeft', idleTimeLeft);  // Simpan waktu reset
        console.log("Idle timer reset due to user activity");
    }
}


// Fungsi untuk melakukan refresh token setiap 1 menit (60 detik)
function startRefreshTokenTimer(refreshToken, refreshTimeLeft) {
    console.log("startRefreshTokenTimer called");

    // Menghentikan interval sebelumnya jika ada
    if (refreshTokenTimer) clearInterval(refreshTokenTimer);

    // Mengatur ulang timer
    refreshTokenTimer = setInterval(() => {
        refreshTokenApi(refreshToken);  // Panggil API refresh token
    }, refreshTimeLeft * 1000);  // Interval berdasarkan refreshTimeLeft (dalam detik)

    // Menambahkan log untuk melihat waktu refresh token
    setInterval(() => {
        refreshTimeLeft--;
        localStorage.setItem('refreshTimeLeft', refreshTimeLeft);  // Simpan waktu sisa
        console.log(`Refresh Token Timer: ${refreshTimeLeft} seconds`);

        if (refreshTimeLeft <= 0) {
            refreshTimeLeft = 8600;  // Reset ke 1 menit setelah refresh
            localStorage.setItem('refreshTimeLeft', refreshTimeLeft);  // Reset juga di localStorage
        }
    }, 1000);  // Update setiap detik
}

// Fungsi untuk refresh token melalui API
async function refreshTokenApi(refreshToken) {
    try {
        console.log("Refreshing token...");

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
                refresh_token: refreshToken
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Error refreshing token:`, errorData);
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        saveTokenData(data.access_token, refreshToken); // Simpan token baru
        console.log('Token refreshed successfully');
    } catch (error) {
        console.error('Error refreshing token:', error);
    }
}

// Fungsi untuk logout
export function logout() {
    console.log("Logging out...");
    localStorage.clear();  // Menghapus seluruh data dari localStorage
    window.location.href = '/login';  // Ganti dengan navigasi ke halaman login
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
        // const unitInfoUrl = `https://8hzol8pmvh.execute-api.ap-southeast-1.amazonaws.com/DNDDieselStandard/${unit}/UnitInformation`;

        const requests = [
            fetch(apiUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            }),
            fetch(gpsApiUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            }),
            /*
            fetch(unitInfoUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            }),
            */
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
        // const unitInfoResponse = responses[2].status === 'fulfilled' ? await responses[2].value.json() : {};

        /*
        if (Object.keys(unitInfoResponse).length) {
            localStorage.setItem(`unitInfo_${unit}`, JSON.stringify(unitInfoResponse));
        }
        */

        return {
            realTimeData: realTimeResponse.READ_REAL || {},
            coilData: realTimeResponse.READ_COIL || {},
            gpsData: gpsResponse.READ_GPS || {},
            serverName: realTimeResponse.server_name || '',
            date: realTimeResponse.date || '',
            // unitInfo: unitInfoResponse || {},
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
};

