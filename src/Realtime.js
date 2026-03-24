import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Activity, Droplets, Thermometer, 
  Wind, Zap, AlertTriangle, CheckCircle 
} from 'lucide-react';
import './Realtime.css';

// Import Config
import { database } from './firebaseConfig';
import { ref, onValue } from "firebase/database";

// ฟังก์ชันเช็คเกณฑ์มาตรฐานน้ำ (กุ้งก้ามกราม) เพื่อโชว์สีสถานะ
const getStatus = (type, value) => {
  const val = Number(value);
  if (type === 'ph') {
    if (val < 6.5 || val > 9.0) return 'danger';
    if (val < 7.0 || val > 8.5) return 'warning';
    return 'normal';
  }
  if (type === 'do') {
    if (val < 2.0) return 'danger';
    if (val < 3.0) return 'warning';
    return 'normal';
  }
  if (type === 'temp') {
    if (val < 25 || val > 34) return 'danger';
    if (val < 27 || val > 32) return 'warning';
    return 'normal';
  }
  if (type === 'turbidity') {
    if (val >= 1000) return 'danger';
    if (val > 800) return 'warning';
    return 'normal';
  }
  return 'normal';
};

function Realtime() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('deviceId');

  const [sensorData, setSensorData] = useState({
    temp: 0,
    do: 0,
    ph: 0,
    turbidity: 0,
    timestamp: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!deviceId) {
      setError('ไม่พบรหัสอุปกรณ์ (Device ID)');
      setLoading(false);
      return;
    }

    const sensorRef = ref(database, `/devices/${deviceId}/current`);

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        setSensorData({
          temp: data.temperature ?? 0,
          do: data.dissolved_oxygen ?? 0,
          ph: data.ph ?? 0,
          turbidity: data.turbidity ?? 0,
          timestamp: data.timestamp
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error reading realtime data:", error);
      setError('ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deviceId]);

  // Component สำหรับสร้างการ์ดแต่ละใบให้สวยงาม
  const SensorCard = ({ title, value, unit, icon: Icon, type, color }) => {
    const status = getStatus(type, value);
    
    return (
      <div className={`rt-card status-${status}`}>
        <div className="rt-card-header">
          <div className="rt-card-title">
            <div className="rt-icon-wrapper" style={{ color: color, background: `${color}15` }}>
              <Icon size={20} />
            </div>
            <span>{title}</span>
          </div>
          {status === 'normal' && <CheckCircle size={16} className="rt-status-icon text-green" title="ปกติ" />}
          {status === 'warning' && <AlertTriangle size={16} className="rt-status-icon text-amber" title="เฝ้าระวัง" />}
          {status === 'danger' && <AlertTriangle size={16} className="rt-status-icon text-rose" title="อันตราย" />}
        </div>
        
        <div className="rt-card-body">
          <div className="rt-value-wrap">
            <span className="rt-value">{Number(value).toFixed(type === 'ph' ? 2 : 1)}</span>
            <span className="rt-unit">{unit}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      className="rt-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ── Header ── */}
      <header className="rt-header">
        <button className="rt-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
        </button>
        <div className="rt-header-title">ข้อมูลคุณภาพน้ำ</div>
        <div className="rt-live-badge">
          <span className="rt-live-dot"></span> LIVE
        </div>
      </header>

      {/* ── Main Body ── */}
      <main className="rt-main">
        <div className="rt-device-info">
          <Activity size={18} className="text-teal" />
          <span>อุปกรณ์ปัจจุบัน: <strong>{deviceId || 'ไม่ระบุ'}</strong></span>
        </div>

        {loading ? (
          <div className="rt-loading">
            <div className="rt-spinner"></div>
            <p>กำลังเชื่อมต่อกับเซนเซอร์...</p>
          </div>
        ) : error ? (
          <div className="rt-error">
            <AlertTriangle size={24} />
            <p>{error}</p>
            <button onClick={() => navigate('/')} className="rt-btn-primary">กลับไปเลือกอุปกรณ์</button>
          </div>
        ) : (
          <motion.div 
            className="rt-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SensorCard 
              title="ค่า pH" 
              value={sensorData.ph} 
              unit="" 
              icon={Droplets} 
              type="ph" 
              color="#0ea5e9" 
            />
            <SensorCard 
              title="ออกซิเจน (DO)" 
              value={sensorData.do} 
              unit="mg/L" 
              icon={Wind} 
              type="do" 
              color="#0d9488" 
            />
            <SensorCard 
              title="อุณหภูมิ" 
              value={sensorData.temp} 
              unit="°C" 
              icon={Thermometer} 
              type="temp" 
              color="#f59e0b" 
            />
            <SensorCard 
              title="ความขุ่น" 
              value={sensorData.turbidity} 
              unit="NTU" 
              icon={Zap} 
              type="turbidity" 
              color="#8b5cf6" 
            />
          </motion.div>
        )}

        <AnimatePresence>
          {!loading && !error && (
            <motion.div 
              className="rt-footer-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              อัปเดตล่าสุด: {sensorData.timestamp ? new Date(sensorData.timestamp).toLocaleString('th-TH') : new Date().toLocaleTimeString('th-TH')}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

export default Realtime;
