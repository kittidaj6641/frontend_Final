// src/water-quality.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import config from './config';
import { checkQuality } from './waterStandard'; // <--- 1. เพิ่มบรรทัดนี้
import './water-quality.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  ArrowLeft, Activity, Table, Droplets, Wind, Thermometer, AlertCircle, Zap, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';

const WaterQuality = () => {
  // ... (State และ useEffect เหมือนเดิม ไม่ต้องแก้) ...
  const [waterData, setWaterData] = useState([]);
  const [devices, setDevices] = useState([]); 
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('chart');
  const [selectedParam, setSelectedParam] = useState('dissolved_oxygen');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const deviceId = searchParams.get('deviceId');

  // ... (ส่วน fetchDevices และ fetchWaterQuality เหมือนเดิม) ...
  useEffect(() => {
    // ... (Code เดิม)
    const fetchDevices = async () => { /* ... */ };
    fetchDevices();
  }, [deviceId, setSearchParams]);

  useEffect(() => {
    // ... (Code เดิม)
    if (!deviceId) return;
    const fetchWaterQuality = async () => {
        // ... โค้ด fetch ข้อมูลเหมือนเดิม ...
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        try {
            const response = await axios.get(`${config.API_BASE_URL}/member/water-quality?deviceId=${deviceId}`, { headers: { Authorization: `Bearer ${token}` } });
            setWaterData(response.data);
        } catch(err) { /*...*/ }
    };
    fetchWaterQuality();
    const intervalId = setInterval(fetchWaterQuality, 10000);
    return () => clearInterval(intervalId);
  }, [navigate, deviceId]);

  // --- ลบฟังก์ชัน checkQuality เก่าออก เพราะเรา import มาแล้ว ---

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTableData = waterData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(waterData.length / itemsPerPage);
  const changePage = (p) => { if(p >= 1 && p <= totalPages) setCurrentPage(p); };

  const latest = waterData.length > 0 ? waterData[0] : {};

  // Chart Data Preparation
  const chartData = [...waterData].reverse().map(item => ({
      time: new Date(item.recorded_at).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'}),
      ph: item.ph,
      do: item.dissolved_oxygen || item.oxygen,
      temp: item.temperature,
      turbidity: item.turbidity
  }));

  const parameters = [
    { key: 'dissolved_oxygen', label: 'ออกซิเจน (DO)', color: '#0088FE' },
    { key: 'ph', label: 'ค่า pH', color: '#8884d8' },
    { key: 'temperature', label: 'อุณหภูมิ', color: '#FF8042' },
    { key: 'turbidity', label: 'ความขุ่น', color: '#82ca9d' }
  ];

  // Component การ์ดแสดงผล (ใช้ checkQuality จากไฟล์กลาง)
  const StatCard = ({ icon: Icon, label, value, unit, type }) => {
      const quality = checkQuality(type, value); // เรียกใช้ฟังก์ชันกลาง
      return (
          <div className={`stat-card-small ${quality.status}`} style={{borderColor: quality.color}}>
            <span className="stat-label"><Icon size={16}/> {label}</span>
            <span className="stat-value" style={{color: quality.status === 'warning' ? quality.color : 'inherit'}}>
                {value || '-'} <span className="stat-unit">{unit}</span>
            </span>
            {quality.status === 'warning' && <span className="stat-reason" style={{color: quality.color}}>{quality.msg}</span>}
         </div>
      );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="water-quality-page">
      {/* ... (Header เหมือนเดิม) ... */}
      <header className="page-header">
         {/* ... Code Header ... */}
         <div className="header-left"><button className="back-btn" onClick={() => navigate('/')}><ArrowLeft size={18} /> กลับ</button><h2>ข้อมูลย้อนหลัง</h2></div>
         <div className="device-selector">
             {/* ... Code Dropdown ... */}
             <select className="device-select" value={deviceId || ''} onChange={(e) => setSearchParams({ deviceId: e.target.value })}>
                {devices.map(d => <option key={d.device_id} value={d.device_id}>{d.device_name}</option>)}
             </select>
         </div>
      </header>

      {/* ... (Latest Stats เหมือนเดิม) ... */}
      <section className="latest-stats-grid">
         <StatCard icon={Wind} label="DO" value={latest.dissolved_oxygen} unit="mg/L" type="do" />
         <StatCard icon={Droplets} label="pH" value={latest.ph} unit="" type="ph" />
         <StatCard icon={Thermometer} label="Temp" value={latest.temperature} unit="°C" type="temp" />
         <StatCard icon={Zap} label="Turbidity" value={latest.turbidity} unit="NTU" type="turbidity" />
      </section>

      <section className="analysis-container">
        {/* ... (Tabs และ Chart เหมือนเดิม) ... */}
        <div className="tabs">
            <button className={`tab-btn ${viewMode === 'chart' ? 'active' : ''}`} onClick={() => setViewMode('chart')}><Activity size={16} /> กราฟ</button>
            <button className={`tab-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}><Table size={16} /> ตาราง</button>
        </div>

        {viewMode === 'chart' ? (
             /* ... (Chart Code เหมือนเดิม) ... */
             <div>
                <div className="filter-bar">
                    <select className="param-select" value={selectedParam} onChange={(e) => setSelectedParam(e.target.value)}>
                        {parameters.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="time" tick={{fontSize: 12}} />
                            <YAxis tick={{fontSize: 12}} />
                            <Tooltip wrapperStyle={{fontSize:'12px'}} />
                            <Legend wrapperStyle={{fontSize:'12px'}} />
                            {parameters.map(p => (selectedParam === p.key && <Line key={p.key} type="monotone" dataKey={selectedParam === 'dissolved_oxygen' ? 'do' : selectedParam === 'temperature' ? 'temp' : selectedParam} stroke={p.color} strokeWidth={3} name={p.label} dot={false} />))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        ) : (
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>เวลา</th><th>DO</th><th>pH</th><th>Temp</th><th>Turbid</th><th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTableData.map((row, index) => {
                            // เรียกใช้ checkQuality จากไฟล์กลาง
                            const qDO = checkQuality('do', row.dissolved_oxygen);
                            const qPH = checkQuality('ph', row.ph);
                            const qTemp = checkQuality('temp', row.temperature);
                            const qTurb = checkQuality('turbidity', row.turbidity);

                            // รวบรวม Alert
                            const alerts = [];
                            if(qDO.status === 'warning') alerts.push(qDO.msg);
                            if(qPH.status === 'warning') alerts.push(qPH.msg);
                            if(qTemp.status === 'warning') alerts.push(qTemp.msg);
                            if(qTurb.status === 'warning') alerts.push(qTurb.msg);

                            return (
                                <tr key={index}>
                                    <td>{new Date(row.recorded_at).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})}</td>
                                    {/* ใช้สีจาก checkQuality โดยตรง */}
                                    <td style={{color: qDO.color, fontWeight: qDO.status === 'warning' ? 'bold' : 'normal'}}>{row.dissolved_oxygen}</td>
                                    <td style={{color: qPH.color, fontWeight: qPH.status === 'warning' ? 'bold' : 'normal'}}>{row.ph}</td>
                                    <td style={{color: qTemp.color, fontWeight: qTemp.status === 'warning' ? 'bold' : 'normal'}}>{row.temperature}</td>
                                    <td style={{color: qTurb.color, fontWeight: qTurb.status === 'warning' ? 'bold' : 'normal'}}>{row.turbidity || '-'}</td>
                                    <td>
                                        {alerts.length > 0 ? (
                                            <div style={{display:'flex', flexWrap:'wrap', gap:'4px'}}>
                                                {alerts.map((alert, idx) => (
                                                    <span key={idx} style={{background: '#ffebee', color: '#c62828', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', border: '1px solid #ffcdd2', whiteSpace: 'nowrap'}}>
                                                        {alert}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={{color:'#28a745', fontSize:'12px', fontWeight:'bold'}}>ปกติ</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {/* ... (Pagination Code เหมือนเดิม) ... */}
                {waterData.length > 0 && (
                    <div className="pagination-controls" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderTop: '1px solid #eee', marginTop: '10px'}}>
                        <span style={{fontSize: '13px', color: '#666'}}>หน้า {currentPage} จาก {totalPages}</span>
                        <div style={{display: 'flex', gap: '5px'}}>
                            <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} style={{padding: '5px 10px', border: '1px solid #ddd', borderRadius: '6px', cursor: currentPage === 1 ? 'default' : 'pointer'}}><ChevronLeft size={16}/></button>
                            <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} style={{padding: '5px 10px', border: '1px solid #ddd', borderRadius: '6px', cursor: currentPage === totalPages ? 'default' : 'pointer'}}><ChevronRight size={16}/></button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </section>
    </motion.div>
  );
};
export default WaterQuality;
