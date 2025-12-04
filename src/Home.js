// src/home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import config from './config';
import { checkQuality } from './waterStandard'; // <--- เรียกใช้มาตรฐานกลาง
import './home.css'; // (ถ้ามีไฟล์ CSS แยก)
import { 
  Wind, Droplets, Thermometer, Zap, 
  AlertTriangle, CheckCircle, ChevronRight 
} from 'lucide-react';

const Home = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. โหลดข้อมูลและตั้งเวลา Refresh
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // อัปเดตทุก 30 วินาที
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
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

  // 2. ฟังก์ชันเช็คภาพรวมของบ่อ (Device Overall Status)
  const getDeviceStatus = (device) => {
    // ดึงค่าล่าสุดมาเช็ค (รองรับทั้ง key ที่มี 'latest_' และไม่มี)
    const valDO = device.latest_dissolved_oxygen || device.dissolved_oxygen;
    const valPH = device.latest_ph || device.ph;
    const valTemp = device.latest_temperature || device.temperature;
    const valTurb = device.latest_turbidity || device.turbidity;

    // ใช้ logic กลางเช็คทีละค่า
    const qDO = checkQuality('do', valDO);
    const qPH = checkQuality('ph', valPH);
    const qTemp = checkQuality('temp', valTemp);
    const qTurb = checkQuality('turbidity', valTurb);
    
    // ถ้ามีค่าใดค่าหนึ่ง "Warning" -> บ่อนั้นสถานะ "ผิดปกติ" ทันที
    if (qDO.status === 'warning' || qPH.status === 'warning' || qTemp.status === 'warning' || qTurb.status === 'warning') {
        return { status: 'warning', label: 'ผิดปกติ', color: '#dc3545', icon: AlertTriangle, bgColor: '#ffebee', borderColor: '#dc3545' };
    }
    return { status: 'normal', label: 'ปกติ', color: '#28a745', icon: CheckCircle, bgColor: '#e8f5e9', borderColor: '#e0e0e0' };
  };

  if (loading) {
    return <div style={{padding:'40px', textAlign:'center', color:'#666'}}>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="home-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Sarabun, sans-serif' }}>
      
      {/* Header ส่วนบน */}
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>ภาพรวมฟาร์ม</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>สถานะคุณภาพน้ำปัจจุบัน (Real-time)</p>
        </div>
        <button 
            onClick={() => { setLoading(true); fetchDashboardData(); }}
            style={{ 
                background: '#fff', border: '1px solid #ddd', padding: '8px 15px', 
                borderRadius: '20px', cursor: 'pointer', fontSize:'0.85rem',
                display: 'flex', alignItems: 'center', gap: '5px', color: '#555'
            }}
        >
            รีเฟรช
        </button>
      </header>

      {/* Grid แสดงการ์ดแต่ละอุปกรณ์ */}
      <div className="device-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {devices.map((device) => {
          // คำนวณสถานะภาพรวม
          const overall = getDeviceStatus(device);
          const StatusIcon = overall.icon;

          // ดึงค่าและเช็คสถานะรายตัว (เพื่อเอาไปทำสีตัวเลข)
          const valDO = device.latest_dissolved_oxygen || device.dissolved_oxygen;
          const valPH = device.latest_ph || device.ph;
          const valTemp = device.latest_temperature || device.temperature;
          const valTurb = device.latest_turbidity || device.turbidity;

          const qDO = checkQuality('do', valDO);
          const qPH = checkQuality('ph', valPH);
          const qTemp = checkQuality('temp', valTemp);
          const qTurb = checkQuality('turbidity', valTurb);

          return (
            <motion.div 
              key={device.device_id}
              whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              className="device-card"
              onClick={() => navigate(`/water-quality?deviceId=${device.device_id}`)}
              style={{ 
                background: 'white', 
                borderRadius: '16px', 
                padding: '20px', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                border: `2px solid ${overall.borderColor}`, // สีขอบเปลี่ยนตามสถานะ
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom:'1px solid #f0f0f0' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>{device.device_name}</h3>
                <span style={{ 
                    display: 'flex', alignItems: 'center', gap: '5px', 
                    background: overall.bgColor,
                    color: overall.color,
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'
                }}>
                    <StatusIcon size={14} /> {overall.label}
                </span>
              </div>

              {/* Values Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
                {/* DO */}
                <div className="sensor-item">
                    <div style={{display:'flex', alignItems:'center', gap:'5px', color:'#666', fontSize:'0.85rem', marginBottom:'2px'}}>
                        <Wind size={14}/> DO
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: qDO.color }}>
                        {valDO !== null ? valDO : '-'} <span style={{fontSize:'0.8rem', color:'#999', fontWeight:'normal'}}>mg/L</span>
                    </div>
                    {qDO.status === 'warning' && <small style={{color: qDO.color, fontSize:'0.75rem'}}>⚠️ {qDO.msg}</small>}
                </div>

                {/* pH */}
                <div className="sensor-item">
                    <div style={{display:'flex', alignItems:'center', gap:'5px', color:'#666', fontSize:'0.85rem', marginBottom:'2px'}}>
                        <Droplets size={14}/> pH
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: qPH.color }}>
                        {valPH !== null ? valPH : '-'}
                    </div>
                    {qPH.status === 'warning' && <small style={{color: qPH.color, fontSize:'0.75rem'}}>⚠️ {qPH.msg}</small>}
                </div>

                {/* Temp */}
                <div className="sensor-item">
                    <div style={{display:'flex', alignItems:'center', gap:'5px', color:'#666', fontSize:'0.85rem', marginBottom:'2px'}}>
                        <Thermometer size={14}/> Temp
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: qTemp.color }}>
                        {valTemp !== null ? valTemp : '-'} <span style={{fontSize:'0.8rem', color:'#999', fontWeight:'normal'}}>°C</span>
                    </div>
                    {qTemp.status === 'warning' && <small style={{color: qTemp.color, fontSize:'0.75rem'}}>⚠️ {qTemp.msg}</small>}
                </div>

                {/* Turbidity */}
                <div className="sensor-item">
                    <div style={{display:'flex', alignItems:'center', gap:'5px', color:'#666', fontSize:'0.85rem', marginBottom:'2px'}}>
                        <Zap size={14}/> Turbid
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: qTurb.color }}>
                        {valTurb !== null ? valTurb : '-'} <span style={{fontSize:'0.8rem', color:'#999', fontWeight:'normal'}}>NTU</span>
                    </div>
                    {qTurb.status === 'warning' && <small style={{color: qTurb.color, fontSize:'0.75rem'}}>⚠️ {qTurb.msg}</small>}
                </div>

              </div>

              {/* Action Link */}
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f9f9f9', display:'flex', justifyContent:'flex-end' }}>
                <span style={{ fontSize: '0.85rem', color: '#007bff', display:'flex', alignItems:'center', gap:'2px', fontWeight:'500' }}>
                    ดูประวัติย้อนหลัง <ChevronRight size={16}/>
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
