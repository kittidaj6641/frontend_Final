// src/water-quality.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import config from './config';
import { checkQuality } from './waterStandard';
import './water-quality.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ArrowLeft, Droplets, Wind, Thermometer, Zap,
  ChevronDown, ChevronLeft, ChevronRight, AlertTriangle,
  CheckCircle, BarChart2, List, CalendarDays, Layers
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const THAI_MONTHS = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม',
];
const WEEKDAYS = ['อา','จ','อ','พ','พฤ','ศ','ส'];
const ITEMS_PER_PAGE = 10;

const PARAMS = [
  { key: 'dissolved_oxygen', label: 'ออกซิเจน (DO)', color: '#0d9488' },
  { key: 'ph',               label: 'ค่า pH',          color: '#38bdf8' },
  { key: 'temperature',      label: 'อุณหภูมิ',         color: '#f59e0b' },
  { key: 'turbidity',        label: 'ความขุ่น',          color: '#a78bfa' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function todayKey() { return toDateKey(new Date()); }
function fmtDate(key) {
  const d = new Date(key + 'T00:00:00');
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}
function statusClass(q) {
  return q.status === 'normal' ? 'ok' : q.status === 'warning' ? 'warn' : 'bad';
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'#fff', border:'1px solid #d1faf4', borderRadius:12,
      padding:'10px 14px', boxShadow:'0 4px 20px rgba(13,155,136,0.12)', fontSize:13,
    }}>
      <div style={{ color:'#6b8fa3', marginBottom:4, fontWeight:600 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color, fontWeight:700, fontSize:16 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, unit, type }) => {
  const q   = checkQuality(type, value);
  const cls = statusClass(q);
  const disp = (value !== undefined && value !== null && value !== '') ? value : '—';
  return (
    <div className={`wq-stat-card ${cls}`}>
      <div className="wq-stat-lbl"><Icon size={13}/>{label}</div>
      <div><span className="wq-stat-val">{disp}</span>{unit && <span className="wq-stat-unit">{unit}</span>}</div>
      <span className="wq-stat-badge">{q.msg || 'รอข้อมูล'}</span>
    </div>
  );
};

// ─── Calendar ─────────────────────────────────────────────────────────────────
const Calendar = ({ allData, selectedDate, onSelectDate }) => {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const dayStatusMap = useMemo(() => {
    const map = {};
    allData.forEach(row => {
      const key = toDateKey(new Date(row.recorded_at));
      const statuses = [
        checkQuality('do',        row.dissolved_oxygen).status,
        checkQuality('ph',        row.ph).status,
        checkQuality('temp',      row.temperature).status,
        checkQuality('turbidity', row.turbidity).status,
      ];
      const worst = statuses.includes('critical') ? 'bad'
                  : statuses.includes('warning')  ? 'warn' : 'ok';
      if (!map[key] || map[key] === 'ok') map[key] = worst;
    });
    return map;
  }, [allData]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); }
    else setViewMonth(m => m-1);
  };
  const nextMonth = () => {
    const now = new Date();
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); }
    else setViewMonth(m => m+1);
  };

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const todayStr    = todayKey();
  const cantNext    = viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({ d, key, isFuture: key > todayStr, status: dayStatusMap[key] });
  }

  return (
    <div className="wq-cal-box">
      <div className="wq-cal-nav">
        <button className="wq-cal-arrow" onClick={prevMonth}><ChevronLeft size={16}/></button>
        <span className="wq-cal-month">{THAI_MONTHS[viewMonth]} {viewYear + 543}</span>
        <button className="wq-cal-arrow" onClick={nextMonth}
          style={{ opacity: cantNext ? 0.35:1, cursor: cantNext ? 'default':'pointer' }}>
          <ChevronRight size={16}/>
        </button>
      </div>

      <div className="wq-cal-weekdays">
        {WEEKDAYS.map(w => <div key={w} className="wq-cal-wday">{w}</div>)}
      </div>

      <div className="wq-cal-grid">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} className="wq-cal-day empty"/>;
          const cls = [
            'wq-cal-day',
            cell.isFuture ? 'future' : '',
            cell.key === todayStr && !cell.isFuture ? 'today' : '',
            cell.key === selectedDate ? 'selected' : '',
            !cell.isFuture && cell.status ? `has-${cell.status}` : '',
          ].filter(Boolean).join(' ');
          return (
            <div key={cell.key} className={cls}
              onClick={() => !cell.isFuture && onSelectDate(cell.key)}>
              <span className="dn">{cell.d}</span>
              {!cell.isFuture && cell.status && <span className="ddot"/>}
            </div>
          );
        })}
      </div>

      <div style={{ display:'flex', gap:14, marginTop:14, paddingTop:12, borderTop:'1px solid var(--border-soft)', flexWrap:'wrap' }}>
        {[['#22c55e','ปกติ'],['#f59e0b','ควรระวัง'],['#f43f5e','อันตราย']].map(([c,l]) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }}/>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Table body (shared between both modes) ───────────────────────────────────
const TableRows = ({ rows, showDate }) => rows.map((row, i) => {
  const qPH   = checkQuality('ph',        row.ph);
  const qDO   = checkQuality('do',        row.dissolved_oxygen);
  const qTemp = checkQuality('temp',      row.temperature);
  const qTurb = checkQuality('turbidity', row.turbidity);
  const gs = q => ({ color: q.status !== 'normal' ? q.color : 'var(--text)', fontWeight: q.status !== 'normal' ? 700 : 400 });
  const alerts = [
    qPH.status   !== 'normal' && { msg:`pH: ${qPH.msg}`,   cls: qPH.status   === 'critical' ? 'bad':'warn' },
    qDO.status   !== 'normal' && { msg:`DO: ${qDO.msg}`,   cls: qDO.status   === 'critical' ? 'bad':'warn' },
    qTemp.status !== 'normal' && { msg:`T: ${qTemp.msg}`,  cls: qTemp.status === 'critical' ? 'bad':'warn' },
    qTurb.status !== 'normal' && { msg:`Tu: ${qTurb.msg}`, cls: qTurb.status === 'critical' ? 'bad':'warn' },
  ].filter(Boolean);
  const dt = new Date(row.recorded_at);
  return (
    <tr key={i}>
      <td style={{ color:'var(--text-muted)', fontSize:12, whiteSpace:'nowrap' }}>
        {showDate && <span style={{ marginRight:4 }}>
          {dt.toLocaleDateString('th-TH', { day:'numeric', month:'short' })}
        </span>}
        {dt.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' })}
      </td>
      <td style={gs(qPH)}>{row.ph ?? '—'}</td>
      <td style={gs(qDO)}>{row.dissolved_oxygen ?? '—'}</td>
      <td style={gs(qTemp)}>{row.temperature ?? '—'}</td>
      <td style={gs(qTurb)}>{row.turbidity ?? '—'}</td>
      <td>
        {alerts.length > 0 ? (
          <div style={{ display:'flex', flexWrap:'wrap', gap:2 }}>
            {alerts.map((a,j) => <span key={j} className={`wq-alert-chip wq-chip-${a.cls}`}>{a.msg}</span>)}
          </div>
        ) : (
          <span className="wq-alert-chip wq-chip-ok" style={{ display:'inline-flex', alignItems:'center', gap:3 }}>
            <CheckCircle size={10}/> ปกติ
          </span>
        )}
      </td>
    </tr>
  );
});

// ─── Main ─────────────────────────────────────────────────────────────────────
const WaterQuality = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const deviceId = searchParams.get('deviceId');

  const [allData,    setAllData]    = useState([]);
  const [devices,    setDevices]    = useState([]);
  const [error,      setError]      = useState('');
  const [rangeMode,  setRangeMode]  = useState('day');   // 'all' | 'day'
  const [viewMode,   setViewMode]   = useState('chart'); // 'chart' | 'table'
  const [selParam,   setSelParam]   = useState('dissolved_oxygen');
  const [selDate,    setSelDate]    = useState(todayKey());
  const [curPage,    setCurPage]    = useState(1);

  // ── Fetch devices ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${config.API_BASE_URL}/member/devices`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setDevices(res.data);
      if (!deviceId && res.data.length > 0) setSearchParams({ deviceId: res.data[0].device_id });
    }).catch(() => {});
  }, [deviceId, setSearchParams]);

  // ── Fetch water quality ──
  useEffect(() => {
    if (!deviceId) return;
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    const run = async () => {
      try {
        const res = await axios.get(
          `${config.API_BASE_URL}/member/water-quality?deviceId=${deviceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllData(res.data || []);
        setError('');
      } catch (e) {
        if (e.response?.status === 403) navigate('/login');
        else setError('ไม่สามารถดึงข้อมูลได้ โปรดตรวจสอบการเชื่อมต่ออุปกรณ์');
      }
    };
    run();
    const id = setInterval(run, 10000);
    return () => clearInterval(id);
  }, [navigate, deviceId]);

  // ── Active dataset depends on mode ──
  const activeData = useMemo(() => {
    if (rangeMode === 'all') return allData;
    return allData.filter(row => toDateKey(new Date(row.recorded_at)) === selDate);
  }, [allData, rangeMode, selDate]);

  const latest = activeData[0] || {};

  const chartData = useMemo(() => [...activeData].reverse().map(row => ({
    time: rangeMode === 'all'
      ? new Date(row.recorded_at).toLocaleDateString('th-TH', { day:'numeric', month:'short' }) + ' ' +
        new Date(row.recorded_at).toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' })
      : new Date(row.recorded_at).toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' }),
    dissolved_oxygen: row.dissolved_oxygen,
    ph:               row.ph,
    temperature:      row.temperature,
    turbidity:        row.turbidity,
  })), [activeData, rangeMode]);

  const totalPages = Math.ceil(activeData.length / ITEMS_PER_PAGE);
  const pagedData  = activeData.slice((curPage-1)*ITEMS_PER_PAGE, curPage*ITEMS_PER_PAGE);
  const activeParam = PARAMS.find(p => p.key === selParam) || PARAMS[0];

  const handleRangeChange = useCallback(mode => {
    setRangeMode(mode);
    setCurPage(1);
  }, []);

  const handleDateSelect = useCallback(key => {
    setSelDate(key);
    setCurPage(1);
  }, []);

  // Section header label
  const sectionLabel = rangeMode === 'all'
    ? `ค่าล่าสุด — ข้อมูลทั้งหมด (${allData.length} รายการ)`
    : `ค่าล่าสุด — ${fmtDate(selDate)}${activeData.length === 0 ? ' (ไม่มีข้อมูล)' : ''}`;

  return (
    <motion.div className="wq-page" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.3 }}>

      {/* ── Header ── */}
      <header className="wq-header">
        <div className="wq-header-left">
          <button className="wq-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={17}/>
          </button>
          <span className="wq-page-title">ประวัติคุณภาพน้ำ</span>
        </div>
        {devices.length > 0 && (
          <div className="wq-device-pill">
            <span className="wq-device-dot"/>
            <select className="wq-device-select" value={deviceId||''}
              onChange={e => setSearchParams({ deviceId: e.target.value })}>
              {devices.map(d => <option key={d.device_id} value={d.device_id}>{d.device_name}</option>)}
            </select>
            <ChevronDown size={13} style={{ color:'rgba(255,255,255,0.5)', flexShrink:0 }}/>
          </div>
        )}
      </header>

      {/* ── Body ── */}
      <main className="wq-body">

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div className="wq-error" initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <AlertTriangle size={16} style={{ flexShrink:0 }}/> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Range toggle ── */}
        <div className="wq-section-label">โหมดการดูข้อมูล</div>
        <div className="wq-range-toggle">
          <button
            className={`wq-range-btn${rangeMode === 'all' ? ' active' : ''}`}
            onClick={() => handleRangeChange('all')}
          >
            <Layers size={15}/>
            ข้อมูลทั้งหมด
          </button>
          <button
            className={`wq-range-btn${rangeMode === 'day' ? ' active' : ''}`}
            onClick={() => handleRangeChange('day')}
          >
            <CalendarDays size={15}/>
            รายวัน
          </button>
        </div>

        {/* ── Calendar (day mode only) ── */}
        <AnimatePresence>
          {rangeMode === 'day' && (
            <motion.div
              key="calendar"
              initial={{ opacity:0, height:0, marginBottom:0 }}
              animate={{ opacity:1, height:'auto', marginBottom:0 }}
              exit={{ opacity:0, height:0, marginBottom:0 }}
              transition={{ duration:0.25 }}
              style={{ overflow:'hidden' }}
            >
              <div className="wq-section-label" style={{ marginTop:24 }}>เลือกวันที่</div>
              <Calendar allData={allData} selectedDate={selDate} onSelectDate={handleDateSelect}/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stat cards ── */}
        <div className="wq-section-label" style={{ marginTop:24 }}>{sectionLabel}</div>
        <div className="wq-stats-grid">
          <StatCard icon={Droplets}    label="pH"       value={latest.ph}               unit=""     type="ph"        />
          <StatCard icon={Wind}        label="DO"       value={latest.dissolved_oxygen} unit="mg/L" type="do"        />
          <StatCard icon={Thermometer} label="อุณหภูมิ" value={latest.temperature}      unit="°C"   type="temp"      />
          <StatCard icon={Zap}         label="ความขุ่น"  value={latest.turbidity}        unit="NTU"  type="turbidity" />
        </div>

        {/* ── Analysis ── */}
        <div className="wq-section-label">วิเคราะห์ข้อมูล</div>
        <div className="wq-analysis">

          <div className="wq-tabs">
            <button className={`wq-tab${viewMode==='chart' ? ' active':''}`} onClick={() => setViewMode('chart')}>
              <BarChart2 size={15}/> กราฟ
            </button>
            <button className={`wq-tab${viewMode==='table' ? ' active':''}`} onClick={() => setViewMode('table')}>
              <List size={15}/> ตาราง
            </button>
          </div>

          {activeData.length === 0 ? (
            <div className="wq-empty">
              <span className="wq-empty-icon">📭</span>
              {rangeMode === 'day' ? 'ไม่มีข้อมูลในวันที่เลือก' : 'ไม่มีข้อมูล'}
            </div>
          ) : viewMode === 'chart' ? (
            <div>
              <div className="wq-param-bar">
                <select className="wq-param-select" value={selParam} onChange={e => setSelParam(e.target.value)}>
                  {PARAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="wq-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6f7f5"/>
                    <XAxis dataKey="time" axisLine={false} tickLine={false}
                      tick={{ fill:'#6b8fa3', fontSize:10 }} dy={6}
                      interval={rangeMode==='all' ? Math.floor(chartData.length/6) : 'preserveStartEnd'}/>
                    <YAxis axisLine={false} tickLine={false} tick={{ fill:'#6b8fa3', fontSize:11 }}/>
                    <Tooltip content={<ChartTooltip/>}/>
                    <Line type="monotone" dataKey={selParam} stroke={activeParam.color}
                      strokeWidth={2.5} dot={false} name={activeParam.label}
                      activeDot={{ r:5, fill:activeParam.color }}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div>
              <div className="wq-table-wrap">
                <table className="wq-table">
                  <thead>
                    <tr>
                      <th>เวลา</th><th>pH</th><th>DO</th><th>Temp</th><th>Turb</th><th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <TableRows rows={pagedData} showDate={rangeMode === 'all'}/>
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="wq-pagination">
                  <span className="wq-page-info">
                    หน้า {curPage} / {totalPages} ({activeData.length} รายการ)
                  </span>
                  <div className="wq-page-btns">
                    <button className="wq-page-btn" disabled={curPage===1} onClick={() => setCurPage(p => p-1)}>
                      <ChevronLeft size={15}/>
                    </button>
                    <button className="wq-page-btn" disabled={curPage===totalPages} onClick={() => setCurPage(p => p+1)}>
                      <ChevronRight size={15}/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
};

export default WaterQuality;
