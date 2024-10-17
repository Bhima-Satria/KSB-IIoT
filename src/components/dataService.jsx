// src/services/dataService.js

export const fetchData = async (unitId) => {
    // Ambil hanya 'ksb' dan angkanya dari unitId
    const parsedUnitId = unitId.match(/ksb-unit\s*(\d+)/i);
    if (!parsedUnitId || parsedUnitId.length < 2) {
        throw new Error('Invalid unitId format');
    }

    const unit = `ksb${parsedUnitId[1]}`; // Membentuk unitId baru, contoh: ksb67
    const response = await fetch(`http://ksb-iiot.intranet/${unit}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
};

// To use this in UnitPage, no changes are required for the UnitPage component.
