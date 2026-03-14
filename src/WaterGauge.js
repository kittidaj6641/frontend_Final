// src/WaterGauge.jsx
import React, { useMemo } from 'react';
import './WaterGauge.css';

// ─── Gauge config per parameter ──────────────────────────────────────────────
const SENSOR_CONFIG = {
  ph: {
    label: 'pH',
    unit: '',
    min: 0,
    max: 14,
    zones: [
      { from: 0,   to: 5,   color: '#ef4444' },
      { from: 5,   to: 6.5, color: '#f59e0b' },
      { from: 6.5, to: 8.5, color: '#22c55e' },
      { from: 8.5, to: 10,  color: '#f59e0b' },
      { from: 10,  to: 14,  color: '#ef4444' },
    ],
    getStatus(v) {
      if (v >= 6.5 && v <= 8.5) return { cls: 'ok',   label: 'ปกติ' };
      if ((v >= 5 && v < 6.5) || (v > 8.5 && v <= 10)) return { cls: 'warn', label: 'ควรระวัง' };
      return { cls: 'bad', label: 'อันตราย' };
    },
  },
  do: {
    label: 'DO',
    unit: 'mg/L',
    min: 0,
    max: 15,
    zones: [
      { from: 0,  to: 3,  color: '#ef4444' },
      { from: 3,  to: 5,  color: '#f59e0b' },
      { from: 5,  to: 12, color: '#22c55e' },
      { from: 12, to: 15, color: '#f59e0b' },
    ],
    getStatus(v) {
      if (v >= 5 && v <= 12) return { cls: 'ok',   label: 'ปกติ' };
      if (v >= 3 && v < 5)   return { cls: 'warn', label: 'ควรระวัง' };
      if (v > 12)             return { cls: 'warn', label: 'ควรระวัง' };
      return { cls: 'bad', label: 'อันตราย' };
    },
  },
  temp: {
    label: 'อุณหภูมิ',
    unit: '°C',
    min: 0,
    max: 45,
    zones: [
      { from: 0,  to: 18, color: '#ef4444' },
      { from: 18, to: 22, color: '#f59e0b' },
      { from: 22, to: 30, color: '#22c55e' },
      { from: 30, to: 35, color: '#f59e0b' },
      { from: 35, to: 45, color: '#ef4444' },
    ],
    getStatus(v) {
      if (v >= 22 && v <= 30) return { cls: 'ok',   label: 'ปกติ' };
      if ((v >= 18 && v < 22) || (v > 30 && v <= 35)) return { cls: 'warn', label: 'ควรระวัง' };
      return { cls: 'bad', label: 'อันตราย' };
    },
  },
  turbidity: {
    label: 'ความขุ่น',
    unit: 'NTU',
    min: 0,
    max: 100,
    zones: [
      { from: 0,  to: 500,  color: '#22c55e' },
      { from: 500, to: 750,  color: '#f59e0b' },
      { from: 750, to: 1000, color: '#ef4444' },
    ],
    getStatus(v) {
      if (v <= 500) return { cls: 'ok',   label: 'ปกติ' };
      if (v <= 750) return { cls: 'warn', label: 'ควรระวัง' };
      return { cls: 'bad', label: 'อันตราย' };
    },
  },
};

// ─── SVG helpers ─────────────────────────────────────────────────────────────
const W = 160, H = 98, CX = 80, CY = 88, R = 66, STROKE = 13;
const START = Math.PI, SWEEP = Math.PI;

function polar(cx, cy, r, a) {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arcPath(a1, a2) {
  const [x1, y1] = polar(CX, CY, R, a1);
  const [x2, y2] = polar(CX, CY, R, a2);
  const large = a2 - a1 > Math.PI ? 1 : 0;
  return `M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
}

// ─── Single Gauge SVG ─────────────────────────────────────────────────────────
function GaugeSVG({ config, value }) {
  const { min, max, zones } = config;

  const ratio = useMemo(
    () => Math.min(1, Math.max(0, (value - min) / (max - min))),
    [value, min, max]
  );

  const needleAng = START + ratio * SWEEP;
  const [nx, ny] = polar(CX, CY, R - 20, needleAng);
  const [bx, by] = polar(CX, CY, 7, needleAng + Math.PI);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => {
    const a = START + t * SWEEP;
    const [ox, oy] = polar(CX, CY, R + STROKE / 2 + 3, a);
    const [ix, iy] = polar(CX, CY, R - STROKE / 2 - 3, a);
    return { ox, oy, ix, iy };
  });

  return (
    <svg className="wg-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Track */}
      <path
        d={arcPath(START, START + SWEEP)}
        fill="none"
        stroke="var(--wg-track)"
        strokeWidth={STROKE}
        strokeLinecap="butt"
      />

      {/* Zone arcs */}
      {zones.map((z, i) => {
        const r1 = Math.max(0, (z.from - min) / (max - min));
        const r2 = Math.min(1, (z.to   - min) / (max - min));
        if (r2 <= r1) return null;
        return (
          <path
            key={i}
            d={arcPath(START + r1 * SWEEP, START + r2 * SWEEP)}
            fill="none"
            stroke={z.color}
            strokeWidth={STROKE}
            strokeLinecap="butt"
          />
        );
      })}

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.ox.toFixed(1)} y1={t.oy.toFixed(1)}
          x2={t.ix.toFixed(1)} y2={t.iy.toFixed(1)}
          stroke="var(--wg-tick)"
          strokeWidth="1.5"
        />
      ))}

      {/* Needle */}
      <line
        x1={CX} y1={CY}
        x2={nx.toFixed(1)} y2={ny.toFixed(1)}
        stroke="var(--wg-needle)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1={CX} y1={CY}
        x2={bx.toFixed(1)} y2={by.toFixed(1)}
        stroke="var(--wg-needle)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Pivot */}
      <circle cx={CX} cy={CY} r="5.5" fill="var(--wg-needle)" />
      <circle cx={CX} cy={CY} r="3"   fill="var(--wg-pivot-inner)" />

      {/* Min / Max labels */}
      <text x="10"    y={H - 3} className="wg-minmax">{min}</text>
      <text x={W - 10} y={H - 3} className="wg-minmax" textAnchor="end">{max}</text>
    </svg>
  );
}

// ─── Single Gauge Card ────────────────────────────────────────────────────────
function GaugeCard({ paramKey, value }) {
  const config = SENSOR_CONFIG[paramKey];
  if (!config) return null;

  const numVal = parseFloat(value);
  const hasValue = !isNaN(numVal);
  const status = hasValue ? config.getStatus(numVal) : null;
  const displayVal = hasValue
    ? Number.isInteger(numVal) ? numVal : numVal.toFixed(1)
    : '—';

  return (
    <div className={`wg-card ${status ? status.cls : ''}`}>
      <div className="wg-label">{config.label}</div>
      <GaugeSVG config={config} value={hasValue ? numVal : config.min} />
      <div className="wg-value-row">
        <span className="wg-value">{displayVal}</span>
        {config.unit && <span className="wg-unit">{config.unit}</span>}
      </div>
      {status && (
        <span className={`wg-badge wg-badge--${status.cls}`}>{status.label}</span>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
const WaterGauge = ({ ph, dissolvedOxygen, temperature, turbidity }) => {
  return (
    <div className="wg-grid">
      <GaugeCard paramKey="ph"        value={ph} />
      <GaugeCard paramKey="do"        value={dissolvedOxygen} />
      <GaugeCard paramKey="temp"      value={temperature} />
      <GaugeCard paramKey="turbidity" value={turbidity} />
    </div>
  );
};

export default WaterGauge;
