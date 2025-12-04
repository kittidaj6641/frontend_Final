// src/water-quality.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import config from './config';
import './water-quality.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  ArrowLeft, Activity, Table, Droplets, Wind, Thermometer, AlertCircle 
} from 'lucide-react';

const WaterQuality = () => {
  const [waterData, setWaterData] = useState([]);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'
  const [selectedParam, setSelectedParam] = useState('dissolved_oxygen'); // ค่าเริ่มต้นกราฟ

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('deviceId');

  useEffect(() => {
    const fetchWaterQuality = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const url = deviceId 
          ? `${config.API_BASE_URL}/member/water-quality?deviceId=${deviceId}`
          : `${config.API_BASE_URL}/member/water-quality`;

        const response = await axios.get(url, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        // กลับด้านข้อมูลเพื่อให้กราฟแสดงจาก อดีต -> ปัจจุบัน (ซ้ายไปขวา)
        // แต่ตารางเราอยากโชว์ล่าสุดก่อน ก็ใช้ array เดิมได้
        setWaterData(response.data);
      } catch (error) {
        if (error.response?.status === 403) {
           localStorage.removeItem('token');
           navigate('/login');
        } else {
           setError('ไม่สามารถดึงข้อมูลได้');
        }
      }
    };

    fetchWaterQuality();
    const intervalId = setInterval(fetchWaterQuality, 10000); // Update ทุก 10 วิ
    return () => clearInterval(intervalId);
  }, [navigate, deviceId]);

  const handleLogout = async () => { /* ...Logout Logic เดิม... */ };

  // Helper: ตรวจสอบค่าว่าปกติไหม
  const isNormal = (type, value) => {
    if (value === null || value === undefined) return true;
    switch(type) {
        case 'ph': return value >= 7.5 && value <= 8.5;
        case 'do': return value >= 4;
        case 'temp': return value >= 26 && value <= 32;
        default: return true;
    }
  };

  const latest = waterData.length > 0 ? waterData[0] : {};
  
  // ข้อมูลสำหรับกราฟ (ต้องเรียงจากเก่า -> ใหม่)
  const chartData = [...waterData].reverse().map(item => ({
      time: new Date(item.recorded_at).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'}),
      ph: item.ph,
      do: item.dissolved_oxygen || item.oxygen,
      temp: item.temperature,
      salinity: item.salinity
  }));

  const parameters = [
    { key: 'dissolved_oxygen', label: 'ออกซิเจน (DO)', color: '#0088FE', unit: 'mg/L' },
    { key: 'ph', label: 'ค่า pH', color: '#8884d8', unit: '' },
    { key: 'temperature', label: 'อุณหภูมิ', color: '#FF8042', unit: '°C' },
    { key: 'salinity', label: 'ความเค็ม', color: '#00C49F', unit: 'ppt' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="water-quality-page"
    >
      {/* 1. Header */}
      <header className="page-header">
        <div className="header-left">
            <button className="back-btn" onClick={() => navigate('/')}>
                <ArrowLeft size={20} /> กลับหน้าหลัก
            </button>
            <div>
                <h2 style={{margin:0}}>คุณภาพน้ำย้อนหลัง</h2>
                {deviceId && <span className="device-badge">Device ID: {deviceId}</span>}
            </div>
        </div>
      </header>

      {/* 2. Latest Status Cards */}
      <section className="latest-stats-grid">
         <div className={`stat-card-small ${isNormal('do', latest.dissolved_oxygen) ? 'normal' : 'warning'}`}>
            <span className="stat-label"><Wind size={16}/> ออกซิเจน (DO)</span>
            <span className="stat-value">{latest.dissolved_oxygen || '-'} <span className="stat-unit">mg/L</span></span>
         </div>
         <div className={`stat-card-small ${isNormal('ph', latest.ph) ? 'normal' : 'warning'}`}>
            <span className="stat-label"><Droplets size={16}/> ค่า pH</span>
            <span className="stat-value">{latest.ph || '-'}</span>
         </div>
         <div className={`stat-card-small ${isNormal('temp', latest.temperature) ? 'normal' : 'warning'}`}>
            <span className="stat-label"><Thermometer size={16}/> อุณหภูมิ</span>
            <span className="stat-value">{latest.temperature || '-'} <span className="stat-unit">°C</span></span>
         </div>
      </section>

      {/* 3. Main Content (Chart & Table) */}
      <section className="analysis-container">
        <div className="tabs">
            <button 
                className={`tab-btn ${viewMode === 'chart' ? 'active' : ''}`}
                onClick={() => setViewMode('chart')}
            >
                <Activity size={18} /> กราฟแนวโน้ม
            </button>
            <button 
                className={`tab-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
            >
                <Table size={18} /> ตารางข้อมูลดิบ
            </button>
        </div>

        {viewMode === 'chart' ? (
            <div>
                <div className="filter-bar">
                    <select 
                        value={selectedParam} 
                        onChange={(e) => setSelectedParam(e.target.value)}
                        style={{padding:'8px', borderRadius:'6px', border:'1px solid #ddd'}}
                    >
                        {parameters.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {selectedParam === 'dissolved_oxygen' && <Line type="monotone" dataKey="do" stroke="#0088FE" strokeWidth={3} name="Oxygen" />}
                            {selectedParam === 'ph' && <Line type="monotone" dataKey="ph" stroke="#8884d8" strokeWidth={3} name="pH" />}
                            {selectedParam === 'temperature' && <Line type="monotone" dataKey="temp" stroke="#FF8042" strokeWidth={3} name="Temp" />}
                            {selectedParam === 'salinity' && <Line type="monotone" dataKey="salinity" stroke="#00C49F" strokeWidth={3} name="Salinity" />}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        ) : (
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>วัน/เวลา</th>
                            <th>DO (mg/L)</th>
                            <th>pH</th>
                            <th>Temp (°C)</th>
                            <th>Salinity (ppt)</th>
                            <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {waterData.map((row, index) => {
                            const isOk = isNormal('do', row.dissolved_oxygen) && isNormal('ph', row.ph);
                            return (
                                <tr key={index}>
                                    <td>{new Date(row.recorded_at).toLocaleString('th-TH')}</td>
                                    <td>{row.dissolved_oxygen}</td>
                                    <td>{row.ph}</td>
                                    <td>{row.temperature}</td>
                                    <td>{row.salinity}</td>
                                    <td>
                                        <span className={`status-badge ${isOk ? 'bg-success' : 'bg-danger'}`}>
                                            {isOk ? 'ปกติ' : 'ผิดปกติ'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </section>

    </motion.div>
  );
};

export default WaterQuality;
