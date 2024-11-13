export const fetchData = async (unitId) => {
    try {
        // Ambil hanya 'ksb' dan angkanya dari unitId
        const parsedUnitId = unitId.match(/ksb-unit\s*(\d+)/i);
        if (!parsedUnitId || parsedUnitId.length < 2) {
            throw new Error('Invalid unitId format');
        }

        const unit = `KSB${parsedUnitId[1]}`; // Membentuk unitId baru, contoh: ksb67
        const response = await fetch(`https://jwvm7y7epd.execute-api.ap-southeast-1.amazonaws.com/${unit}/RealTime`, {
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