export const checkQuality = (type, value) => {
    // แปลงค่าให้เป็นตัวเลขเสมอ
    const val = parseFloat(value);
    if (isNaN(val)) return { status: 'unknown', color: '#ccc', msg: 'ไม่มีข้อมูล' };

    // --- 1. Dissolved Oxygen (DO) ---
    // < 3.0 = วิกฤต (แดง)
    // 3.0 - 4.0 = เตือน (ส้ม)
    // > 4.0 = ปกติ (เขียว)
    if (type === 'do' || type === 'dissolved_oxygen') {
        if (val < 3.0) return { status: 'critical', color: '#dc3545', msg: 'วิกฤต (ต่ำมาก)' }; // แดง
        if (val < 4.0) return { status: 'warning', color: '#fd7e14', msg: 'ต่ำกว่าเกณฑ์' };   // ส้ม
        return { status: 'normal', color: '#28a745', msg: 'ปกติ' };                           // เขียว
    }

    // --- 2. pH ---
    // < 6.5 หรือ > 9.0 = วิกฤต
    // 6.5-7.5 หรือ 8.5-9.0 = เตือน
    // 7.5 - 8.5 = ปกติ
    if (type === 'ph') {
        if (val < 6.5 || val > 9.0) return { status: 'critical', color: '#dc3545', msg: 'วิกฤต (pH)' };
        if ((val >= 6.5 && val < 7.5) || (val > 8.5 && val <= 9.0)) return { status: 'warning', color: '#fd7e14', msg: 'เฝ้าระวัง' };
        return { status: 'normal', color: '#28a745', msg: 'ปกติ' };
    }

    // --- 3. Temperature ---
    if (type === 'temp' || type === 'temperature') {
        if (val < 24 || val > 34) return { status: 'critical', color: '#dc3545', msg: 'วิกฤต (Temp)' };
        if (val < 26 || val > 32) return { status: 'warning', color: '#fd7e14', msg: 'แกว่ง' };
        return { status: 'normal', color: '#28a745', msg: 'ปกติ' };
    }

    // --- 4. Turbidity ---
    if (type === 'turbidity') {
        if (val > 1500) return { status: 'critical', color: '#dc3545', msg: 'ขุ่นมาก' };
        if (val > 800) return { status: 'warning', color: '#fd7e14', msg: 'เริ่มขุ่น' };
        return { status: 'normal', color: '#28a745', msg: 'ปกติ' };
    }

    return { status: 'normal', color: '#28a745', msg: 'ปกติ' };
};
