// src/Realtime.js — อ่าน threshold สดทุก render + ฟัง event เมื่อค่าเปลี่ยน
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Activity, Droplets, Thermometer,
  Wind, Zap, AlertTriangle, CheckCircle, Sliders
} from 'lucide-react';
import './Realtime.css';

import { database } from './firebaseConfig';
import { ref, onValue } from "firebase/database";
import { getThresholds } from './ThresholdSettings';

// ─── คำนวณ status จาก threshold ปัจจุบัน (อ่านสดจาก localStorage) ──────────
function computeStatus(type, value) {
  const t = getThresholds();
  const cfg = t[type];
  if (!cfg) return 'normal';
  const v = Number(value);
  if (type === 'turbidity') {
    if (v > cfg.warnHigh) return 'danger';
    if (v > cfg.okHigh)   return 'warning';
    return 'normal';
  }
  if (v < cfg.warnLow || v > cfg.warnHigh) return 'danger';
  if (v < cfg.okLow   || v > cfg.okHigh)   return 'warning';
  return 'normal';
}

function Realtime() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('deviceId');

  const [sensorData, setSensorData] = useState({
    temp: 0, do: 0, ph: 0, turbidity: 0, timestamp: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // thresholdVersion — เพิ่มเมื่อ threshold เปลี่ยน เพื่อบังคับ re-render cards
  const [thresholdVersion, setThresholdVersion] = useState(0);

  // ─── ฟัง event เมื่อ threshold ถูกบันทึก ────────────────────────────────
  useEffect(() => {
    const bump = () => setThresholdVersion(v => v + 1);
    // cross-tab: storage event
    window.addEventListener('storage', bump);
    // same-tab: custom event ที่ ThresholdSettings.js dispatch หลัง save
    window.addEventListener('thresholdUpdated', bump);
    return () => {
      window.removeEventListener('storage', bump);
      window.removeEventListener('thresholdUpdated', bump);
    };
  }, []);

  // ─── Firebase realtime ───────────────────────────────────────────────────
  useEffect(() => {
    if (!deviceId) {
      setError('ไม่พบรหัสอุปกรณ์ (Device ID)');
      setLoading(false);
      return;
    }

    const sensorRef = ref(database, `/devices/${deviceId}/current`);
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData({
          temp:      data.temperature      ?? 0,
          do:        data.dissolved_oxygen ?? 0,
          ph:        data.ph               ?? 0,
          turbidity: data.turbidity        ?? 0,
          timestamp: data.timestamp
        });
      }
      setLoading(false);
    }, (err) => {
      console.error('Firebase error:', err);
      setError('ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deviceId]);

  // ─── SensorCard ──────────────────────────────────────────────────────────
  // รับ thresholdVersion เป็น prop เพื่อให้ React รู้ว่าต้อง re-render
  const SensorCard = ({ title, value, unit, icon: Icon, type, color }) => {
    // eslint-disable-next-line no-unused-vars
    const _ = thresholdVersion; // subscribe to version so card re-renders
    const status = computeStatus(type, value);

    const statusLabel = {
      normal:  'ปกติ',
      warning: 'เฝ้าระวัง',
      danger:  'อันตราย',
    }[status];

    return (
      <div className={`rt-card status-${status}`}>
        <div className="rt-card-header">
          <div className="rt-card-title">
            <div className="rt-icon-wrapper" style={{ color, background: `${color}15` }}>
              <Icon size={20} />
            </div>
            <span>{title}</span>
          </div>
          {status === 'normal'  && <CheckCircle  size={16} className="rt-status-icon text-green" title="ปกติ" />}
          {status === 'warning' && <AlertTriangle size={16} className="rt-status-icon text-amber" title="เฝ้าระวัง" />}
          {status === 'danger'  && <AlertTriangle size={16} className="rt-status-icon text-rose"  title="อันตราย" />}
        </div>
        <div className="rt-card-body">
          <div className="rt-value-wrap">
            <span className="rt-value">{Number(value).toFixed(type === 'ph' ? 2 : 1)}</span>
            <span className="rt-unit">{unit}</span>
          </div>
          {/* แสดง label สถานะใต้ค่า */}
          <div className={`rt-status-label rt-label-${status}`}>{statusLabel}</div>
        </div>
      </div>
    );
  };

  return (
    <motion.div className="rt-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

      {/* ── Header ── */}
      <header className="rt-header">
        <button className="rt-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
        </button>
        <div className="rt-header-title">ข้อมูลคุณภาพน้ำ</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="rt-back-btn"
            onClick={() => navigate('/threshold-settings')}
            title="ตั้งค่าเกณฑ์"
          >
            <Sliders size={16} />
          </button>
          <div className="rt-live-badge">
            <span className="rt-live-dot" /> LIVE
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="rt-main">
        <div className="rt-device-info">
          <Activity size={18} className="text-teal" />
          <span>อุปกรณ์ปัจจุบัน: <strong>{deviceId || 'ไม่ระบุ'}</strong></span>
        </div>

        {loading ? (
          <div className="rt-loading">
            <div className="rt-spinner" />
            <p>กำลังเชื่อมต่อกับเซนเซอร์...</p>
          </div>
        ) : error ? (
          <div className="rt-error">
            <AlertTriangle size={24} />
            <p>{error}</p>
            <button onClick={() => navigate('/')} className="rt-btn-primary">กลับไปเลือกอุปกรณ์</button>
          </div>
        ) : (
          <motion.div
            className="rt-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SensorCard title="ค่า pH"        value={sensorData.ph}        unit=""     icon={Droplets}    type="ph"        color="#0ea5e9" />
            <SensorCard title="ออกซิเจน (DO)" value={sensorData.do}        unit="mg/L" icon={Wind}        type="do"        color="#0d9488" />
            <SensorCard title="อุณหภูมิ"      value={sensorData.temp}      unit="°C"   icon={Thermometer} type="temp"      color="#f59e0b" />
            <SensorCard title="ความขุ่น"      value={sensorData.turbidity} unit="NTU"  icon={Zap}         type="turbidity" color="#8b5cf6" />
          </motion.div>
        )}

        <AnimatePresence>
          {!loading && !error && (
            <motion.div
              className="rt-footer-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              อัปเดตล่าสุด: {sensorData.timestamp
                ? new Date(sensorData.timestamp).toLocaleString('th-TH')
                : new Date().toLocaleTimeString('th-TH')}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

export default Realtime;
