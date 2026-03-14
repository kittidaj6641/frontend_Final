// src/WaterGauge.jsx
import React, { useMemo } from 'react';
import './WaterGauge.css';

// ─── Sensor config ────────────────────────────────────────────────────────────
const CONFIGS = {
  ph: {
    label: 'ความเป็นกรด-ด่าง',
    tag: 'pH',
    unit: '',
    min: 0, max: 14,
    zones: [
      { from: 0,   to: 5,   color: '#ef4444' },
      { from: 5,   to: 6.5, color: '#f59e0b' },
      { from: 6.5, to: 8.5, color: '#22c55e' },
      { from: 8.5, to: 10,  color: '#f59e0b' },
      { from: 10,  to: 14,  color: '#ef4444' },
    ],
    status: v => {
      if (v >= 6.5 && v <= 8.5) return { cls: 'ok',   text: 'ปกติ' };
      if ((v >= 5 && v < 6.5) || (v > 8.5 && v <= 10)) return { cls: 'warn', text: 'ควรระวัง' };
      return { cls: 'bad', text: 'อันตราย' };
    },
    safe: '6.5 – 8.5',
  },
  do: {
    label: 'ออกซิเจนละลาย',
    tag: 'DO',
    unit: 'mg/L',
    min: 0, max: 15,
    zones: [
      { from: 0,  to: 3,  color: '#ef4444' },
      { from: 3,  to: 5,  color: '#f59e0b' },
      { from: 5,  to: 12, color: '#22c55e' },
      { from: 12, to: 15, color: '#f59e0b' },
    ],
    status: v => {
      if (v >= 5 && v <= 12) return { cls: 'ok',   text: 'ปกติ' };
      if ((v >= 3 && v < 5) || v > 12) return { cls: 'warn', text: 'ควรระวัง' };
      return { cls: 'bad', text: 'อันตราย' };
    },
    safe: '5 – 12 mg/L',
  },
  temp: {
    label: 'อุณหภูมิน้ำ',
    tag: 'Temp',
    unit: '°C',
    min: 0, max: 45,
    zones: [
      { from: 0,  to: 18, color: '#ef4444' },
      { from: 18, to: 22, color: '#f59e0b' },
      { from: 22, to: 30, color: '#22c55e' },
      { from: 30, to: 35, color: '#f59e0b' },
      { from: 35, to: 45, color: '#ef4444' },
    ],
    status: v => {
      if (v >= 22 && v <= 30) return { cls: 'ok',   text: 'ปกติ' };
      if ((v >= 18 && v < 22) || (v > 30 && v <= 35)) return { cls: 'warn', text: 'ควรระวัง' };
      return { cls: 'bad', text: 'อันตราย' };
    },
    safe: '22 – 30 °C',
  },
  turbidity: {
    label: 'ความขุ่น',
    tag: 'NTU',
    unit: 'NTU',
    min: 0, max: 1000,
    zones: [
      { from: 0,  to: 500,  color: '#22c55e' },
      { from: 500, to: 750,  color: '#f59e0b' },
      { from: 750, to: 1000, color: '#ef4444' },
    ],
    status: v => {
      if (v <= 500) return { cls: 'ok',   text: 'ปกติ' };
      if (v <= 750) return { cls: 'warn', text: 'ควรระวัง' };
      return { cls: 'bad', text: 'อันตราย' };
    },
    safe: '0 – 500 NTU',
  },
};

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
      {/* track */}
      <path d={arc(A0, A0 + SWEEP)} fill="none" stroke="#e2e8f0" strokeWidth={GS} strokeLinecap="butt" />
      {/* colour zones */}
      {cfg.zones.map((z, i) => {
        const r1 = Math.max(0, (z.from - cfg.min) / (cfg.max - cfg.min));
        const r2 = Math.min(1, (z.to   - cfg.min) / (cfg.max - cfg.min));
        if (r2 <= r1) return null;
        return <path key={i} d={arc(A0 + r1 * SWEEP, A0 + r2 * SWEEP)} fill="none" stroke={z.color} strokeWidth={GS} strokeLinecap="butt" />;
      })}
      {/* tick marks */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const a = A0 + t * SWEEP;
        const [ox, oy] = pt(GR + GS / 2 + 2, a);
        const [ix, iy] = pt(GR - GS / 2 - 2, a);
        return <line key={i} x1={ox.toFixed(1)} y1={oy.toFixed(1)} x2={ix.toFixed(1)} y2={iy.toFixed(1)} stroke="#cbd5e1" strokeWidth="1.5" />;
      })}
      {/* needle */}
      <line x1={GCX} y1={GCY} x2={nx.toFixed(1)} y2={ny.toFixed(1)} stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1={GCX} y1={GCY} x2={bx.toFixed(1)} y2={by.toFixed(1)} stroke="#0f172a" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      {/* pivot */}
      <circle cx={GCX} cy={GCY} r="5" fill="#0f172a" />
      <circle cx={GCX} cy={GCY} r="2.8" fill="#f8fafc" />
      {/* min / max labels */}
      <text x="7"      y={GH} style={{ fontSize: 8, fill: '#94a3b8', fontFamily: 'Outfit, sans-serif' }} textAnchor="start">{cfg.min}</text>
      <text x={GW - 7} y={GH} style={{ fontSize: 8, fill: '#94a3b8', fontFamily: 'Outfit, sans-serif' }} textAnchor="end">{cfg.max}</text>
    </svg>
  );
}

// ─── Single merged card ───────────────────────────────────────────────────────
function SensorCard({ paramKey, value, icon: Icon }) {
  const cfg = CONFIGS[paramKey];
  if (!cfg) return null;

  const num    = parseFloat(value);
  const hasVal = !isNaN(num);
  const st     = hasVal ? cfg.status(num) : null;
  const disp   = hasVal ? (Number.isInteger(num) ? String(num) : num.toFixed(1)) : '—';

  return (
    <div className={`wg-card${st ? ` wg-${st.cls}` : ''}`}>

      {/* ── header row ── */}
      <div className="wg-top">
        <span className="wg-label">{cfg.label}</span>
        {Icon && (
          <span className="wg-icon-wrap">
            <Icon size={13} />
          </span>
        )}
      </div>

      {/* ── gauge ── */}
      <div className="wg-gauge">
        <GaugeSVG cfg={cfg} val={hasVal ? num : cfg.min} />
      </div>

      {/* ── value ── */}
      <div className="wg-val-row">
        <span className="wg-val">{disp}</span>
        {cfg.unit && <span className="wg-unit">{cfg.unit}</span>}
      </div>

      {/* ── badge ── */}
      <span className={`wg-badge${st ? ` wg-badge--${st.cls}` : ' wg-badge--none'}`}>
        {st ? st.text : 'รอข้อมูล'}
      </span>

      {/* ── safe range ── */}
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
