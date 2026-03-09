// src/Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Info, LogOut, Search, AlertTriangle, Clock, Activity, 
  PlusCircle, ChevronDown, Droplets, Thermometer, Wind, Zap, Fish, BarChart2
} from 'lucide-react';

import config from './config';
import { checkQuality } from './waterStandard';
// เปลี่ยนจาก PieChart เป็น BarChart
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState({ isOpen: false, title: '', content: '' });
  const [waterData, setWaterData] = useState([]);
  const [error, setError] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(
    localStorage.getItem('lastSelectedDevice') || ''
  );
  const [loadingDevices, setLoadingDevices] = useState(true);

  // Load Devices
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchDevices = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/member/devices`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.length > 0) {
          setDevices(response.data);
          const currentDeviceExists = response.data.some(d => d.device_id === selectedDeviceId);
          if (!selectedDeviceId || !currentDeviceExists) {
            setSelectedDeviceId(response.data[0].device_id);
          }
        } else {
          setDevices([]);
        }
      } catch (err) {
        console.error("Error fetching devices");
      } finally {
        setLoadingDevices(false);
      }
    };
    fetchDevices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Save Device
  useEffect(() => {
    if (selectedDeviceId) localStorage.setItem('lastSelectedDevice', selectedDeviceId);
  }, [selectedDeviceId]);

  // Load Water Data
  useEffect(() => {
    if (!selectedDeviceId) return;
    const token = localStorage.getItem('token');
    const fetchWaterQuality = async () => {
      try {
        const response = await axios.get(
          `${config.API_BASE_URL}/member/water-quality?deviceId=${selectedDeviceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWaterData(response.data || []);
        setError('');
      } catch (err) {
        setError('ไม่สามารถดึงข้อมูลคุณภาพน้ำได้ โปรดตรวจสอบการเชื่อมต่ออุปกรณ์');
      }
    };
    fetchWaterQuality();
  }, [selectedDeviceId]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${config.API_BASE_URL}/member/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem('token');
      localStorage.removeItem('lastSelectedDevice');
      navigate('/login');
    } catch (error) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const openModal = (title, content) => setModal({ isOpen: true, title, content });
  const closeModal = () => setModal({ isOpen: false, title: '', content: '' });

  // Data Processing
  const latest = waterData.length > 0 ? waterData[0] : {};
  
  const qPH = checkQuality('ph', latest.ph);
  const qDO = checkQuality('do', latest.dissolved_oxygen);
  const qTemp = checkQuality('temp', latest.temperature);
  const qTurb = checkQuality('turbidity', latest.turbidity);

  // เปลี่ยนรูปแบบข้อมูลสำหรับ BarChart
  const chartData = latest.device_id ? [
    { name: 'pH', value: Number(latest.ph) || 0, color: '#0ea5e9' },
    { name: 'DO (mg/L)', value: Number(latest.dissolved_oxygen) || 0, color: '#10b981' },
    { name: 'Temp (°C)', value: Number(latest.temperature) || 0, color: '#f59e0b' },
  ] : [];

  return (
    <div className="home-page">
      <header className="header">
        <div className="brand-logo">
          <Fish size={28} color="var(--primary)" /> SmartFarm AI
        </div>
        <nav className="nav">
          <button className="nav-btn" onClick={() => openModal('เกี่ยวกับ', 'ระบบจัดการคุณภาพน้ำอัจฉริยะ V1.0')}><Info size={20}/></button>
          <button className="nav-btn" onClick={() => navigate('/login-logs')}><Clock size={20}/></button>
          <button className="nav-btn danger" onClick={handleLogout} title="ออกจากระบบ"><LogOut size={20}/></button>
        </nav>
      </header>

      <main className="dashboard-container">
        <section className="controls-section">
          <div className="welcome-text">
            <h1>ภาพรวมบ่อเลี้ยง 🌊</h1>
            <p>ติดตามคุณภาพน้ำแบบ Real-time เพื่อผลผลิตที่ดีที่สุด</p>
          </div>
          
          {!loadingDevices && (
            <div className="device-wrapper">
              <span style={{color:'var(--primary)'}}><Activity size={18}/></span>
              <select 
                className="device-select"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
              >
                {devices.map(d => (
                  <option key={d.device_id} value={d.device_id}>{d.device_name}</option>
                ))}
              </select>
              <ChevronDown size={18} color="var(--secondary)"/>
            </div>
          )}
        </section>

        {error && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} style={{padding:'15px 20px', background:'#fef2f2', color:'#ef4444', borderRadius:'12px', marginBottom:'25px', display:'flex', gap:'12px', alignItems:'center', border:'1px solid #fecaca'}}>
            <AlertTriangle size={20}/> {error}
          </motion.div>
        )}

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration: 0.4}} className="stats-grid">
          
          {/* pH Card */}
          <div className={`stat-card ${qPH.status || 'normal'}`}>
            <div className="card-header">
              <span className="stat-label">ความเป็นกรด-ด่าง (pH)</span>
              <div className="stat-icon"><Droplets size={22} color={qPH.color || 'var(--primary)'}/></div>
            </div>
            <div className="stat-body">
              <span className="stat-value">{latest.ph || '-'}</span>
            </div>
            <div className="stat-footer" style={{color: qPH.color || 'var(--text-muted)'}}>
              {qPH.msg || 'สถานะปกติ'}
            </div>
          </div>

          {/* DO Card */}
          <div className={`stat-card ${qDO.status || 'normal'}`}>
            <div className="card-header">
              <span className="stat-label">ออกซิเจน (DO)</span>
              <div className="stat-icon"><Wind size={22} color={qDO.color || 'var(--primary)'}/></div>
            </div>
            <div className="stat-body">
              <span className="stat-value">{latest.dissolved_oxygen || '-'}</span>
              <span className="stat-unit">mg/L</span>
            </div>
            <div className="stat-footer" style={{color: qDO.color || 'var(--text-muted)'}}>
              {qDO.msg || 'สถานะปกติ'}
            </div>
          </div>

          {/* Temp Card */}
          <div className={`stat-card ${qTemp.status || 'normal'}`}>
            <div className="card-header">
              <span className="stat-label">อุณหภูมิน้ำ</span>
              <div className="stat-icon"><Thermometer size={22} color={qTemp.color || 'var(--primary)'}/></div>
            </div>
            <div className="stat-body">
              <span className="stat-value">{latest.temperature || '-'}</span>
              <span className="stat-unit">°C</span>
            </div>
            <div className="stat-footer" style={{color: qTemp.color || 'var(--text-muted)'}}>
              {qTemp.msg || 'สถานะปกติ'}
            </div>
          </div>

          {/* Turbidity Card */}
          <div className={`stat-card ${qTurb.status || 'normal'}`}>
            <div className="card-header">
              <span className="stat-label">ความขุ่น</span>
              <div className="stat-icon"><Zap size={22} color={qTurb.color || 'var(--primary)'}/></div>
            </div>
            <div className="stat-body">
              <span className="stat-value">{latest.turbidity || '-'}</span>
              <span className="stat-unit">NTU</span>
            </div>
            <div className="stat-footer" style={{color: qTurb.color || 'var(--text-muted)'}}>
              {qTurb.msg || 'สถานะปกติ'}
            </div>
          </div>

        </motion.div>

        <div className="main-grid">
          {/* Chart Section */}
          <div className="card-box">
            <div className="section-title"><BarChart2 size={22} color="var(--primary)"/> ระดับค่าปัจจัยน้ำล่าสุด</div>
            <div style={{width:'100%', height:280}}>
              {latest.device_id ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 14}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}} 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)'}}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{display:'flex', height:'100%', justifyContent:'center', alignItems:'center', color:'var(--text-muted)'}}>
                  ไม่มีข้อมูลสำหรับแสดงผล
                </div>
              )}
            </div>
          </div>

          {/* Action Menu */}
          <div className="card-box">
            <div className="section-title">เมนูจัดการ</div>
            <div className="menu-grid">
              <button className="menu-btn btn-primary" onClick={() => navigate(`/realtime?deviceId=${selectedDeviceId}`)}>
                <Activity size={20}/> ดูกราฟ Real-time
              </button>
              <button className="menu-btn btn-outline" onClick={() => navigate(selectedDeviceId ? `/water-quality?deviceId=${selectedDeviceId}` : '/water-quality')}>
                <Search size={20}/> ประวัติย้อนหลัง
              </button>
              <button className="menu-btn btn-success" onClick={() => navigate('/add-device')}>
                <PlusCircle size={20}/> ลงทะเบียนเซนเซอร์เพิ่ม
              </button>
              <button className="menu-btn btn-outline" onClick={() => navigate('/shrimp-info')}>
                <Info size={20}/> คู่มือการดูแลน้ำ
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modal.isOpen && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(15, 23, 42, 0.6)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', justifyContent:'center', alignItems:'center'}} onClick={closeModal}>
          <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} style={{background:'white', padding:'30px', borderRadius:'20px', width:'90%', maxWidth:'400px', boxShadow:'var(--shadow-hover)'}} onClick={e => e.stopPropagation()}>
            <h3 style={{marginTop:0, color:'var(--text-main)'}}>{modal.title}</h3>
            <p style={{color:'var(--text-muted)', lineHeight:'1.6'}}>{modal.content}</p>
            <button style={{width:'100%', padding:'12px', marginTop:'20px', background:'#f1f5f9', color:'var(--text-main)', fontWeight:'bold', border:'none', borderRadius:'12px', cursor:'pointer', transition:'background 0.2s'}} onClick={closeModal} onMouseOver={e => e.target.style.background = '#e2e8f0'} onMouseOut={e => e.target.style.background = '#f1f5f9'}>
              เข้าใจแล้ว
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Home;
