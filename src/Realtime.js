import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Home, Activity, Droplets, Thermometer, Wind } from 'lucide-react';
import './Realtime.css';

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

    const fetchRealtimeData = async () => {

      try {

        const token = localStorage.getItem("token");

        if (!token) {
          setError("กรุณาเข้าสู่ระบบใหม่");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://backend-production-6b0f.up.railway.app/member/water-quality?deviceId=${deviceId}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.msg || "ไม่สามารถดึงข้อมูลจาก API");
          setLoading(false);
          return;
        }

        setSensorData({
          temp: data.temperature ?? 0,
          do: data.dissolved_oxygen ?? 0,
          ph: data.ph ?? 0,
          turbidity: data.turbidity ?? 0,
          timestamp: data.recorded_at
        });

        setLoading(false);

      } catch (err) {

        console.error("Realtime error:", err);
        setError("ไม่สามารถเชื่อมต่อ Server ได้");
        setLoading(false);

      }

    };

    fetchRealtimeData();

    const interval = setInterval(() => {
      fetchRealtimeData();
    }, 5000);

    return () => clearInterval(interval);

  }, [deviceId]);

  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="realtime-container"
    >

      <button onClick={() => navigate('/')} className="back-home-btn">
        <Home size={16} /> กลับหน้าหลัก
      </button>

      <h1>
        <Activity className="icon-pulse"/> ข้อมูลคุณภาพน้ำ (Realtime)
      </h1>

      <h3 style={{ textAlign: 'center', color: '#666' }}>
        อุปกรณ์: {deviceId || 'ไม่ระบุ'}
      </h3>

      {loading ? (

        <div className="loading-container">
          <p className="loading-text">กำลังเชื่อมต่อกับเซ็นเซอร์...</p>
        </div>

      ) : error ? (

        <div className="error-container">
          <p>{error}</p>
        </div>

      ) : (

        <div className="sensor-grid">

          <div className="sensor-card temp">
            <Thermometer size={24}/>
            <h2>Temperature</h2>
            <p className="sensor-value">
              {Number(sensorData.temp).toFixed(1)} °C
            </p>
          </div>

          <div className="sensor-card do">
            <Wind size={24}/>
            <h2>Dissolved Oxygen</h2>
            <p className="sensor-value">
              {Number(sensorData.do).toFixed(2)} mg/L
            </p>
          </div>

          <div className="sensor-card ph">
            <Droplets size={24}/>
            <h2>pH</h2>
            <p className="sensor-value">
              {Number(sensorData.ph).toFixed(2)}
            </p>
          </div>

          <div className="sensor-card turbidity">
            <Activity size={24}/>
            <h2>Turbidity</h2>
            <p className="sensor-value">
              {Number(sensorData.turbidity).toFixed(2)} NTU
            </p>
          </div>

        </div>

      )}

      <p className="update-status">
        อัปเดตล่าสุด :
        {sensorData.timestamp
          ? new Date(sensorData.timestamp).toLocaleString('th-TH')
          : '-'}
      </p>

    </motion.div>

  );

}

export default Realtime;
