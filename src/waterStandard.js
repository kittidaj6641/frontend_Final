export const checkQuality = (type, value) => {
    // แปลงค่าให้เป็นตัวเลขเสมอ
    const val = parseFloat(value);
    if (isNaN(val)) return { status: 'unknown', color: '#ccc', msg: 'ไม่มีข้อมูล' };

    // --- 1. Dissolved Oxygen (DO) ---
    // 0 - 2 = แก้ไข (แดง)
    // 2 - 3 = เฝ้าระวัง (ส้ม)
    // 3 - 8 = ปกติ (เขียว)
    if (type === 'do' || type === 'dissolved_oxygen') {
        if (val <= 2.0) return { status: 'critical', color: '#dc3545', msg: 'แก้ไข' }; 
        if (val < 3.0)  return { status: 'warning', color: '#fd7e14', msg: 'เฝ้าระวัง' };
        if (val >= 3.0 && val <= 8.0) return { status: 'normal', color: '#28a745', msg: 'ปกติ' };
        // กรณีเกิน 8 (ถ้ามี) ให้ถือว่าต้องเฝ้าระวังหรือแก้ไขตามความเหมาะสมของบ่อกุ้ง
        return { status: 'critical', color: '#dc3545', msg: 'แก้ไข (สูงเกิน)' }; 
    }

    // --- 2. pH ---
    // 0 - 5 = แก้ไข (แดง)
    // 5 - 6.5 = เฝ้าระวัง (ส้ม)
    // 6.5 - 8.5 = ปกติ (เขียว)
    if (type === 'ph') {
        if (val <= 5.0) return { status: 'critical', color: '#dc3545', msg: 'แก้ไข' };
        if (val < 6.5)  return { status: 'warning', color: '#fd7e14', msg: 'เฝ้าระวัง' };
        if (val >= 6.5 && val <= 8.5) return { status: 'normal', color: '#28a745', msg: 'ปกติ' };
        // กรณี pH สูงเกิน 8.5
        return { status: 'critical', color: '#dc3545', msg: 'แก้ไข (ด่างสูง)' };
    }

    // --- 3. Temperature (ใช้เกณฑ์เดิมของคุณ) ---
    if (type === 'temp' || type === 'temperature') {
        if (val < 24 || val > 34) return { status: 'critical', color: '#dc3545', msg: 'วิกฤต' };
        if (val < 26 || val > 32) return { status: 'warning', color: '#fd7e14', msg: 'เฝ้าระวัง' };
        return { status: 'normal', color: '#28a745', msg: 'ปกติ' };
    }

    // --- 4. Turbidity (ใช้เกณฑ์เดิมของคุณ) ---
    if (type === 'turbidity') {
        if (val > 1500) return { status: 'critical', color: '#dc3545', msg: 'ขุ่นมาก' };
        if (val > 800)  return { status: 'warning', color: '#fd7e14', msg: 'เฝ้าระวัง' };
        return { status: 'normal', color: '#28a745', msg: 'ปกติ' };
    }

    return { status: 'normal', color: '#28a745', msg: 'ปกติ' };
};
