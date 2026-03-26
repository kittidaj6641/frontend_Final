// src/WaterGauge.js
import React, { useState, useMemo } from 'react';
import { Settings, X, Check } from 'lucide-react';
import './WaterGauge.css';

// ─── Default Configs (ใช้เป็นค่าตั้งต้นหากยังไม่มีการตั้งค่า) ──────────
const DEFAULT_CONFIGS = {
  ph: {
    label: 'ความเป็นกรด-ด่าง', tag: 'pH', unit: '', min: 0, max: 14,
    t_dangerLow: 5, t_warnLow: 6.5, t_warnHigh: 8.5, t_dangerHigh: 8.5
  },
  do: {
    label: 'ออกซิเจนละลาย', tag: 'DO', unit: 'mg/L', min: 0, max: 15,
    t_dangerLow: 2, t_warnLow: 3, t_warnHigh: 15, t_dangerHigh: 15
  },
  temp: {
    label: 'อุณหภูมิน้ำ', tag: 'Temp', unit: '°C', min: 0, max: 45,
    t_dangerLow: 18, t_warnLow: 22, t_warnHigh: 30, t_dangerHigh: 35
  },
  turbidity: {
    label: 'ความขุ่น', tag: 'NTU', unit: 'NTU', min: 0, max: 1000,
    t_dangerLow: 0, t_warnLow: 0, t_warnHigh: 500, t_dangerHigh: 750
  }
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
      <path d={arc(A0, A0 + SWEEP)} fill="none" stroke="#e2e8f0" strokeWidth={GS} strokeLinecap="butt" />
      
      {/* วาดแถบสีตาม Zone ที่ตั้งค่าไว้ */}
      {cfg.zones.map((z, i) => {
        const r1 = Math.max(0, (z.from - cfg.min) / (cfg.max - cfg.min));
        const r2 = Math.min(1, (z.to   - cfg.min) / (cfg.max - cfg.min));
        if (r2 <= r1) return null;
        return <path key={i} d={arc(A0 + r1 * SWEEP, A0 + r2 * SWEEP)} fill="none" stroke={z.color} strokeWidth={GS} strokeLinecap="butt" />;
      })}
      
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const a = A0 + t * SWEEP;
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

// ─── Component การ์ดเซนเซอร์แต่ละใบ ──────────────────────────────────────────────
function SensorCard({ paramKey, value, icon: Icon, globalConfig, updateConfig }) {
  const [isEditing, setIsEditing] = useState(false);
  const cfg = globalConfig[paramKey];
  const [editVals, setEditVals] = useState({ ...cfg });

  if (!cfg) return null;

  const num = parseFloat(value);
  const hasVal = !isNaN(num);

  // คำนวณขอบเขตแถบสีแบบไดนามิกตามค่าที่ผู้ใช้ตั้ง
  const zones = [
    { from: cfg.min, to: cfg.t_dangerLow, color: '#ef4444' },         // แดงต่ำ
    { from: cfg.t_dangerLow, to: cfg.t_warnLow, color: '#f59e0b' },   // ส้มต่ำ
    { from: cfg.t_warnLow, to: cfg.t_warnHigh, color: '#22c55e' },    // เขียว (ปกติ)
    { from: cfg.t_warnHigh, to: cfg.t_dangerHigh, color: '#f59e0b' }, // ส้มสูง
    { from: cfg.t_dangerHigh, to: cfg.max, color: '#ef4444' }         // แดงสูง
  ].filter(z => z.from < z.to);

  // คำนวณสถานะ
  const getStatus = (v) => {
    if (v >= cfg.t_warnLow && v <= cfg.t_warnHigh) return { cls: 'ok', text: 'ปกติ' };
    if ((v >= cfg.t_dangerLow && v < cfg.t_warnLow) || (v > cfg.t_warnHigh && v <= cfg.t_dangerHigh)) return { cls: 'warn', text: 'เฝ้าระวัง' };
    return { cls: 'bad', text: 'อันตราย/แก้ไข' };
  };

  const st = hasVal ? getStatus(num) : null;
  const disp = hasVal ? (Number.isInteger(num) ? String(num) : num.toFixed(1)) : '—';

  // ข้อความสำหรับโชว์ "ค่าปกติ" ใต้เกจ
  let safeText = '';
  if (cfg.t_warnLow === cfg.min && cfg.t_warnHigh === cfg.max) safeText = 'ทุกค่า';
  else if (cfg.t_warnLow === cfg.min) safeText = `<= ${cfg.t_warnHigh}`;
  else if (cfg.t_warnHigh === cfg.max) safeText = `>= ${cfg.t_warnLow}`;
  else safeText = `${cfg.t_warnLow} – ${cfg.t_warnHigh}`;

  // บันทึกการตั้งค่า
  const handleSave = () => {
    updateConfig(paramKey, {
      ...cfg,
      t_dangerLow: Number(editVals.t_dangerLow),
      t_warnLow: Number(editVals.t_warnLow),
      t_warnHigh: Number(editVals.t_warnHigh),
      t_dangerHigh: Number(editVals.t_dangerHigh),
    });
    setIsEditing(false);
  };

  return (
    <div className={`wg-card${st && !isEditing ? ` wg-${st.cls}` : ''}`}>
      <div className="wg-top">
        <span className="wg-label">{cfg.label}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {Icon && <span className="wg-icon-wrap"><Icon size={13} /></span>}
          {/* ปุ่มฟันเฟืองสำหรับเปิดโหมดแก้ไข */}
          <button onClick={() => { setEditVals({...cfg}); setIsEditing(!isEditing); }} className="wg-edit-btn" title="ปรับตั้งค่าเกณฑ์">
            {isEditing ? <X size={15} /> : <Settings size={15} />}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="wg-edit-form">
          <div className="wg-edit-row"><span>อันตราย (ต่ำกว่า)</span><input type="number" value={editVals.t_dangerLow} onChange={e=>setEditVals({...editVals, t_dangerLow: e.target.value})} step="0.1"/></div>
          <div className="wg-edit-row"><span>เฝ้าระวัง (ต่ำกว่า)</span><input type="number" value={editVals.t_warnLow} onChange={e=>setEditVals({...editVals, t_warnLow: e.target.value})} step="0.1"/></div>
          <div className="wg-edit-row"><span>เฝ้าระวัง (เกินกว่า)</span><input type="number" value={editVals.t_warnHigh} onChange={e=>setEditVals({...editVals, t_warnHigh: e.target.value})} step="0.1"/></div>
          <div className="wg-edit-row"><span>อันตราย (เกินกว่า)</span><input type="number" value={editVals.t_dangerHigh} onChange={e=>setEditVals({...editVals, t_dangerHigh: e.target.value})} step="0.1"/></div>
          <div className="wg-edit-actions">
            <button onClick={() => setIsEditing(false)} className="wg-btn-cancel">ยกเลิก</button>
            <button onClick={handleSave} className="wg-btn-save"><Check size={14}/> บันทึก</button>
          </div>
        </div>
      ) : (
        <>
          <div className="wg-gauge">
            <GaugeSVG cfg={{...cfg, zones}} val={hasVal ? num : cfg.min} />
          </div>
          <div className="wg-val-row">
            <span className="wg-val">{disp}</span>
            {cfg.unit && <span className="wg-unit">{cfg.unit}</span>}
          </div>
          <span className={`wg-badge${st ? ` wg-badge--${st.cls}` : ' wg-badge--none'}`}>
            {st ? st.text : 'รอข้อมูล'}
          </span>
          <p className="wg-safe">ค่าปกติ {safeText} {cfg.unit}</p>
        </>
      )}
    </div>
  );
}

// ─── Main WaterGauge Container ────────────────────────────────────────────────
const WaterGauge = ({ ph, dissolvedOxygen, temperature, turbidity, icons = {} }) => {
  // โหลดค่า Config จาก LocalStorage 
  const [configs, setConfigs] = useState(() => {
    const saved = localStorage.getItem('waterGaugeConfigs');
    if (saved) {
      try { return { ...DEFAULT_CONFIGS, ...JSON.parse(saved) }; } 
      catch (e) { return DEFAULT_CONFIGS; }
    }
    return DEFAULT_CONFIGS;
  });

  // ฟังก์ชันอัปเดตและบันทึกลง LocalStorage
  const updateConfig = (key, newConfig) => {
    const updated = { ...configs, [key]: newConfig };
    setConfigs(updated);
    localStorage.setItem('waterGaugeConfigs', JSON.stringify(updated));
  };

  return (
    <div className="wg-grid">
      <SensorCard paramKey="ph"        value={ph}              icon={icons.ph}        globalConfig={configs} updateConfig={updateConfig} />
      <SensorCard paramKey="do"        value={dissolvedOxygen} icon={icons.do}        globalConfig={configs} updateConfig={updateConfig} />
      <SensorCard paramKey="temp"      value={temperature}     icon={icons.temp}      globalConfig={configs} updateConfig={updateConfig} />
      <SensorCard paramKey="turbidity" value={turbidity}       icon={icons.turbidity} globalConfig={configs} updateConfig={updateConfig} />
    </div>
  );
};

export default WaterGauge;
