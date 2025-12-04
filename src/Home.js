// src/home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import config from './config';
import { checkQuality } from './waterStandard'; // <--- 1. Import ฟังก์ชันตรวจสอบค่ามาตรฐาน
import './home.css'; // (ถ้าคุณมีไฟล์ css แยก)
import { 
  Wind, Droplets, Thermometer, Zap, Activity, 
  AlertTriangle, CheckCircle, ChevronRight 
} from 'lucide-react';

const Home = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    // ตั้งเวลา refresh ข้อมูลหน้า Dashboard ทุก 30 วินาที
    const interval = setInterval(fetchDashboardData, 30000); 
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // สมมติว่า API /member/devices ส่งข้อมูลล่าสุด (latest_ph, latest_do ฯลฯ) มาด้วย
      // ถ้า API ของคุณแยกกัน อาจจะต้องแก้ตรงนี้ให้ดึงข้อมูลล่าสุดของแต่ละอุปกรณ์ครับ
      const res = await axios.get(`${config.API_BASE_URL}/member/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevices(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setLoading(false);
    }
  };

  // ฟังก์ชันคำนวณสถานะรวมของบ่อ (ถ้ามีค่าใดค่าหนึ่งผิดปกติ = บ่อนั้นผิดปกติ)
  const getDeviceStatus = (device) => {
    // ดึงค่ามาเช็คทีละตัว โดยใช้ Standard เดียวกันกับหน้า Water Quality
    const qDO = checkQuality('do', device.latest_dissolved_oxygen || device.dissolved_oxygen);
    const qPH = checkQuality('ph', device.latest_ph || device.ph);
    const qTemp = checkQuality('temp', device.latest_temperature || device.temperature);
    
    // ถ้าตัวใดตัวหนึ่ง Warning ให้ถือว่าบ่อนั้น Warning
    if (qDO.status === 'warning' || qPH.status === 'warning' || qTemp.status === 'warning') {
        return { status: 'warning', label: 'ผิดปกติ', color: '#dc3545', icon: AlertTriangle };
    }
    return { status: 'normal', label: 'ปกติ', color: '#28a745', icon: CheckCircle };
  };

  if (loading) {
    return <div style={{padding:'20px', textAlign:'center'}}>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="home-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>ภาพรวมฟาร์ม</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>สถานะคุณภาพน้ำปัจจุบัน</p>
        </div>
        <button 
            onClick={fetchDashboardData}
            style={{ background: '#f0f0f0', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontSize:'0.85rem' }}
        >
            รีเฟรช
        </button>
      </header>

      <div className="device-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {devices.map((device) => {
          // คำนวณสถานะภาพรวมของอุปกรณ์นี้
          const overallStatus = getDeviceStatus(device);
          const StatusIcon = overallStatus.icon;

          // ดึงข้อมูลรายค่า (ใช้ logic กลางในการกำหนดสี)
          const valDO = checkQuality('do', device.latest_dissolved_oxygen || device.dissolved_oxygen);
          const valPH = checkQuality('ph', device.latest_ph || device.ph);
          const valTemp = checkQuality('temp', device.latest_temperature || device.temperature);
          const valTurb = checkQuality('turbidity', device.latest_turbidity || device.turbidity);

          return (
            <motion.div 
              key={device.device_id}
              whileHover={{ y: -5 }}
              className="device-card"
              style={{ 
                background: 'white', 
                borderRadius: '16px', 
                padding: '20px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: overallStatus.status === 'warning' ? '2px solid #dc3545' : '1px solid #eee',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/water-quality?deviceId=${device.device_id}`)}
            >
              {/* Header ของการ์ด */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>{device.device_name}</h3>
                <span style={{ 
                    display: 'flex', alignItems: 'center', gap: '5px', 
                    background: overallStatus.status === 'warning' ? '#ffebee' : '#e8f5e9',
                    color: overallStatus.color,
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'
                }}>
                    <StatusIcon size={14} /> {overallStatus.label}
                </span>
              </div>

              {/* Grid แสดงค่า Sensor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
                {/* DO */}
                <div className="sensor-item">
                    <div style={{display:'flex', alignItems:'center', gap:'5px', color:'#666', fontSize:'0.85rem', marginBottom:'2px'}}>
                        <Wind size={14}/> DO
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: valDO.color }}>
                        {device.latest_dissolved_oxygen || device.dissolved_oxygen || '-'} <span style={{fontSize:'0.8rem', color:'#999'}}>mg/L</span>
                    </div>
                    {valDO.status === 'warning' && <small style={{color: valDO.color, fontSize:'0.7rem'}}>{valDO.msg}</small>}
                </div>

                {/* pH */}
                <div className="sensor-item">
                    <div style={{display:'flex', alignItems:'center', gap:'5px', color:'#666', fontSize:'0.85rem', marginBottom:'2px'}}>
                        <Droplets size={14}/> pH
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: valPH.color }}>
                        {device.latest_ph || device.ph || '-'}
                    </div>
                    {valPH.status === 'warning' && <small style={{color: valPH.color, fontSize:'0.7rem'}}>{valPH.msg}</small>}
                </div>

                {/* Temp */}
                <div className="sensor-item">
                    <div style={{display:'flex', alignItems:'center', gap:'5px', color:'#666', fontSize:'0.85rem', marginBottom:'2px'}}>
                        <Thermometer size={14}/> Temp
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: valTemp.color }}>
                        {device.latest_temperature || device.temperature || '-'} <span style={{fontSize:'0.8rem', color:'#999'}}>°C</span>
                    </div>
                    {valTemp.status === 'warning' && <small style={{color: valTemp.color, fontSize:'0.7rem'}}>{valTemp.msg}</small>}
                </div>

                {/* Turbidity */}
                <div className="sensor-item">
                    <div style={{display:'flex', alignItems:'center', gap:'5px', color:'#666', fontSize:'0.85rem', marginBottom:'2px'}}>
                        <Zap size={14}/> Turbid
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: valTurb.color }}>
                        {device.latest_turbidity || device.turbidity || '-'} <span style={{fontSize:'0.8rem', color:'#999'}}>NTU</span>
                    </div>
                    {valTurb.status === 'warning' && <small style={{color: valTurb.color, fontSize:'0.7rem'}}>{valTurb.msg}</small>}
                </div>

              </div>

              {/* ปุ่มดูรายละเอียด */}
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f5f5f5', display:'flex', justifyContent:'flex-end' }}>
                <span style={{ fontSize: '0.85rem', color: '#007bff', display:'flex', alignItems:'center', gap:'2px' }}>
                    ดูประวัติ <ChevronRight size={16}/>
                </span>
              </div>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
