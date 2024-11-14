export const fetchData = async (unitId) => {
    try {
        // Ambil hanya 'ksb' dan angkanya dari unitId
        const parsedUnitId = unitId.match(/ksb-unit\s*(\d+)/i);
        let unit;
        
        if (!parsedUnitId || parsedUnitId.length < 2) {
            throw new Error('Invalid unitId format');
        }

        const unitNumber = parsedUnitId[1];

        // Cek jika unitId adalah 'KSB-Unit 64' dan ubah endpoint
        if (unitId.toLowerCase() === 'ksb-unit 64') {
            unit = `KSB${unitNumber}`;
        } else {
            unit = `KSB${unitNumber}`;
        }

        // Tentukan URL endpoint untuk real-time
        const apiUrl = unitId.toLowerCase() === 'ksb-unit 64'
            ? `https://en8wv6x739.execute-api.ap-southeast-1.amazonaws.com/${unit}/RealTime`
            : `https://jwvm7y7epd.execute-api.ap-southeast-1.amazonaws.com/${unit}/RealTime`;

        // Ambil data real-time
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok for real-time data');
        }

        const data = await response.json();

        // Tentukan URL endpoint untuk GPS
        const gpsApiUrl = unitId.toLowerCase() === 'ksb-unit 64'
            ? `https://en8wv6x739.execute-api.ap-southeast-1.amazonaws.com/KSB64/GPS`
            : `https://jwvm7y7epd.execute-api.ap-southeast-1.amazonaws.com/KSB67/GPS`;

        // Ambil data GPS
        const gpsResponse = await fetch(gpsApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!gpsResponse.ok) {
            throw new Error('Network response was not ok for GPS data');
        }

        const gpsData = await gpsResponse.json();

        // Gabungkan data real-time dan data GPS
        return {
            realTimeData: data.READ_REAL, // Data real-time
            coilData: data.READ_COIL,      // Data coil
            gpsData: gpsData.READ_GPS,     // Data GPS
            serverName: data.server_name,  // Nama server jika diperlukan
            date: data.date,               // Tanggal dan waktu dari data API
        };
    } catch (error) {
        console.error("Fetch data error: ", error);
        throw error;
    }
};
