// src/waterStandard.js

// กำหนดช่วงค่ามาตรฐาน (แก้ไขค่าที่นี่ที่เดียว มีผลทุกหน้า)
export const standardRules = {
    ph: { min: 6.5, max: 8.5, label: 'pH', unit: '' },
    do: { min: 3.08, max: 20.0, label: 'DO', unit: 'mg/L' }, // DO ต่ำกว่า 4 อันตราย
    temp: { min: 25, max: 30.0, label: 'Temp', unit: '°C' },
    turbidity: { min: 101, max: 500, label: 'Turbid', unit: 'NTU' }
};

export const checkQuality = (type, value) => {
    // แปลง type ให้ตรงกับ key (เผื่อส่งมาเป็น dissolved_oxygen)
    let key = type;
    if (type === 'dissolved_oxygen' || type === 'oxygen') key = 'do';
    if (type === 'temperature') key = 'temp';

    if (value === null || value === undefined) {
        return { status: 'unknown', msg: '-', color: '#6c757d' }; // สีเทา
    }

    const rule = standardRules[key];
    if (!rule) return { status: 'normal', msg: 'ปกติ', color: '#28a745' };

    const numVal = parseFloat(value);

    // ตรวจสอบค่า
    if (numVal < rule.min) {
        return { status: 'warning', msg: `${rule.label} ต่ำ`, color: '#dc3545' }; // สีแดง
    }
    if (numVal > rule.max) {
        return { status: 'warning', msg: `${rule.label} สูง`, color: '#dc3545' }; // สีแดง
    }

    return { status: 'normal', msg: 'ปกติ', color: '#28a745' }; // สีเขียว
};
