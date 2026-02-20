// src/Home.js — Deep Ocean Luxury Redesign
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info, LogOut, Search, AlertTriangle, Clock, Activity,
  PlusCircle, ChevronDown, Droplets, Thermometer, Wind, Zap,
  Fish, BarChart2, ChevronRight, X
} from 'lucide-react';

import config from './config';
import { checkQuality } from './waterStandard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import './Home.css';

/* ─── Custom Recharts Tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#0a2240',
        border: '1px solid rgba(0,212,180,0.35)',
        borderRadius: 12,
        padding: '10px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <p style={{ margin: 0, color: '#a8cce0', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>{label}</p>
        <p style={{ margin: '4px 0 0', color: '#e2f4ff', fontWeight: 700, fontSize: 20, fontFamily: 'Space Mono, monospace' }}>
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

/* ─── Stat Card Component ─── */
const StatCard = ({ label, value, unit, status, msg, color, icon: Icon }) => (
  <div className={`stat-card ${status || ''}`}>
    <div className="card-header">
      <span className="stat-label">{label}</span>
      <div className="stat-icon">
        <Icon size={20} color={color || 'var(--teal)'} />
      </div>
    </div>
    <div className="stat-body">
      <span className="stat-value">{value ?? '—'}</span>
      {unit && <span className="stat-unit">{unit}</span>}
    </div>
    <div className="stat-footer" style={{ color: color || 'var(--text-muted)' }}>
      {msg || 'ไม่มีข้อมูล'}
    </div>
  </div>
);

/* ─── Main Component ─── */
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

  /* Load Devices */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchDevices = async () => {
      try {
        const { data } = await axios.get(`${config.API_BASE_URL}/member/devices`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data?.length > 0) {
          setDevices(data);
          const exists = data.some(d => d.device_id === selectedDeviceId);
          if (!selectedDeviceId || !exists) setSelectedDeviceId(data[0].device_id);
        }
      } catch { /* silent */ }
      finally { setLoadingDevices(false); }
    };
    fetchDevices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  /* Save Device */
  useEffect(() => {
    if (selectedDeviceId) localStorage.setItem('lastSelectedDevice', selectedDeviceId);
  }, [selectedDeviceId]);

  /* Load Water Data */
  useEffect(() => {
    if (!selectedDeviceId) return;
    const token = localStorage.getItem('token');
    const fetchWaterQuality = async () => {
      try {
        const { data } = await axios.get(
          `${config.API_BASE_URL}/member/water-quality?deviceId=${selectedDeviceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWaterData(data || []);
        setError('');
      } catch {
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
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('lastSelectedDevice');
      navigate('/login');
    }
  };

  const openModal = (title, content) => setModal({ isOpen: true, title, content });
  const closeModal = () => setModal({ isOpen: false, title: '', content: '' });

  /* Data Processing */
  const latest = waterData[0] || {};
  const hasData = !!latest.device_id;
  const qPH   = checkQuality('ph', latest.ph);
  const qDO   = checkQuality('do', latest.dissolved_oxygen);
  const qTemp  = checkQuality('temp', latest.temperature);
  const qTurb  = checkQuality('turbidity', latest.turbidity);

  const chartData = hasData ? [
    { name: 'pH',   value: Number(latest.ph) || 0, color: '#38bdf8' },
    { name: 'DO',   value: Number(latest.dissolved_oxygen) || 0, color: '#00d4b4' },
    { name: 'Temp', value: Number(latest.temperature) || 0, color: '#f59e0b' },
    { name: 'Turb', value: Number(latest.turbidity) || 0, color: '#a78bfa' },
  ] : [];

  /* Timestamp */
  const timestamp = hasData && latest.timestamp
    ? new Date(latest.timestamp).toLocaleString('th-TH', {
        dateStyle: 'medium', timeStyle: 'short'
      })
    : null;

  return (
    <div className="home-page">
      {/* ─── Header ─── */}
      <header className="header">
        <div className="brand-logo">
          <div className="brand-logo-icon">
            <Fish size={20} color="#041020" />
          </div>
          <span>
            <span className="brand-name-main">Smart</span>
            <span className="brand-name-sub">Farm</span>
            <span className="brand-name-main"> AI</span>
          </span>
        </div>

        <nav className="nav">
          <button
            className="nav-btn"
            title="เกี่ยวกับระบบ"
            onClick={() => openModal('เกี่ยวกับระบบ', 'ระบบจัดการคุณภาพน้ำอัจฉริยะ V1.0 — ติดตาม pH, DO, อุณหภูมิ และความขุ่นแบบ Real-time เพื่อเพิ่มประสิทธิภาพการเลี้ยงกุ้ง')}
          >
            <Info size={18} />
          </button>
          <button className="nav-btn" title="ประวัติการเข้าสู่ระบบ" onClick={() => navigate('/login-logs')}>
            <Clock size={18} />
          </button>
          <button className="nav-btn danger" title="ออกจากระบบ" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </nav>
      </header>

      {/* ─── Main ─── */}
      <main className="dashboard-container">

        {/* Controls */}
        <section className="controls-section">
          <div className="welcome-text">
            <h1>ภาพรวมบ่อเลี้ยง 🌊</h1>
            <p>ติดตามคุณภาพน้ำแบบ Real-time เพื่อผลผลิตที่ดีที่สุด</p>
          </div>

          {!loadingDevices && devices.length > 0 && (
            <div className="device-wrapper">
              <div className="device-status-dot" />
              <select
                className="device-select"
                value={selectedDeviceId}
                onChange={e => setSelectedDeviceId(e.target.value)}
              >
                {devices.map(d => (
                  <option key={d.device_id} value={d.device_id}>{d.device_name}</option>
                ))}
              </select>
              <ChevronDown size={16} color="var(--text-muted)" />
            </div>
          )}
        </section>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="error-alert"
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timestamp */}
        {timestamp && (
          <div className="timestamp-badge">
            <Clock size={12} />
            อัปเดตล่าสุด: {timestamp}
          </div>
        )}

        {/* Stat Cards */}
        <div className="stats-grid">
          <StatCard label="ความเป็นกรด-ด่าง (pH)" value={latest.ph} icon={Droplets}
            status={qPH.status} msg={qPH.msg} color={qPH.color} />
          <StatCard label="ออกซิเจนละลายน้ำ (DO)" value={latest.dissolved_oxygen} unit="mg/L" icon={Wind}
            status={qDO.status} msg={qDO.msg} color={qDO.color} />
          <StatCard label="อุณหภูมิน้ำ" value={latest.temperature} unit="°C" icon={Thermometer}
            status={qTemp.status} msg={qTemp.msg} color={qTemp.color} />
          <StatCard label="ความขุ่น (Turbidity)" value={latest.turbidity} unit="NTU" icon={Zap}
            status={qTurb.status} msg={qTurb.msg} color={qTurb.color} />
        </div>

        {/* Chart + Menu */}
        <div className="main-grid">

          {/* Chart */}
          <div className="card-box">
            <div className="section-title">
              <div className="section-title-icon">
                <BarChart2 size={16} color="var(--teal)" />
              </div>
              ระดับค่าปัจจัยน้ำล่าสุด
            </div>

            <div style={{ width: '100%', height: 280 }}>
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      {chartData.map((entry, i) => (
                        <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.4} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(0,212,180,0.08)"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#4e7a9a', fontSize: 13, fontFamily: 'Space Mono, monospace' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#4e7a9a', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,212,180,0.04)' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={70}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} stroke={entry.color} strokeWidth={1} strokeOpacity={0.3} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{
                  display: 'flex',
                  height: '100%',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 12,
                  color: 'var(--text-muted)',
                }}>
                  <BarChart2 size={40} strokeWidth={1} />
                  <span style={{ fontSize: 14 }}>ไม่มีข้อมูลสำหรับแสดงผล</span>
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="card-box">
            <div className="section-title">
              <div className="section-title-icon">
                <Activity size={16} color="var(--teal)" />
              </div>
              เมนูจัดการ
            </div>

            <div className="menu-grid">
              <button
                className="menu-btn btn-primary"
                onClick={() => navigate(`/realtime?deviceId=${selectedDeviceId}`)}
              >
                <Activity size={18} />
                ดูกราฟ Real-time
                <ChevronRight size={16} className="menu-btn-arrow" />
              </button>

              <button
                className="menu-btn btn-outline"
                onClick={() => navigate(selectedDeviceId ? `/water-quality?deviceId=${selectedDeviceId}` : '/water-quality')}
              >
                <Search size={18} />
                ประวัติย้อนหลัง
                <ChevronRight size={16} className="menu-btn-arrow" />
              </button>

              <button
                className="menu-btn btn-success"
                onClick={() => navigate('/add-device')}
              >
                <PlusCircle size={18} />
                ลงทะเบียนเซนเซอร์เพิ่ม
                <ChevronRight size={16} className="menu-btn-arrow" />
              </button>

              <button
                className="menu-btn btn-outline"
                onClick={() => navigate('/shrimp-info')}
              >
                <Info size={18} />
                คู่มือการดูแลน้ำ
                <ChevronRight size={16} className="menu-btn-arrow" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Modal ─── */}
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3>{modal.title}</h3>
                <button
                  onClick={closeModal}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4, marginTop: -4,
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <p>{modal.content}</p>
              <button className="modal-btn" onClick={closeModal}>รับทราบ</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
