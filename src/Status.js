import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './status.css';

const Status = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.background = 'linear-gradient(135deg, #a1c4fd, #c2e9fb)';
        document.body.style.minHeight = '100vh';
        document.body.style.margin = '0';
        document.body.style.fontFamily = 'Arial, sans-serif';

        return () => {
            document.body.style.background = '';
            document.body.style.minHeight = '';
            document.body.style.margin = '';
            document.body.style.fontFamily = '';
        };
    }, []);

    const statusData = [
        {
            parameter: 'ความเค็ม (Salinity)',
            unit: 'ppt',
            suitableRange: '5 - 25 ppt',
            description: 'ความเค็มของน้ำส่งผลต่อการควบคุมความดันออสโมติกในตัวกุ้ง',
            impact: 'หากความเค็มต่ำเกินไป (< 5 ppt) หรือสูงเกินไป (> 25 ppt) อาจทำให้กุ้งเครียด, เจริญเติบโตช้า, หรือตายได้'
        },
        {
            parameter: 'pH',
            unit: '',
            suitableRange: '7.5 - 8.5',
            description: 'ค่า pH วัดความเป็นกรด-ด่างของน้ำ ซึ่งส่งผลต่อสุขภาพของกุ้ง',
            impact: 'pH ต่ำเกินไป (< 7.5) หรือสูงเกินไป (> 8.5) อาจทำให้กุ้งป่วย, เปลือกอ่อน, หรือตาย'
        },
        {
            parameter: 'ออกซิเจน (Dissolved Oxygen)',
            unit: 'mg/L',
            suitableRange: '≥ 4 mg/L',
            description: 'ออกซิเจนละลายในน้ำจำเป็นสำหรับการหายใจของกุ้ง',
            impact: 'หากออกซิเจนต่ำกว่า 4 mg/L กุ้งอาจขาดออกซิเจน, หายใจลำบาก, และตายได้'
        },
        {
            parameter: 'ไนโตรเจน (Nitrogen/Ammonia)',
            unit: 'mg/L',
            suitableRange: '≤ 0.1 mg/L',
            description: 'ไนโตรเจนในรูปแอมโมเนียเป็นพิษต่อกุ้ง',
            impact: 'หากสูงเกิน 0.1 mg/L อาจทำให้กุ้งเป็นพิษ, เจริญเติบโตช้า, หรือตาย'
        },
        {
            parameter: 'ไฮโดรเจนซัลไฟด์ (Hydrogen Sulfide)',
            unit: 'mg/L',
            suitableRange: '≤ 0.003 mg/L',
            description: 'ไฮโดรเจนซัลไฟด์เป็นก๊าซพิษที่เกิดจากซัลเฟตในน้ำ',
            impact: 'หากสูงเกิน 0.003 mg/L อาจทำให้กุ้งตายได้อย่างรวดเร็ว'
        },
        {
            parameter: 'BOD (Biochemical Oxygen Demand)',
            unit: 'mg/L',
            suitableRange: '≤ 20 mg/L',
            description: 'BOD วัดปริมาณออกซิเจนที่จุลินทรีย์ใช้ในการย่อยสลายอินทรียวัตถุ',
            impact: 'หากสูงเกิน 20 mg/L อาจทำให้ออกซิเจนในน้ำลดลง, กุ้งขาดออกซิเจน และตาย'
        },
        {
            parameter: 'อุณหภูมิ (Temperature)',
            unit: '°C',
            suitableRange: '26 - 32°C',
            description: 'อุณหภูมิส่งผลต่อการเผาผลาญและการเจริญเติบโตของกุ้ง',
            impact: 'หากต่ำเกินไป (< 26°C) หรือสูงเกินไป (> 32°C) อาจทำให้กุ้งเครียด, เจริญเติบโตช้า, หรือตาย'
        },
    ];

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.5 }}
            className="status-container"
        >
            <h1>ข้อมูลค่าสถานะและผลกระทบต่อการเลี้ยงกุ้ง</h1>

            <div className="status-table-container">
                <table className="status-table">
                    <thead>
                        <tr>
                            <th>พารามิเตอร์</th>
                            <th>หน่วย</th>
                            <th>ช่วงที่เหมาะสม</th>
                            <th>คำอธิบาย</th>
                            <th>ผลกระทบหากอยู่นอกเกณฑ์</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statusData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.parameter}</td>
                                <td>{item.unit}</td>
                                <td>{item.suitableRange}</td>
                                <td>{item.description}</td>
                                <td>{item.impact}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="footer">
                <button className="back-btn" onClick={() => navigate('/water-quality')}>
                    กลับไปหน้าคุณภาพน้ำ
                </button>
            </div>
        </motion.div>
    );
};

export default Status;