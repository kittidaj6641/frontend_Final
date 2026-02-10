// src/water-quality.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import config from './config';
import { checkQuality } from './waterStandard'; // Import Logic 3 สถานะ
import './water-quality.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  ArrowLeft, Activity, Table, Droplets, Wind, Thermometer, 
  AlertCircle, Zap, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle
} from 'lucide-react';

const WaterQuality = () => {
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

  // ... (ส่วน useEffect fetchDevices และ fetchWaterQuality เหมือนเดิม ไม่ต้องแก้) ...
  // เพื่อความกระชับ ผมละส่วน fetch ไว้ตรงนี้ ให้ใช้โค้ดเดิมของคุณในส่วนบนได้เลย
  
  // --- แทรก Code เดิมของคุณช่วง useEffect ตรงนี้ ---
  useEffect(() => {
    const fetchDevices = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get(`${config.API_BASE_URL}/member/devices`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setDevices(res.data);
        if (!deviceId && res.data.length > 0) {
            setSearchParams({ deviceId: res.data[0].device_id });
        }
      } catch (err) {
        console.error("Failed to load devices");
      }
    };
    fetchDevices();
  }, [deviceId, setSearchParams]);

  useEffect(() => {
    if (!deviceId) return;
    const fetchWaterQuality = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await axios.get(
          `${config.API_BASE_URL}/member/water-quality?deviceId=${deviceId}`, 
          { headers: { Authorization: `Bearer ${token}` } } 
        );
        setWaterData(response.data);
        setError('');
      } catch (error) {
        if (error.response?.status === 403) {
           localStorage.removeItem('token');
           navigate('/login');
        } else {
           setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ หรือดึงข้อมูลได้');
        }
      }
    };
    fetchWaterQuality();
    const intervalId = setInterval(fetchWaterQuality, 10000);
    return () => clearInterval(intervalId);
  }, [navigate, deviceId]);
  // ----------------------------------------------------


  // Logic Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTableData = waterData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(waterData.length / itemsPerPage);

  const changePage = (pageNumber) => {
    if(pageNumber >= 1 && pageNumber <= totalPages){
        setCurrentPage(pageNumber);
    }
  };

  const latest = waterData.length > 0 ? waterData[0] : {};

  // ข้อมูลสำหรับกราฟ
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

  // --- ส่วน StatCard ปรับปรุงใหม่ รองรับ 3 สี ---
  const StatCard = ({ icon: Icon, label, value, unit, type }) => {
      const quality = checkQuality(type, value);
      
      // กำหนดสไตล์พื้นหลังจางๆ ตามสถานะ
      let bgStyle = '#fff';
      if (quality.status === 'critical') bgStyle = '#fff5f5'; // แดงจาง
      else if (quality.status === 'warning') bgStyle = '#fff9db'; // เหลืองจาง

      return (
          <div className={`stat-card-small`} style={{
              borderLeft: `5px solid ${quality.color}`,
              backgroundColor: bgStyle,
              padding: '15px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <span className="stat-label" style={{display:'flex', alignItems:'center', gap:'5px', color:'#666'}}>
                    <Icon size={18}/> {label}
                </span>
                {/* ไอคอนสถานะมุมขวาบน */}
                {quality.status === 'critical' && <AlertCircle size={18} color={quality.color} />}
                {quality.status === 'warning' && <AlertTriangle size={18} color={quality.color} />}
                {quality.status === 'normal' && <CheckCircle size={18} color={quality.color} />}
            </div>

            <div style={{marginTop:'10px'}}>
                 <span className="stat-value" style={{fontSize:'24px', fontWeight:'bold', color: quality.status !== 'normal' ? quality.color : '#333'}}>
                    {value !== undefined ? value : '-'} <span className="stat-unit" style={{fontSize:'14px', color:'#888'}}>{unit}</span>
                 </span>
            </div>
            
            {/* แสดงข้อความสถานะ */}
            <div style={{marginTop:'5px', fontSize:'12px', color: quality.color, fontWeight:'600'}}>
                {quality.msg}
            </div>
         </div>
      );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="water-quality-page">
      <header className="page-header">
        <div className="header-left">
            <button className="back-btn" onClick={() => navigate('/')}>
                <ArrowLeft size={18} /> กลับ
            </button>
            <div className="header-title">
                <h2>ข้อมูลคุณภาพน้ำ</h2>
            </div>
        </div>

        <div className="device-selector">
            <span style={{fontWeight:'bold', color:'#555', fontSize:'14px'}}>📡</span>
            <div style={{position:'relative', width:'100%'}}>
                <select 
                    className="device-select"
                    value={deviceId || ''}
                    onChange={(e) => setSearchParams({ deviceId: e.target.value })}
                >
                    {devices.map(d => (
                        <option key={d.device_id} value={d.device_id}>{d.device_name}</option>
                    ))}
                </select>
                <ChevronDown size={14} style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#007bff'}}/>
            </div>
        </div>
      </header>

      {error && (
        <div style={{background: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '12px', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px', fontSize:'14px'}}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Grid แสดงค่าปัจจุบัน */}
      <section className="latest-stats-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'15px', marginBottom:'20px'}}>
         <StatCard icon={Wind} label="DO" value={latest.dissolved_oxygen} unit="mg/L" type="do" />
         <StatCard icon={Droplets} label="pH" value={latest.ph} unit="" type="ph" />
         <StatCard icon={Thermometer} label="Temp" value={latest.temperature} unit="°C" type="temp" />
         <StatCard icon={Zap} label="Turbidity" value={latest.turbidity} unit="NTU" type="turbidity" />
      </section>

      <section className="analysis-container">
        <div className="tabs">
            <button className={`tab-btn ${viewMode === 'chart' ? 'active' : ''}`} onClick={() => setViewMode('chart')}>
                <Activity size={16} /> กราฟ
            </button>
            <button className={`tab-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
                <Table size={16} /> ตาราง
            </button>
        </div>

        {viewMode === 'chart' ? (
            <div>
                <div className="filter-bar">
                    <select 
                        className="param-select"
                        value={selectedParam} 
                        onChange={(e) => setSelectedParam(e.target.value)}
                    >
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
                            {parameters.map(p => (
                                selectedParam === p.key && 
                                <Line key={p.key} type="monotone" dataKey={selectedParam === 'dissolved_oxygen' ? 'do' : selectedParam === 'temperature' ? 'temp' : selectedParam} stroke={p.color} strokeWidth={3} name={p.label} dot={false} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        ) : (
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>เวลา</th>
                            <th>DO</th>
                            <th>pH</th>
                            <th>Temp</th>
                            <th>Turbid</th>
                            <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTableData.map((row, index) => {
                            // ตรวจสอบคุณภาพแต่ละค่า
                            const qDO = checkQuality('do', row.dissolved_oxygen);
                            const qPH = checkQuality('ph', row.ph);
                            const qTemp = checkQuality('temp', row.temperature);
                            const qTurb = checkQuality('turbidity', row.turbidity);

                            // รวบรวม Alert (เก็บทั้งข้อความและสี)
                            const alerts = [];
                            if(qDO.status !== 'normal') alerts.push({ msg: `DO: ${qDO.msg}`, color: qDO.color, status: qDO.status });
                            if(qPH.status !== 'normal') alerts.push({ msg: `pH: ${qPH.msg}`, color: qPH.color, status: qPH.status });
                            if(qTemp.status !== 'normal') alerts.push({ msg: `T: ${qTemp.msg}`, color: qTemp.color, status: qTemp.status });
                            if(qTurb.status !== 'normal') alerts.push({ msg: `Turb: ${qTurb.msg}`, color: qTurb.color, status: qTurb.status });

                            return (
                                <tr key={index}>
                                    <td>{new Date(row.recorded_at).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})}</td>
                                    
                                    {/* แสดงสีตามสถานะของค่านั้นๆ */}
                                    <td style={{color: qDO.color, fontWeight: qDO.status !== 'normal' ? 'bold' : 'normal'}}>{row.dissolved_oxygen}</td>
                                    <td style={{color: qPH.color, fontWeight: qPH.status !== 'normal' ? 'bold' : 'normal'}}>{row.ph}</td>
                                    <td style={{color: qTemp.color, fontWeight: qTemp.status !== 'normal' ? 'bold' : 'normal'}}>{row.temperature}</td>
                                    <td style={{color: qTurb.color, fontWeight: qTurb.status !== 'normal' ? 'bold' : 'normal'}}>{row.turbidity || '-'}</td>
                                    
                                    <td>
                                        {alerts.length > 0 ? (
                                            <div style={{display:'flex', flexWrap:'wrap', gap:'4px'}}>
                                                {alerts.map((alert, idx) => (
                                                    <span key={idx} style={{
                                                        background: alert.status === 'critical' ? '#ffebee' : '#fff9db', // พื้นหลังต่างกัน
                                                        color: alert.color, 
                                                        padding: '2px 8px', 
                                                        borderRadius: '12px', 
                                                        fontSize: '11px',
                                                        border: `1px solid ${alert.color}`,
                                                        whiteSpace: 'nowrap',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {alert.msg}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={{color:'#28a745', fontSize:'12px', fontWeight:'bold', display:'flex', alignItems:'center', gap:'4px'}}>
                                                <CheckCircle size={12}/> ปกติ
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* ส่วน Pagination (เหมือนเดิม) */}
                {waterData.length > 0 && (
                    <div className="pagination-controls" style={{
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '15px 0',
                        borderTop: '1px solid #eee',
                        marginTop: '10px'
                    }}>
                        <span style={{fontSize: '13px', color: '#666'}}>
                            หน้า {currentPage} จาก {totalPages}
                        </span>
                        
                        <div style={{display: 'flex', gap: '5px'}}>
                            <button 
                                onClick={() => changePage(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '5px 10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    background: currentPage === 1 ? '#f5f5f5' : '#fff',
                                    cursor: currentPage === 1 ? 'default' : 'pointer',
                                    display: 'flex', alignItems: 'center'
                                }}
                            >
                                <ChevronLeft size={16}/>
                            </button>
                            
                            <button 
                                onClick={() => changePage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '5px 10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                                    cursor: currentPage === totalPages ? 'default' : 'pointer',
                                    display: 'flex', alignItems: 'center'
                                }}
                            >
                                <ChevronRight size={16}/>
                            </button>
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
