// src/Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Info, LogOut, Search,
  AlertTriangle, Clock, Activity, PlusCircle,
  ChevronDown, Droplets, Thermometer, Wind, Zap, Fish
} from 'lucide-react';

import config from './config';
import { checkQuality } from './waterStandard'; // <--- 1. Import มาตรฐานกลาง
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

  // Save Device to LocalStorage
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
        setError('ไม่สามารถดึงข้อมูลคุณภาพน้ำได้');
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
      alert('ออกจากระบบล้มเหลว หรือ Session หมดอายุ');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const openModal = (title, content) => setModal({ isOpen: true, title, content });
  const closeModal = () => setModal({ isOpen: false, title: '', content: '' });

  // Data Processing
  const latest = waterData.length > 0 ? waterData[0] : {};
  
  // 2. คำนวณคุณภาพน้ำโดยใช้ฟังก์ชันจาก waterStandard.js
  const qPH = checkQuality('ph', latest.ph);
  const qDO = checkQuality('do', latest.dissolved_oxygen);
  const qTemp = checkQuality('temp', latest.temperature);
  const qTurb = checkQuality('turbidity', latest.turbidity);

  const chartData = latest.device_id ? [
    { name: 'pH', value: Number(latest.ph) || 0 },
    { name: 'DO', value: Number(latest.dissolved_oxygen) || 0 },
    { name: 'Temp', value: Number(latest.temperature) || 0 },
  ] : [];
  const COLORS = ['#0088FE', '#00C49F', '#FF8042'];

  return (
    <div className="home-page">
      {/* Header */}
      <header className="header">
        <div className="brand-logo">
          <Fish size={24} color="#007bff" /> ShrimpFarm AI
        </div>
        <nav className="nav">
          <button className="nav-btn" onClick={() => openModal('เกี่ยวกับ', 'ระบบจัดการฟาร์มกุ้งอัจฉริยะ V1.0')}><Info size={22}/></button>
          <button className="nav-btn" onClick={() => navigate('/login-logs')}><Clock size={22}/></button>
          <button className="nav-btn danger" onClick={handleLogout}><LogOut size={22}/></button>
        </nav>
      </header>

      <main className="dashboard-container">
        {/* Controls */}
        <section className="controls-section">
          <div className="welcome-text">
            <h1>สวัสดีครับ 👋</h1>
            <p>ดูภาพรวมฟาร์มของคุณวันนี้</p>
          </div>
          
          {!loadingDevices && (
            <div className="device-wrapper">
              <span style={{color:'#888', fontSize:'14px'}}>📡</span>
              <div style={{position:'relative', width:'100%'}}>
                <select 
                  className="device-select"
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                >
                  {devices.map(d => (
                    <option key={d.device_id} value={d.device_id}>{d.device_name}</option>
                  ))}
                </select>
              </div>
              <ChevronDown size={16} color="#007bff"/>
            </div>
          )}
        </section>

        {error && <div style={{padding:'15px', background:'#ffebee', color:'#c62828', borderRadius:'10px', marginBottom:'20px', display:'flex', gap:'10px', alignItems:'center'}}><AlertTriangle size={18}/> {error}</div>}

        {/* Stats Grid - 3. ใช้ค่าที่คำนวณมาแสดงผล */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="stats-grid">
          
          {/* pH Card */}
          <div className={`stat-card ${qPH.status}`} style={{borderColor: qPH.status === 'warning' ? qPH.color : ''}}>
            <div className="stat-icon"><Droplets size={20} color={qPH.status === 'warning' ? qPH.color : '#555'}/></div>
            <div className="stat-value" style={{color: qPH.color}}>{latest.ph || '-'}</div>
            <div className="stat-label">
                ค่า pH <br/>
                {qPH.status === 'warning' && <small style={{color: qPH.color, fontWeight:'bold'}}>{qPH.msg}</small>}
            </div>
          </div>

          {/* DO Card */}
          <div className={`stat-card ${qDO.status}`} style={{borderColor: qDO.status === 'warning' ? qDO.color : ''}}>
            <div className="stat-icon"><Wind size={20} color={qDO.status === 'warning' ? qDO.color : '#555'}/></div>
            <div className="stat-value" style={{color: qDO.color}}>{latest.dissolved_oxygen || '-'} <span className="stat-unit">mg/L</span></div>
            <div className="stat-label">
                ออกซิเจน (DO) <br/>
                {qDO.status === 'warning' && <small style={{color: qDO.color, fontWeight:'bold'}}>{qDO.msg}</small>}
            </div>
          </div>

          {/* Temp Card */}
          <div className={`stat-card ${qTemp.status}`} style={{borderColor: qTemp.status === 'warning' ? qTemp.color : ''}}>
            <div className="stat-icon"><Thermometer size={20} color={qTemp.status === 'warning' ? qTemp.color : '#555'}/></div>
            <div className="stat-value" style={{color: qTemp.color}}>{latest.temperature || '-'} <span className="stat-unit">°C</span></div>
            <div className="stat-label">
                อุณหภูมิ <br/>
                {qTemp.status === 'warning' && <small style={{color: qTemp.color, fontWeight:'bold'}}>{qTemp.msg}</small>}
            </div>
          </div>

          {/* Turbidity Card */}
          <div className={`stat-card ${qTurb.status}`} style={{borderColor: qTurb.status === 'warning' ? qTurb.color : ''}}>
            <div className="stat-icon"><Zap size={20} color={qTurb.status === 'warning' ? qTurb.color : '#555'}/></div>
            <div className="stat-value" style={{color: qTurb.color}}>{latest.turbidity || '-'} <span className="stat-unit">NTU</span></div>
            <div className="stat-label">
                ความขุ่น <br/>
                {qTurb.status === 'warning' && <small style={{color: qTurb.color, fontWeight:'bold'}}>{qTurb.msg}</small>}
            </div>
          </div>

        </motion.div>

        {/* Charts & Actions */}
        <div className="main-grid">
          {/* Chart */}
          <div className="card-box">
            <div className="section-title">สัดส่วนค่าคุณภาพน้ำ</div>
            <div style={{width:'100%', height:250}}>
              {latest.device_id ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{textAlign:'center', color:'#999', paddingTop:'80px'}}>ไม่มีข้อมูล</div>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="card-box">
            <div className="section-title">เมนูด่วน</div>
            <div className="menu-grid">
              <button className="menu-btn btn-primary" onClick={() => navigate(`/realtime?deviceId=${selectedDeviceId}`)}>
                <Activity size={20}/> กราฟ Realtime
              </button>
              <button className="menu-btn btn-outline" onClick={() => navigate(selectedDeviceId ? `/water-quality?deviceId=${selectedDeviceId}` : '/water-quality')}>
                <Search size={20}/> ประวัติย้อนหลัง
              </button>
              <button className="menu-btn btn-success" onClick={() => navigate('/add-device')}>
                <PlusCircle size={20}/> เพิ่มอุปกรณ์
              </button>
              <button className="menu-btn btn-outline" onClick={() => navigate('/shrimp-info')}>
                <Info size={20}/> ความรู้เรื่องกุ้ง
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modal.isOpen && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', justifyContent:'center', alignItems:'center'}} onClick={closeModal}>
          <div style={{background:'white', padding:'25px', borderRadius:'16px', width:'90%', maxWidth:'400px'}} onClick={e => e.stopPropagation()}>
            <h3 style={{marginTop:0}}>{modal.title}</h3>
            <p>{modal.content}</p>
            <button style={{width:'100%', padding:'10px', marginTop:'15px', background:'#eee', border:'none', borderRadius:'8px', cursor:'pointer'}} onClick={closeModal}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
