// src/water-quality.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import config from './config';
import { checkQuality } from './waterStandard';
import './water-quality.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ArrowLeft, Droplets, Wind, Thermometer, Zap,
  ChevronDown, ChevronLeft, ChevronRight, AlertTriangle,
  CheckCircle, BarChart2, List, CalendarDays, Clock
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const THAI_MONTHS = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม',
];
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

// ─── Custom Tooltip สำหรับกราฟ ────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'12px',
      padding:'12px 16px', boxShadow:'0 10px 25px -5px rgba(0,0,0,0.1)', fontSize:'13px',
    }}>
      <div style={{ color:'#64748b', marginBottom:'6px', fontWeight:600, display:'flex', alignItems:'center', gap:'6px' }}>
        <Clock size={14}/> {label}
      </div>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color, fontWeight:800, fontSize:'18px' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ─── Stat Card ที่ปรับดีไซน์ใหม่ ──────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, unit, type }) => {
  const q   = checkQuality(type, value);
  const cls = statusClass(q);
  const disp = (value !== undefined && value !== null && value !== '') ? value : '—';
  
  // กำหนดสีตามสถานะ
  const colorMap = {
    ok:   { text: '#059669', bg: '#ecfdf5', icon: '#10b981' },
    warn: { text: '#d97706', bg: '#fffbeb', icon: '#f59e0b' },
    bad:  { text: '#dc2626', bg: '#fef2f2', icon: '#ef4444' }
  };
  const theme = colorMap[cls];

  return (
    <div style={{ 
      display:'flex', flexDirection:'column', padding:'16px', borderRadius:'20px', 
      background:'#fff', boxShadow:'0 4px 15px rgba(0,0,0,0.03)', border:'1px solid #f1f5f9', 
      position:'relative', overflow:'hidden' 
    }}>
      <div style={{ position:'absolute', top:'-15px', right:'-15px', opacity:0.04, transform:'scale(2)' }}>
        <Icon size={64}/>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#64748b', fontSize:'13px', fontWeight:700, marginBottom:'8px' }}>
        <div style={{ background: theme.bg, padding:'6px', borderRadius:'10px', display:'flex' }}>
          <Icon size={16} color={theme.icon}/>
        </div>
        {label}
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:'4px', zIndex:1 }}>
        <span style={{ fontSize:'26px', fontWeight:800, color:'#0f172a' }}>{disp}</span>
        {unit && <span style={{ fontSize:'12px', color:'#94a3b8', fontWeight:600 }}>{unit}</span>}
      </div>
      <div style={{ marginTop:'auto', paddingTop:'12px', zIndex:1 }}>
        <span style={{ 
          display:'inline-flex', padding:'4px 10px', borderRadius:'8px', fontSize:'11px', 
          fontWeight:700, background: theme.bg, color: theme.text, alignItems:'center', gap:'4px'
        }}>
          {cls === 'ok' && <CheckCircle size={12}/>}
          {cls !== 'ok' && <AlertTriangle size={12}/>}
          {q.msg || 'รอข้อมูล'}
        </span>
      </div>
    </div>
  );
};

// ─── Compact Date Selector (ส่วนเลือกวันที่แบบย่อขนาดเล็ก) ──────────────────────────
const CompactDateSelector = ({ mode, date, onChange }) => {
  const d = new Date(date + 'T00:00:00');

  const shiftDate = (amount) => {
    const nd = new Date(d);
    if (mode === 'day') nd.setDate(nd.getDate() + amount);
    if (mode === 'week') nd.setDate(nd.getDate() + (amount * 7));
    if (mode === 'month') nd.setMonth(nd.getMonth() + amount);
    onChange(toDateKey(nd));
  };

  let label = '';
  if (mode === 'day') label = `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()+543}`;
  if (mode === 'week') {
    const sd = new Date(d); sd.setDate(sd.getDate() - 6);
    label = `${sd.getDate()} - ${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()+543}`;
  }
  if (mode === 'month') label = `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()+543}`;

  const inputType = mode === 'month' ? 'month' : 'date';
  const val = mode === 'month' ? date.substring(0,7) : date;

  return (
    <div style={{ 
      display:'flex', alignItems:'center', justifyContent:'space-between', 
      background:'#fff', padding:'10px 16px', borderRadius:'16px', 
      boxShadow:'0 2px 10px rgba(0,0,0,0.03)', border:'1px solid #f1f5f9', margin:'12px 0' 
    }}>
      <button onClick={()=>shiftDate(-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:'4px' }}>
        <ChevronLeft size={20}/>
      </button>
      
      <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'8px', fontWeight:'700', color:'#1e293b', fontSize:'15px' }}>
        <CalendarDays size={18} color="#0d9488"/>
        {label}
        <input 
          type={inputType} 
          value={val}
          onChange={(e) => {
            if(e.target.value) {
              onChange(mode === 'month' ? e.target.value + '-01' : e.target.value);
            }
          }}
          style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' }}
        />
      </div>

      <button onClick={()=>shiftDate(1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:'4px' }}>
        <ChevronRight size={20}/>
      </button>
    </div>
  );
};

// ─── Table body ───────────────────────────────────────────────────────────────
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
      <td style={{ color:'#64748b', fontSize:'12px', whiteSpace:'nowrap' }}>
        {showDate && <span style={{ marginRight:'6px', fontWeight:600 }}>
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
          <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
            {alerts.map((a,j) => <span key={j} className={`wq-alert-chip wq-chip-${a.cls}`}>{a.msg}</span>)}
          </div>
        ) : (
          <span className="wq-alert-chip wq-chip-ok" style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'#ecfdf5', color:'#059669', padding:'4px 8px', borderRadius:'6px' }}>
            <CheckCircle size={12}/> ปกติ
          </span>
        )}
      </td>
    </tr>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
const WaterQuality = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const deviceId = searchParams.get('deviceId');

  const [allData,    setAllData]    = useState([]);
  const [devices,    setDevices]    = useState([]);
  const [error,      setError]      = useState('');
  const [rangeMode,  setRangeMode]  = useState('day');   // 'all' | 'day' | 'week' | 'month'
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
    if (rangeMode === 'day') {
      return allData.filter(row => toDateKey(new Date(row.recorded_at)) === selDate);
    }
    if (rangeMode === 'week') {
      const endObj = new Date(selDate + 'T00:00:00');
      const startObj = new Date(selDate + 'T00:00:00');
      startObj.setDate(startObj.getDate() - 6);
      const endStr = toDateKey(endObj);
      const startStr = toDateKey(startObj);
      return allData.filter(row => {
        const dStr = toDateKey(new Date(row.recorded_at));
        return dStr >= startStr && dStr <= endStr;
      });
    }
    if (rangeMode === 'month') {
      const prefix = selDate.substring(0, 7); 
      return allData.filter(row => toDateKey(new Date(row.recorded_at)).startsWith(prefix));
    }
    return allData;
  }, [allData, rangeMode, selDate]);

  const latest = activeData[0] || {};

  const chartData = useMemo(() => [...activeData].reverse().map(row => {
    const d = new Date(row.recorded_at);
    let timeStr = rangeMode === 'day' 
      ? d.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' })
      : d.toLocaleDateString('th-TH', { day:'numeric', month:'short' }) + ' ' + d.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' });
    
    return {
      time: timeStr,
      dissolved_oxygen: row.dissolved_oxygen,
      ph:               row.ph,
      temperature:      row.temperature,
      turbidity:        row.turbidity,
    };
  }), [activeData, rangeMode]);

  const totalPages = Math.ceil(activeData.length / ITEMS_PER_PAGE);
  const pagedData  = activeData.slice((curPage-1)*ITEMS_PER_PAGE, curPage*ITEMS_PER_PAGE);
  const activeParam = PARAMS.find(p => p.key === selParam) || PARAMS[0];

  const handleRangeChange = useCallback(mode => {
    setRangeMode(mode);
    setCurPage(1);
  }, []);

  let sectionLabel = '';
  if (rangeMode === 'all') {
    sectionLabel = `ข้อมูลทั้งหมด (${allData.length} รายการ)`;
  } else if (rangeMode === 'day') {
    sectionLabel = `ข้อมูลวันที่ ${fmtDate(selDate)}${activeData.length === 0 ? ' (ไม่มีข้อมูล)' : ''}`;
  } else if (rangeMode === 'week') {
    const startObj = new Date(selDate + 'T00:00:00');
    startObj.setDate(startObj.getDate() - 6);
    sectionLabel = `ข้อมูลตั้งแต่วันที่ ${fmtDate(toDateKey(startObj))} ถึง ${fmtDate(selDate)}${activeData.length === 0 ? ' (ไม่มีข้อมูล)' : ''}`;
  } else if (rangeMode === 'month') {
    const [y, m] = selDate.split('-');
    sectionLabel = `ข้อมูลประจำเดือน ${THAI_MONTHS[parseInt(m)-1]} ${parseInt(y)+543}${activeData.length === 0 ? ' (ไม่มีข้อมูล)' : ''}`;
  }

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
          <div className="wq-device-pill" style={{ background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)' }}>
            <span className="wq-device-dot"/>
            <select className="wq-device-select" value={deviceId||''} onChange={e => setSearchParams({ deviceId: e.target.value })}>
              {devices.map(d => <option key={d.device_id} value={d.device_id}>{d.device_name}</option>)}
            </select>
            <ChevronDown size={13} style={{ color:'rgba(255,255,255,0.8)' }}/>
          </div>
        )}
      </header>

      {/* ── Body ── */}
      <main className="wq-body">

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div className="wq-error" initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <AlertTriangle size={16}/> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Segmented Control (ปุ่มเลือกโหมดดีไซน์ใหม่) ── */}
        <div style={{ 
          display: 'flex', background: '#f8fafc', padding: '6px', 
          borderRadius: '16px', gap: '4px', overflowX: 'auto', marginBottom: '16px',
          border: '1px solid #e2e8f0'
        }}>
          {[
            { id: 'day', label: 'รายวัน' },
            { id: 'week', label: '7 วัน' },
            { id: 'month', label: 'รายเดือน' },
            { id: 'all', label: 'ทั้งหมด' }
          ].map(m => (
            <button key={m.id} onClick={() => handleRangeChange(m.id)}
              style={{ 
                flex: '1 1 auto', padding: '10px 16px', borderRadius: '12px', border: 'none',
                background: rangeMode === m.id ? '#ffffff' : 'transparent',
                boxShadow: rangeMode === m.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                color: rangeMode === m.id ? '#0f172a' : '#64748b',
                fontWeight: rangeMode === m.id ? '700' : '600',
                cursor: 'pointer', whiteSpace:'nowrap', transition: 'all 0.2s'
              }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* ── Compact Date Selector ── */}
        <AnimatePresence>
          {rangeMode !== 'all' && (
            <motion.div
              initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            >
              <CompactDateSelector mode={rangeMode} date={selDate} onChange={setSelDate} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stat cards ── */}
        <div className="wq-section-label" style={{ marginTop:24 }}>{sectionLabel}</div>
        <div className="wq-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <StatCard icon={Droplets}    label="pH"       value={latest.ph}               unit=""     type="ph"        />
          <StatCard icon={Wind}        label="DO"       value={latest.dissolved_oxygen} unit="mg/L" type="do"        />
          <StatCard icon={Thermometer} label="อุณหภูมิ" value={latest.temperature}      unit="°C"   type="temp"      />
          <StatCard icon={Zap}         label="ความขุ่น"  value={latest.turbidity}        unit="NTU"  type="turbidity" />
        </div>

        {/* ── Analysis ── */}
        <div className="wq-section-label" style={{ marginTop:32 }}>วิเคราะห์ข้อมูล</div>
        <div className="wq-analysis" style={{ background:'#fff', padding:'20px', borderRadius:'24px', boxShadow:'0 4px 20px rgba(0,0,0,0.02)', border:'1px solid #f1f5f9' }}>

          <div className="wq-tabs" style={{ background:'#f8fafc', padding:'4px', borderRadius:'12px', display:'inline-flex', marginBottom:'20px' }}>
            <button className={`wq-tab${viewMode==='chart' ? ' active':''}`} onClick={() => setViewMode('chart')}
              style={{ background: viewMode==='chart'?'#fff':'transparent', boxShadow: viewMode==='chart'?'0 2px 6px rgba(0,0,0,0.05)':'none' }}>
              <BarChart2 size={15}/> กราฟ
            </button>
            <button className={`wq-tab${viewMode==='table' ? ' active':''}`} onClick={() => setViewMode('table')}
              style={{ background: viewMode==='table'?'#fff':'transparent', boxShadow: viewMode==='table'?'0 2px 6px rgba(0,0,0,0.05)':'none' }}>
              <List size={15}/> ตาราง
            </button>
          </div>

          {activeData.length === 0 ? (
            <div className="wq-empty" style={{ padding:'40px 0', color:'#94a3b8' }}>
              <span className="wq-empty-icon" style={{ fontSize:'40px', marginBottom:'12px' }}>📭</span>
              {rangeMode === 'all' ? 'ไม่มีข้อมูลในระบบ' : 'ไม่มีข้อมูลในช่วงเวลาที่เลือก'}
            </div>
          ) : viewMode === 'chart' ? (
            <div>
              <div className="wq-param-bar" style={{ marginBottom:'20px' }}>
                <select className="wq-param-select" value={selParam} onChange={e => setSelParam(e.target.value)}
                  style={{ background:'#f1f5f9', border:'none', padding:'10px 16px', borderRadius:'12px', fontWeight:600, color:'#334155', outline:'none' }}>
                  {PARAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="wq-chart-wrap" style={{ height:'300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top:10, right:10, left:-20, bottom:0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={activeParam.color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={activeParam.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="time" axisLine={false} tickLine={false}
                      tick={{ fill:'#94a3b8', fontSize:11, fontWeight:600 }} dy={10}
                      interval={rangeMode==='all' ? Math.floor(chartData.length/6) : 'preserveStartEnd'}/>
                    <YAxis axisLine={false} tickLine={false} tick={{ fill:'#94a3b8', fontSize:11, fontWeight:600 }}/>
                    <Tooltip content={<ChartTooltip/>}/>
                    <Area type="monotone" dataKey={selParam} stroke={activeParam.color} fill="url(#colorValue)"
                      strokeWidth={3} dot={false} name={activeParam.label}
                      activeDot={{ r:6, fill:activeParam.color, stroke:'#fff', strokeWidth:3 }}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div>
              <div className="wq-table-wrap" style={{ borderRadius:'12px', overflow:'hidden', border:'1px solid #e2e8f0' }}>
                <table className="wq-table" style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
                  <thead style={{ background:'#f8fafc' }}>
                    <tr>
                      <th style={{ padding:'12px', color:'#475569', fontWeight:700, fontSize:'13px' }}>เวลา</th>
                      <th style={{ padding:'12px', color:'#475569', fontWeight:700, fontSize:'13px' }}>pH</th>
                      <th style={{ padding:'12px', color:'#475569', fontWeight:700, fontSize:'13px' }}>DO</th>
                      <th style={{ padding:'12px', color:'#475569', fontWeight:700, fontSize:'13px' }}>Temp</th>
                      <th style={{ padding:'12px', color:'#475569', fontWeight:700, fontSize:'13px' }}>Turb</th>
                      <th style={{ padding:'12px', color:'#475569', fontWeight:700, fontSize:'13px' }}>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <TableRows rows={pagedData} showDate={rangeMode !== 'day'}/>
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="wq-pagination" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'16px' }}>
                  <span className="wq-page-info" style={{ color:'#64748b', fontSize:'13px', fontWeight:600 }}>
                    หน้า {curPage} / {totalPages} ({activeData.length} รายการ)
                  </span>
                  <div className="wq-page-btns" style={{ display:'flex', gap:'8px' }}>
                    <button className="wq-page-btn" disabled={curPage===1} onClick={() => setCurPage(p => p-1)}
                      style={{ padding:'8px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'#fff', cursor: curPage===1?'not-allowed':'pointer', color: curPage===1?'#cbd5e1':'#0f172a' }}>
                      <ChevronLeft size={18}/>
                    </button>
                    <button className="wq-page-btn" disabled={curPage===totalPages} onClick={() => setCurPage(p => p+1)}
                      style={{ padding:'8px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'#fff', cursor: curPage===totalPages?'not-allowed':'pointer', color: curPage===totalPages?'#cbd5e1':'#0f172a' }}>
                      <ChevronRight size={18}/>
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
