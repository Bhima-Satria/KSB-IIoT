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

        // Tentukan URL endpoint berdasarkan unitId
        const apiUrl = unitId.toLowerCase() === 'ksb-unit 64'
            ? `https://en8wv6x739.execute-api.ap-southeast-1.amazonaws.com/${unit}/RealTime`
            : `https://jwvm7y7epd.execute-api.ap-southeast-1.amazonaws.com/${unit}/RealTime`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Tambahkan header otorisasi jika diperlukan, contoh:
                // 'Authorization': `Bearer ${yourToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch data error: ", error);
        throw error;
    }
};
