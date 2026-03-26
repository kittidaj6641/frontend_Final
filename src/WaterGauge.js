// src/WaterGauge.js — ใช้ค่า threshold แบบ dynamic จาก ThresholdSettings
import React, { useMemo } from 'react';
import './WaterGauge.css';
import { getThresholds } from './ThresholdSettings'; // ← import threshold

// ─── Build CONFIGS dynamically ─────────────────────────────────────────────
function buildConfigs() {
  const t = getThresholds();
  return {
    ph: {
      label: 'ความเป็นกรด-ด่าง',
      tag: 'pH', unit: '',
      min: 0, max: 14,
      zones: [
        { from: 0,           to: t.ph.warnLow,  color: '#ef4444' },
        { from: t.ph.warnLow, to: t.ph.okLow,   color: '#f59e0b' },
        { from: t.ph.okLow,  to: t.ph.okHigh,   color: '#22c55e' },
        { from: t.ph.okHigh, to: t.ph.warnHigh, color: '#f59e0b' },
        { from: t.ph.warnHigh, to: 14,          color: '#ef4444' },
      ],
      status: v => {
        if (v >= t.ph.okLow  && v <= t.ph.okHigh)  return { cls: 'ok',   text: 'ปกติ' };
        if (v >= t.ph.warnLow && v <= t.ph.warnHigh) return { cls: 'warn', text: 'เฝ้าระวัง' };
        return { cls: 'bad', text: 'อันตราย' };
      },
      safe: `${t.ph.okLow} – ${t.ph.okHigh}`,
    },
    do: {
      label: 'ออกซิเจนละลาย',
      tag: 'DO', unit: 'mg/L',
      min: 0, max: 20,
      zones: [
        { from: 0,           to: t.do.warnLow,  color: '#ef4444' },
        { from: t.do.warnLow, to: t.do.okLow,   color: '#f59e0b' },
        { from: t.do.okLow,  to: t.do.okHigh,   color: '#22c55e' },
        { from: t.do.okHigh, to: t.do.warnHigh, color: '#f59e0b' },
        { from: t.do.warnHigh, to: 20,          color: '#22c55e' },
      ],
      status: v => {
        if (v >= t.do.okLow  && v <= t.do.okHigh)  return { cls: 'ok',   text: 'ปกติ' };
        if (v >= t.do.warnLow && v <= t.do.warnHigh) return { cls: 'warn', text: 'เฝ้าระวัง' };
        return { cls: 'bad', text: 'อันตราย' };
      },
      safe: `${t.do.okLow} – ${t.do.okHigh} mg/L`,
    },
    temp: {
      label: 'อุณหภูมิน้ำ',
      tag: 'Temp', unit: '°C',
      min: 0, max: 50,
      zones: [
        { from: 0,              to: t.temp.warnLow,  color: '#ef4444' },
        { from: t.temp.warnLow, to: t.temp.okLow,    color: '#f59e0b' },
        { from: t.temp.okLow,   to: t.temp.okHigh,   color: '#22c55e' },
        { from: t.temp.okHigh,  to: t.temp.warnHigh, color: '#f59e0b' },
        { from: t.temp.warnHigh, to: 50,             color: '#ef4444' },
      ],
      status: v => {
        if (v >= t.temp.okLow  && v <= t.temp.okHigh)  return { cls: 'ok',   text: 'ปกติ' };
        if (v >= t.temp.warnLow && v <= t.temp.warnHigh) return { cls: 'warn', text: 'ควรระวัง' };
        return { cls: 'bad', text: 'อันตราย' };
      },
      safe: `${t.temp.okLow} – ${t.temp.okHigh} °C`,
    },
    turbidity: {
      label: 'ความขุ่น',
      tag: 'NTU', unit: 'NTU',
      min: 0, max: 2000,
      zones: [
        { from: 0,                       to: t.turbidity.okHigh,   color: '#22c55e' },
        { from: t.turbidity.okHigh,      to: t.turbidity.warnHigh, color: '#f59e0b' },
        { from: t.turbidity.warnHigh,    to: 2000,                 color: '#ef4444' },
      ],
      status: v => {
        if (v <= t.turbidity.okHigh)   return { cls: 'ok',   text: 'ปกติ' };
        if (v <= t.turbidity.warnHigh) return { cls: 'warn', text: 'ควรระวัง' };
        return { cls: 'bad', text: 'อันตราย' };
      },
      safe: `0 – ${t.turbidity.okHigh} NTU`,
    },
  };
}

// ─── SVG gauge helpers ────────────────────────────────────────────────────────
const GW = 150, GH = 82, GCX = 75, GCY = 76, GR = 60, GS = 11;
const A0 = Math.PI, SWEEP = Math.PI;

function pt(r, a) {
  return [GCX + r * Math.cos(a), GCY + r * Math.sin(a)];
}

function arc(a1, a2) {
  const [x1, y1] = pt(GR, a1);
  const [x2, y2] = pt(GR, a2);
  const lg = a2 - a1 > Math.PI ? 1 : 0;
  return `M${x1.toFixed(1)},${y1.toFixed(1)} A${GR},${GR} 0 ${lg},1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

function GaugeSVG({ cfg, val }) {
  const ratio = useMemo(
    () => Math.min(1, Math.max(0, (val - cfg.min) / (cfg.max - cfg.min))),
    [val, cfg]
  );
  const na = A0 + ratio * SWEEP;
  const [nx, ny] = pt(GR - 16, na);
  const [bx, by] = pt(7, na + Math.PI);

  return (
    <svg width={GW} height={GH} viewBox={`0 0 ${GW} ${GH}`} style={{ display: 'block', overflow: 'visible' }}>
      <path d={arc(A0, A0 + SWEEP)} fill="none" stroke="#e2e8f0" strokeWidth={GS} strokeLinecap="butt" />
      {cfg.zones.map((z, i) => {
        const r1 = Math.max(0, (z.from - cfg.min) / (cfg.max - cfg.min));
        const r2 = Math.min(1, (z.to   - cfg.min) / (cfg.max - cfg.min));
        if (r2 <= r1) return null;
        return <path key={i} d={arc(A0 + r1 * SWEEP, A0 + r2 * SWEEP)} fill="none" stroke={z.color} strokeWidth={GS} strokeLinecap="butt" />;
      })}
      {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
        const a = A0 + tick * SWEEP;
        const [ox, oy] = pt(GR + GS / 2 + 2, a);
        const [ix, iy] = pt(GR - GS / 2 - 2, a);
        return <line key={i} x1={ox.toFixed(1)} y1={oy.toFixed(1)} x2={ix.toFixed(1)} y2={iy.toFixed(1)} stroke="#cbd5e1" strokeWidth="1.5" />;
      })}
      <line x1={GCX} y1={GCY} x2={nx.toFixed(1)} y2={ny.toFixed(1)} stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1={GCX} y1={GCY} x2={bx.toFixed(1)} y2={by.toFixed(1)} stroke="#0f172a" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <circle cx={GCX} cy={GCY} r="5" fill="#0f172a" />
      <circle cx={GCX} cy={GCY} r="2.8" fill="#f8fafc" />
      <text x="7"      y={GH} style={{ fontSize: 8, fill: '#94a3b8', fontFamily: 'Outfit, sans-serif' }} textAnchor="start">{cfg.min}</text>
      <text x={GW - 7} y={GH} style={{ fontSize: 8, fill: '#94a3b8', fontFamily: 'Outfit, sans-serif' }} textAnchor="end">{cfg.max}</text>
    </svg>
  );
}

// ─── Single Card ──────────────────────────────────────────────────────────────
function SensorCard({ paramKey, value, icon: Icon }) {
  // Build configs fresh each render so changes propagate
  const CONFIGS = buildConfigs();
  const cfg = CONFIGS[paramKey];
  if (!cfg) return null;

  const num    = parseFloat(value);
  const hasVal = !isNaN(num);
  const st     = hasVal ? cfg.status(num) : null;
  const disp   = hasVal ? (Number.isInteger(num) ? String(num) : num.toFixed(1)) : '—';

  return (
    <div className={`wg-card${st ? ` wg-${st.cls}` : ''}`}>
      <div className="wg-top">
        <span className="wg-label">{cfg.label}</span>
        {Icon && (
          <span className="wg-icon-wrap">
            <Icon size={13} />
          </span>
        )}
      </div>
      <div className="wg-gauge">
        <GaugeSVG cfg={cfg} val={hasVal ? num : cfg.min} />
      </div>
      <div className="wg-val-row">
        <span className="wg-val">{disp}</span>
        {cfg.unit && <span className="wg-unit">{cfg.unit}</span>}
      </div>
      <span className={`wg-badge${st ? ` wg-badge--${st.cls}` : ' wg-badge--none'}`}>
        {st ? st.text : 'รอข้อมูล'}
      </span>
      <p className="wg-safe">ค่าปกติ {cfg.safe}</p>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
const WaterGauge = ({ ph, dissolvedOxygen, temperature, turbidity, icons = {} }) => (
  <div className="wg-grid">
    <SensorCard paramKey="ph"        value={ph}              icon={icons.ph}        />
    <SensorCard paramKey="do"        value={dissolvedOxygen} icon={icons.do}        />
    <SensorCard paramKey="temp"      value={temperature}     icon={icons.temp}      />
    <SensorCard paramKey="turbidity" value={turbidity}       icon={icons.turbidity} />
  </div>
);

export default WaterGauge;
