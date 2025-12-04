// src/Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart2, Info, Phone, LogOut, Search,
  AlertTriangle, Clock, Activity, PlusCircle,
  ChevronDown, Droplets, Thermometer, Wind, Zap
} from 'lucide-react'; // นำเข้า icon เพิ่มเติม

import config from './config';
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

  useEffect(() => {
    if (selectedDeviceId) localStorage.setItem('lastSelectedDevice', selectedDeviceId);
  }, [selectedDeviceId]);

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
        console.error("Error fetching devices:", err);
      } finally {
        setLoadingDevices(false);
      }
    };
    fetchDevices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (!selectedDeviceId) return;
    const token = localStorage.getItem('token');
    const fetchWaterQuality = async () => {
      try {
        const response = await axios.get(
          `${config.API_BASE_URL}/member/water-quality?deviceId=${selectedDeviceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data && response.data.length > 0) {
          setWaterData(response.data);
          setError('');
        } else {
          setWaterData([]);
        }
      } catch (err) {
        setError('ไม่สามารถดึงข้อมูลคุณภาพน้ำได้');
        console.error(err);
      }
    };
    fetchWaterQuality();
  }, [selectedDeviceId]);

  const handleLogout = async () => { /* ...Logic เดิม... */ 
      localStorage.removeItem('token');
      localStorage.removeItem('lastSelectedDevice');
      navigate('/login');
  };

  // Helper Functions (เหมือนเดิม หรือปรับปรุงเล็กน้อย)
  const openModal = (title, content) => setModal({ isOpen: true, title, content });
  const closeModal = () => setModal({ isOpen: false, title: '', content: '' });

  const latestData = waterData.length > 0 ? waterData[0] : {};
  
  // แปลงข้อมูลกราฟ
  const chartData = latestData.device_id ? [
    { name: 'pH', value: Number(latestData.ph) || 0 },
    { name: 'DO', value: Number(latestData.dissolved_oxygen) || 0 },
    { name: 'BOD', value: Number(latestData.bod) || 0 },
    { name: 'Temp', value: Number(latestData.temperature) || 0 },
  ] : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // ฟังก์ชันช่วยประเมินสถานะเพื่อแสดงสี
  const getStatusColor = (val, min, max) => {
    if (!val) return 'status-normal';
    if (val < min || val > max) return 'status-danger';
    return 'status-normal';
  };

  // --- ส่วน Components ย่อย เพื่อความสะอาดของโค้ด ---
  const StatCard = ({ title, value, unit, icon: Icon, statusClass }) => (
    <motion.div whileHover={{ scale: 1.02 }} className="stat-card">
      <div className="stat-header">
        <div className="stat-icon"><Icon size={24} /></div>
        {statusClass === 'status-danger' && <AlertTriangle size={20} color="#dc3545" />}
      </div>
      <div className="stat-value">{value || '-'} <span style={{fontSize: '16px', color: '#888'}}>{unit}</span></div>
      <div className="stat-label">{title}</div>
      <div className={`stat-status ${statusClass}`}>
        {statusClass === 'status-danger' ? 'ผิดปกติ' : 'ปกติ'}
      </div>
    </motion.div>
  );

  return (
    <div className="home-page">
      {/* 1. Header แบบ Clean */}
      <header className="header">
        <div className="brand-logo">
          <Droplets size={24} fill="#007bff" /> ShrimpFarm AI
        </div>
        <nav className="nav">
          {/* ซ่อนลิงก์พวกนี้ในจอมือถือได้ถ้าต้องการ */}
          <a href="#about" className="nav-link" onClick={(e)=>{e.preventDefault(); openModal('เกี่ยวกับเรา', 'ฟาร์มกุ้งยุคใหม่...')}}>เกี่ยวกับ</a>
          
          <button className="btn-icon" onClick={() => openModal('แจ้งเตือน', 'ยังไม่มีการแจ้งเตือนใหม่')} title="การแจ้งเตือน">
            <AlertTriangle size={20} />
          </button>
          <button className="btn-icon" onClick={() => navigate('/login-logs')} title="ประวัติการใช้งาน">
            <Clock size={20} />
          </button>
          <button className="btn-icon danger" onClick={handleLogout} title="ออกจากระบบ">
            <LogOut size={20} />
          </button>
        </nav>
      </header>

      <main className="dashboard-container">
        {/* 2. Welcome & Controls */}
        <section className="controls-section">
          <div className="welcome-text">
            <h1>สวัสดีครับ, เจ้าของฟาร์ม 👋</h1>
            <p>ติดตามคุณภาพน้ำและจัดการอุปกรณ์ของคุณได้ที่นี่</p>
          </div>

          <div className="device-selector-wrapper">
             <span style={{fontWeight:'bold', color:'#555'}}>📡 อุปกรณ์:</span>
             {!loadingDevices && (
                <div style={{position:'relative'}}>
                  <select 
                    className="device-select"
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                  >
                    {devices.map(d => (
                      <option key={d.id} value={d.device_id}>{d.device_name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{marginLeft: -20, pointerEvents:'none'}}/>
                </div>
             )}
          </div>
        </section>

        {error && <div style={{padding: '20px', background:'#ffebee', color:'#c62828', borderRadius:'10px', marginBottom:'20px'}}>{error}</div>}

        {/* 3. Stats Grid (แสดงค่าแยกเป็นการ์ด) */}
        {latestData.device_id ? (
          <div className="stats-grid">
            <StatCard 
              title="ค่า pH (ความเป็นกรดด่าง)" 
              value={latestData.ph} unit="" 
              icon={Droplets}
              statusClass={getStatusColor(latestData.ph, 7.0, 8.5)}
            />
            <StatCard 
              title="ออกซิเจนในน้ำ (DO)" 
              value={latestData.dissolved_oxygen} unit="mg/L" 
              icon={Wind}
              statusClass={latestData.dissolved_oxygen < 5 ? 'status-danger' : 'status-normal'}
            />
            <StatCard 
              title="อุณหภูมิ" 
              value={latestData.temperature} unit="°C" 
              icon={Thermometer}
              statusClass={getStatusColor(latestData.temperature, 26, 32)}
            />
             <StatCard 
              title="ค่าความขุ่น" 
              value={latestData.turbidity} unit="NTU" 
              icon={Zap}
              statusClass="status-normal"
            />
          </div>
        ) : (
          <div style={{textAlign:'center', padding:'40px', color:'#999'}}>รอข้อมูลจากเซ็นเซอร์...</div>
        )}

        {/* 4. Chart & Actions Layout */}
        <div className="main-grid">
          {/* Chart Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="chart-card"
          >
            <div className="section-title">ภาพรวมคุณภาพน้ำ</div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Actions Section */}
          <div className="actions-card">
            <div className="section-title">เมนูด่วน</div>
            
            <button className="action-btn-modern btn-primary" onClick={() => navigate(`/realtime?deviceId=${selectedDeviceId}`)}>
              <Activity size={20} /> ดู Realtime Graph
            </button>
            
            <button className="action-btn-modern btn-outline" onClick={() => navigate(selectedDeviceId ? `/water-quality?deviceId=${selectedDeviceId}` : '/water-quality')}>
              <Search size={20} /> ประวัติย้อนหลัง
            </button>

            <button className="action-btn-modern btn-success" onClick={() => navigate('/add-device')}>
              <PlusCircle size={20} /> เพิ่มอุปกรณ์ใหม่
            </button>
            
             <button className="action-btn-modern btn-outline" onClick={() => navigate('/shrimp-info')}>
              <Info size={20} /> ความรู้เรื่องกุ้ง
            </button>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
               <h2 style={{margin:0}}>{modal.title}</h2>
               <button onClick={closeModal} style={{background:'none', border:'none', fontSize:'20px', cursor:'pointer'}}>×</button>
            </div>
            <div className="modal-content" dangerouslySetInnerHTML={{ __html: modal.content }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
