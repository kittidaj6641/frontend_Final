// src/ThresholdSettings.js
// Panel ปรับค่า threshold สำหรับ pH, DO, Temperature, Turbidity
// บันทึกลง localStorage และ export ฟังก์ชันอ่านค่า

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sliders, RotateCcw, Save,
  Droplets, Wind, Thermometer, Zap,
  CheckCircle, Info
} from 'lucide-react';
import './ThresholdSettings.css';

// ─── ค่า Default ──────────────────────────────────────────────────────────────
export const DEFAULT_THRESHOLDS = {
  ph:        { warnLow: 5.0,  okLow: 6.5,  okHigh: 8.5,  warnHigh: 9.0  },
  do:        { warnLow: 2.0,  okLow: 3.0,  okHigh: 8.0,  warnHigh: 12.0 },
  temp:      { warnLow: 18.0, okLow: 22.0, okHigh: 30.0, warnHigh: 35.0 },
  turbidity: { warnLow: 0,    okLow: 0,    okHigh: 500,  warnHigh: 750  },
};

const STORAGE_KEY = 'smartfarm_thresholds';

// ─── ฟังก์ชัน Public ──────────────────────────────────────────────────────────
export function getThresholds() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_THRESHOLDS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_THRESHOLDS;
}

export function saveThresholds(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getStatus(type, value) {
  const t = getThresholds()[type];
  if (!t) return 'normal';
  const v = Number(value);
  if (v < t.warnLow || v > t.warnHigh) return 'danger';
  if (v < t.okLow   || v > t.okHigh)   return 'warning';
  return 'normal';
}

// ─── Sensor Meta ──────────────────────────────────────────────────────────────
const SENSORS = [
  {
    key: 'ph', label: 'ความเป็นกรด-ด่าง (pH)',
    icon: Droplets, color: '#0ea5e9', unit: '',
    min: 0, max: 14, step: 0.1,
    desc: 'ระดับ pH ส่งผลต่อการดูดซึมแร่ธาตุและสุขภาพสัตว์น้ำ',
    fields: [
      { key: 'warnLow',  label: 'เริ่มเฝ้าระวัง (ต่ำ)', color: '#f59e0b' },
      { key: 'okLow',    label: 'ค่าปกติต่ำสุด',        color: '#22c55e' },
      { key: 'okHigh',   label: 'ค่าปกติสูงสุด',        color: '#22c55e' },
      { key: 'warnHigh', label: 'เริ่มเฝ้าระวัง (สูง)', color: '#f59e0b' },
    ],
  },
  {
    key: 'do', label: 'ออกซิเจนละลาย (DO)',
    icon: Wind, color: '#0d9488', unit: 'mg/L',
    min: 0, max: 20, step: 0.1,
    desc: 'ปริมาณออกซิเจนละลายในน้ำ ส่งผลโดยตรงต่อการหายใจของสัตว์น้ำ',
    fields: [
      { key: 'warnLow',  label: 'เริ่มเฝ้าระวัง (ต่ำ)', color: '#f59e0b' },
      { key: 'okLow',    label: 'ค่าปกติต่ำสุด',        color: '#22c55e' },
      { key: 'okHigh',   label: 'ค่าปกติสูงสุด',        color: '#22c55e' },
      { key: 'warnHigh', label: 'เริ่มเฝ้าระวัง (สูง)', color: '#f59e0b' },
    ],
  },
  {
    key: 'temp', label: 'อุณหภูมิน้ำ (Temp)',
    icon: Thermometer, color: '#f59e0b', unit: '°C',
    min: 0, max: 50, step: 0.5,
    desc: 'อุณหภูมิน้ำส่งผลต่อการเจริญเติบโตและระบบภูมิคุ้มกัน',
    fields: [
      { key: 'warnLow',  label: 'เริ่มเฝ้าระวัง (ต่ำ)', color: '#f59e0b' },
      { key: 'okLow',    label: 'ค่าปกติต่ำสุด',        color: '#22c55e' },
      { key: 'okHigh',   label: 'ค่าปกติสูงสุด',        color: '#22c55e' },
      { key: 'warnHigh', label: 'เริ่มเฝ้าระวัง (สูง)', color: '#f59e0b' },
    ],
  },
  {
    key: 'turbidity', label: 'ความขุ่น (Turbidity)',
    icon: Zap, color: '#8b5cf6', unit: 'NTU',
    min: 0, max: 2000, step: 10,
    desc: 'ความขุ่นของน้ำ บ่งบอกปริมาณอนุภาคแขวนลอยในน้ำ',
    fields: [
      { key: 'okHigh',   label: 'ค่าปกติสูงสุด',        color: '#22c55e' },
      { key: 'warnHigh', label: 'เริ่มเฝ้าระวัง (สูง)', color: '#f59e0b' },
    ],
  },
];

// ─── Mini Range Visualizer ────────────────────────────────────────────────────
function RangeBar({ sensor, vals }) {
  const { min, max } = sensor;
  const range = max - min;
  const pct = v => ((v - min) / range) * 100;

  const segments = sensor.key === 'turbidity'
    ? [
        { from: 0,            to: pct(vals.okHigh),   color: '#22c55e' },
        { from: pct(vals.okHigh), to: pct(vals.warnHigh), color: '#f59e0b' },
        { from: pct(vals.warnHigh), to: 100,            color: '#ef4444' },
      ]
    : [
        { from: 0,                to: pct(vals.warnLow),  color: '#ef4444' },
        { from: pct(vals.warnLow),to: pct(vals.okLow),   color: '#f59e0b' },
        { from: pct(vals.okLow),  to: pct(vals.okHigh),  color: '#22c55e' },
        { from: pct(vals.okHigh), to: pct(vals.warnHigh),color: '#f59e0b' },
        { from: pct(vals.warnHigh), to: 100,             color: '#ef4444' },
      ];

  return (
    <div className="ts-rangebar">
      <div className="ts-rangebar-track">
        {segments.map((s, i) => (
          <div key={i} className="ts-rangebar-seg" style={{
            left: `${s.from}%`,
            width: `${Math.max(0, s.to - s.from)}%`,
            background: s.color,
          }} />
        ))}
      </div>
      <div className="ts-rangebar-labels">
        <span>{min}{sensor.unit}</span>
        <span>{max}{sensor.unit}</span>
      </div>
    </div>
  );
}

// ─── Single Sensor Section ────────────────────────────────────────────────────
function SensorSection({ sensor, vals, onChange }) {
  const Icon = sensor.icon;

  return (
    <motion.div
      className="ts-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="ts-section-header">
        <div className="ts-section-icon" style={{ background: `${sensor.color}18`, color: sensor.color }}>
          <Icon size={18} />
        </div>
        <div>
          <div className="ts-section-title">{sensor.label}</div>
          <div className="ts-section-desc">{sensor.desc}</div>
        </div>
      </div>

      <RangeBar sensor={sensor} vals={vals} />

      <div className="ts-fields">
        {sensor.fields.map(f => (
          <div key={f.key} className="ts-field">
            <div className="ts-field-label">
              <span className="ts-field-dot" style={{ background: f.color }} />
              {f.label}
            </div>
            <div className="ts-field-input-wrap">
              <button
                className="ts-stepper"
                onClick={() => onChange(sensor.key, f.key, Math.max(sensor.min, +(vals[f.key] - sensor.step).toFixed(2)))}
              >−</button>
              <input
                type="number"
                className="ts-input"
                value={vals[f.key]}
                min={sensor.min}
                max={sensor.max}
                step={sensor.step}
                onChange={e => onChange(sensor.key, f.key, parseFloat(e.target.value) || 0)}
              />
              <span className="ts-unit">{sensor.unit}</span>
              <button
                className="ts-stepper"
                onClick={() => onChange(sensor.key, f.key, Math.min(sensor.max, +(vals[f.key] + sensor.step).toFixed(2)))}
              >+</button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ThresholdSettings() {
  const navigate = useNavigate();
  const [thresholds, setThresholds] = useState(getThresholds);
  const [saved, setSaved] = useState(false);

  const handleChange = (sensorKey, fieldKey, value) => {
    setThresholds(prev => ({
      ...prev,
      [sensorKey]: { ...prev[sensorKey], [fieldKey]: value },
    }));
  };

  const handleSave = () => {
    saveThresholds(thresholds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
  };

  return (
    <div className="ts-page">
      {/* Header */}
      <header className="ts-header">
        <button className="ts-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
        </button>
        <div className="ts-header-center">
          <Sliders size={16} />
          <span>ตั้งค่าเกณฑ์คุณภาพน้ำ</span>
        </div>
        <button className="ts-reset-btn" onClick={handleReset} title="รีเซ็ตค่า Default">
          <RotateCcw size={16} />
        </button>
      </header>

      {/* Info Banner */}
      <div className="ts-info-banner">
        <Info size={15} />
        <span>ปรับค่าเกณฑ์ให้เหมาะกับสายพันธุ์และสภาพบ่อของคุณ การเปลี่ยนแปลงจะมีผลทันทีหลังบันทึก</span>
      </div>

      {/* Content */}
      <main className="ts-main">
        {SENSORS.map(s => (
          <SensorSection
            key={s.key}
            sensor={s}
            vals={thresholds[s.key]}
            onChange={handleChange}
          />
        ))}

        {/* Legend */}
        <div className="ts-legend">
          <div className="ts-legend-item"><span style={{ background: '#22c55e' }} />ปกติ</div>
          <div className="ts-legend-item"><span style={{ background: '#f59e0b' }} />เฝ้าระวัง</div>
          <div className="ts-legend-item"><span style={{ background: '#ef4444' }} />อันตราย</div>
        </div>
      </main>

      {/* Save Button */}
      <div className="ts-save-bar">
        <button className="ts-save-btn" onClick={handleSave}>
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.span key="saved" className="ts-save-inner"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CheckCircle size={18} /> บันทึกแล้ว!
              </motion.span>
            ) : (
              <motion.span key="save" className="ts-save-inner"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Save size={18} /> บันทึกการตั้งค่า
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
