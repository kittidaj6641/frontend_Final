// src/Home.js — SmartFarm AI Dashboard (Redesigned)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Clock, Activity, PlusCircle,
  ChevronDown, Droplets, Thermometer, Wind, Zap,
  Fish, BarChart2, BookOpen, AlertTriangle, Info
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import config from './config';
import { checkQuality } from './waterStandard';
import WaterGauge from './WaterGauge';
import './Home.css';

/* ─── Custom Tooltip for Chart ───────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #d1faf4',
        borderRadius: 12, padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(13,155,136,0.12)',
        fontSize: 13, fontWeight: 600
      }}>
        <div style={{ color: '#6b8fa3', marginBottom: 2 }}>{label}</div>
        <div style={{ color: '#0d1b2a', fontSize: 18 }}>{payload[0].value}</div>
      </div>
    );
  }
  return null;
};

/* ─── Stat Card Component ────────────── */
const StatCard = ({ label, value, unit, quality, icon: Icon }) => (
  <motion.div
    className={`stat-card ${quality.status || ''}`}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
  >
    <div className="card-label">
      <Icon size={14} />
      {label}
    </div>
    <div className="card-value-row">
      <span className="card-value">{value !== undefined && value !== null && value !== '' ? value : '—'}</span>
      {unit && <span className="card-unit">{unit}</span>}
    </div>
    <span className="card-status">{quality.msg || 'รอข้อมูล'}</span>
  </motion.div>
);

/* ─── Main Component ─────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const [modal, setModal]     = useState({ isOpen: false, title: '', content: '' });
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

  /* Data processing */
  const latest   = waterData[0] || {};
  const qPH      = checkQuality('ph',          latest.ph);
  const qDO      = checkQuality('do',           latest.dissolved_oxygen);
  const qTemp    = checkQuality('temp',         latest.temperature);
  const qTurb    = checkQuality('turbidity',    latest.turbidity);
  const hasData  = Boolean(latest.device_id);

  const chartData = hasData ? [
    { name: 'pH',       value: Number(latest.ph)                 || 0, color: '#0d9488' },
    { name: 'DO',       value: Number(latest.dissolved_oxygen)    || 0, color: '#38bdf8' },
    { name: 'Temp °C',  value: Number(latest.temperature)         || 0, color: '#f59e0b' },
    { name: 'Turbidity',value: Number(latest.turbidity)           || 0, color: '#a78bfa' },
  ] : [];

  return (
    <div className="home-page">

      {/* ── Header ── */}
      <header className="header">
        <div className="brand-logo">
          <div className="logo-icon">
            <Fish size={18} color="#fff" />
          </div>
          <span className="brand-name">Smart<span className="brand-accent">Farm</span></span>
        </div>
        <nav className="nav">
          <button className="nav-btn" title="ประวัติการเข้าสู่ระบบ" onClick={() => navigate('/login-logs')}>
            <Clock size={17} />
          </button>
          <button className="nav-btn" title="เกี่ยวกับ" onClick={() => setModal({ isOpen: true, title: 'SmartFarm AI', content: 'ระบบจัดการและติดตามคุณภาพน้ำอัจฉริยะสำหรับการเพาะเลี้ยงสัตว์น้ำ เวอร์ชัน 1.0 — ออกแบบให้ใช้งานง่ายและแม่นยำสูงสุด' })}>
            <Info size={17} />
          </button>
          <button className="nav-btn danger" title="ออกจากระบบ" onClick={handleLogout}>
            <LogOut size={17} />
          </button>
        </nav>
      </header>

      {/* ── Hero Strip ── */}
      <div className="hero-strip">
        <div className="hero-text">
          <h1>ภาพรวมบ่อเลี้ยง 🌊</h1>
          <p>ติดตามคุณภาพน้ำแบบ Real-time เพื่อผลผลิตที่ดีที่สุด</p>
        </div>

        {!loadingDevices && devices.length > 0 && (
          <div className="device-bar">
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
              <ChevronDown size={15} className="device-chevron" />
            </div>
          </div>
        )}
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

        {/* ── Sensor Cards ── */}
        <div className="section-label">ค่าล่าสุด</div>
        <div className="stats-grid">
          <StatCard label="pH"        value={latest.ph}                unit=""      quality={qPH}   icon={Droplets}    />
          <StatCard label="DO"        value={latest.dissolved_oxygen}  unit="mg/L"  quality={qDO}   icon={Wind}        />
          <StatCard label="อุณหภูมิ"  value={latest.temperature}       unit="°C"    quality={qTemp} icon={Thermometer} />
          <StatCard label="ความขุ่น"  value={latest.turbidity}         unit="NTU"   quality={qTurb} icon={Zap}         />
        </div>

        {/* ── Gauges ── */}
        <div className="section-label">หน้าปัดระดับค่าน้ำ</div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
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
          <div style={{ width: '100%', height: 200 }}>
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6f7f5" />
                  <XAxis
                    dataKey="name"
                    axisLine={false} tickLine={false}
                    tick={{ fill: '#6b8fa3', fontSize: 12 }}
                    dy={8}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b8fa3', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0faf8' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
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
            className="menu-btn btn-primary full-width"
            onClick={() => navigate(`/realtime?deviceId=${selectedDeviceId}`)}
          >
            <div className="btn-icon"><Activity size={18} /></div>
            ดูกราฟ Real-time
          </button>

          <button
            className="menu-btn btn-sky"
            onClick={() => navigate(selectedDeviceId ? `/water-quality?deviceId=${selectedDeviceId}` : '/water-quality')}
          >
            <div className="btn-icon"><BarChart2 size={18} /></div>
            ประวัติย้อนหลัง
          </button>

          <button
            className="menu-btn btn-outline"
            onClick={() => navigate('/add-device')}
          >
            <div className="btn-icon"><PlusCircle size={18} /></div>
            ลงทะเบียนเซนเซอร์
          </button>

          <button
            className="menu-btn btn-amber full-width"
            onClick={() => navigate('/shrimp-info')}
          >
            <div className="btn-icon"><BookOpen size={18} /></div>
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
            onClick={() => setModal({ isOpen: false, title: '', content: '' })}
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
              <button
                className="modal-close-btn"
                onClick={() => setModal({ isOpen: false, title: '', content: '' })}
              >
                เข้าใจแล้ว
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;
