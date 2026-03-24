// src/Home.js — SmartFarm AI Dashboard
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Activity, PlusCircle,
  ChevronDown, Fish, BarChart2, BookOpen, AlertTriangle, Info, Trash2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import config from './config';
import WaterGauge from './WaterGauge';
import './Home.css';

/* ─── Custom Tooltip for Chart ───────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: '12px', padding: '12px 16px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
        fontSize: '13px', fontWeight: 600
      }}>
        <div style={{ color: '#64748b', marginBottom: '4px' }}>{label}</div>
        <div style={{ color: '#0f172a', fontSize: '18px', fontWeight: 800 }}>{payload[0].value}</div>
      </div>
    );
  }
  return null;
};

/* ─── Main Component ─────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const [modal, setModal]     = useState({ isOpen: false, title: '', content: '', isConfirm: false, onConfirm: null });
  const [waterData, setWaterData] = useState([]);
  const [error, setError]     = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(
    localStorage.getItem('lastSelectedDevice') || ''
  );
  const [loadingDevices, setLoadingDevices] = useState(true);

  /* Load Devices */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchDevices = async () => {
      try {
        const res = await axios.get(`${config.API_BASE_URL}/member/devices`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.length > 0) {
          setDevices(res.data);
          const exists = res.data.some(d => d.device_id === selectedDeviceId);
          if (!selectedDeviceId || !exists) setSelectedDeviceId(res.data[0].device_id);
        }
      } catch { /* silent */ } finally {
        setLoadingDevices(false);
      }
    };
    fetchDevices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  /* Persist device */
  useEffect(() => {
    if (selectedDeviceId) localStorage.setItem('lastSelectedDevice', selectedDeviceId);
  }, [selectedDeviceId]);

  /* Load Water Data */
  useEffect(() => {
    if (!selectedDeviceId) return;
    const token = localStorage.getItem('token');
    const fetch = async () => {
      try {
        const res = await axios.get(
          `${config.API_BASE_URL}/member/water-quality?deviceId=${selectedDeviceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWaterData(res.data || []);
        setError('');
      } catch {
        setError('ไม่สามารถดึงข้อมูลได้ โปรดตรวจสอบการเชื่อมต่ออุปกรณ์');
      }
    };
    fetch();
  }, [selectedDeviceId]);

  /* Logout Logic */
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${config.API_BASE_URL}/member/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('lastSelectedDevice');
      navigate('/login');
    }
  };

  /* Delete Device Logic */
  const confirmDeleteDevice = () => {
    const deviceName = devices.find(d => d.device_id === selectedDeviceId)?.device_name || 'อุปกรณ์นี้';
    setModal({
      isOpen: true,
      title: 'ยืนยันการลบอุปกรณ์',
      content: `คุณแน่ใจหรือไม่ว่าต้องการนำอุปกรณ์ "${deviceName}" ออกจากบัญชีของคุณ? (ผู้ใช้อื่นที่เชื่อมต่ออุปกรณ์นี้อยู่จะไม่ได้รับผลกระทบ)`,
      isConfirm: true,
      onConfirm: executeDeleteDevice
    });
  };

  const executeDeleteDevice = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${config.API_BASE_URL}/member/devices/${selectedDeviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedDevices = devices.filter(d => d.device_id !== selectedDeviceId);
      setDevices(updatedDevices);
      
      if (updatedDevices.length > 0) {
        setSelectedDeviceId(updatedDevices[0].device_id);
      } else {
        setSelectedDeviceId('');
        setWaterData([]); 
      }
      
      setModal({ isOpen: false, title: '', content: '' }); 
    } catch (err) {
      setModal({
        isOpen: true,
        title: 'เกิดข้อผิดพลาด',
        content: 'ไม่สามารถลบอุปกรณ์ได้ในขณะนี้ โปรดลองใหม่อีกครั้ง',
        isConfirm: false
      });
    }
  };

  /* Data processing */
  const latest  = waterData[0] || {};
  const hasData = Boolean(latest.device_id);

  const chartData = hasData ? [
    { name: 'pH',       value: Number(latest.ph)                 || 0, color: '#0d9488' },
    { name: 'DO',       value: Number(latest.dissolved_oxygen)   || 0, color: '#38bdf8' },
    { name: 'Temp °C',  value: Number(latest.temperature)        || 0, color: '#f59e0b' },
    { name: 'Turbidity',value: Number(latest.turbidity)          || 0, color: '#a78bfa' },
  ] : [];

  const handleCloseModal = () => setModal({ isOpen: false, title: '', content: '', isConfirm: false, onConfirm: null });

  return (
    <div className="home-page">

      {/* ── Header ── */}
      <header className="header">
        <div className="brand-logo">
          <div className="logo-icon">
            <Fish size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="brand-name">Smart<span className="brand-accent">Farm</span></span>
        </div>
        <nav className="nav">
          {/* เอาปุ่มประวัติการเข้าสู่ระบบออกแล้ว */}
          <button className="nav-btn" title="เกี่ยวกับ" onClick={() => setModal({ isOpen: true, title: 'SmartFarm AI', content: 'ระบบจัดการและติดตามคุณภาพน้ำอัจฉริยะสำหรับการเพาะเลี้ยงสัตว์น้ำ เวอร์ชัน 1.0 — ออกแบบให้ใช้งานง่ายและแม่นยำสูงสุด', isConfirm: false })}>
            <Info size={17} />
          </button>
          <button className="nav-btn danger" title="ออกจากระบบ" onClick={handleLogout}>
            <LogOut size={17} />
          </button>
        </nav>
      </header>

      {/* ── Hero Strip (Compact) ── */}
      <div className="hero-strip">
        <div className="hero-content">
          <div className="hero-text">
            <h1>ภาพรวมบ่อเลี้ยง</h1>
            <p>ติดตามคุณภาพน้ำแบบ Real-time เพื่อผลผลิตที่ดีที่สุด</p>
          </div>

          {!loadingDevices && devices.length > 0 && (
            <div className="device-actions">
              <div className="device-select-wrapper">
                <span className="device-dot" />
                <select
                  className="device-select"
                  value={selectedDeviceId}
                  onChange={e => setSelectedDeviceId(e.target.value)}
                >
                  {devices.map(d => (
                    <option key={d.device_id} value={d.device_id}>{d.device_name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="device-chevron" />
              </div>
              
              {/* ปุ่มลบอุปกรณ์ */}
              <button 
                className="delete-device-btn" 
                onClick={confirmDeleteDevice} 
                title="ลบอุปกรณ์นี้"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Body ── */}
      <main className="dashboard-body">

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="error-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Sensor Gauges ── */}
        <div className="section-label">คุณภาพน้ำล่าสุด</div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.10 }}
        >
          <WaterGauge
            ph={latest.ph}
            dissolvedOxygen={latest.dissolved_oxygen}
            temperature={latest.temperature}
            turbidity={latest.turbidity}
          />
        </motion.div>

        {/* ── Chart ── */}
        <div className="section-label">สรุปค่าปัจจัยน้ำ</div>
        <motion.div
          className="chart-box"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="chart-box-title">
            <BarChart2 size={18} color="var(--teal)" />
            เปรียบเทียบค่าปัจจัยน้ำล่าสุด
          </div>
          <div style={{ width: '100%', height: 220 }}>
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false} tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500 }}
                    dy={12}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">ไม่มีข้อมูลสำหรับแสดงผล</div>
            )}
          </div>
        </motion.div>

        {/* ── Quick Actions ── */}
        <div className="section-label">เมนูด่วน</div>
        <motion.div
          className="menu-grid"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <button
            className="menu-btn btn-primary"
            onClick={() => navigate(`/realtime?deviceId=${selectedDeviceId}`)}
            disabled={!selectedDeviceId}
          >
            <div className="btn-icon"><Activity size={20} /></div>
            ดูค่าเรียลไทม์
          </button>

          <button
            className="menu-btn btn-sky"
            onClick={() => navigate(selectedDeviceId ? `/water-quality?deviceId=${selectedDeviceId}` : '/water-quality')}
            disabled={!selectedDeviceId}
          >
            <div className="btn-icon"><BarChart2 size={20} /></div>
            ประวัติย้อนหลัง
          </button>

          <button
            className="menu-btn btn-outline"
            onClick={() => navigate('/add-device')}
          >
            <div className="btn-icon"><PlusCircle size={20} /></div>
            ลงทะเบียนเซนเซอร์
          </button>

          <button
            className="menu-btn btn-amber"
            onClick={() => navigate('/shrimp-info')}
          >
            <div className="btn-icon"><BookOpen size={20} /></div>
            คู่มือการดูแลน้ำ
          </button>
        </motion.div>

      </main>

      {/* ── Modal (Bottom Sheet) ── */}
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="modal-sheet"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-handle" />
              <div className="modal-title">{modal.title}</div>
              <div className="modal-body">{modal.content}</div>
              
              <div className="modal-actions">
                {modal.isConfirm ? (
                  <>
                    <button className="modal-btn cancel" onClick={handleCloseModal}>ยกเลิก</button>
                    <button className="modal-btn confirm" onClick={modal.onConfirm}>ลบอุปกรณ์</button>
                  </>
                ) : (
                  <button className="modal-btn primary" onClick={handleCloseModal}>เข้าใจแล้ว</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;
