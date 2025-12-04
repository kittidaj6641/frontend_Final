// src/water-quality.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import config from './config';
import './water-quality.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  ArrowLeft, Activity, Table, Droplets, Wind, Thermometer, AlertCircle, Zap, ChevronDown
} from 'lucide-react';

const WaterQuality = () => {
  const [waterData, setWaterData] = useState([]);
  const [devices, setDevices] = useState([]); 
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('chart');
  const [selectedParam, setSelectedParam] = useState('dissolved_oxygen');

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const deviceId = searchParams.get('deviceId');

  // 1. โหลดรายชื่ออุปกรณ์
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

  // 2. โหลดข้อมูลคุณภาพน้ำ
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
           setError('ไม่สามารถดึงข้อมูลคุณภาพน้ำได้');
        }
      }
    };

    fetchWaterQuality();
    const intervalId = setInterval(fetchWaterQuality, 10000);
    return () => clearInterval(intervalId);
  }, [navigate, deviceId]);

  const checkQuality = (type, value) => {
    if (value === null || value === undefined) return { status: 'unknown', msg: '-' };
    
    const rules = {
        ph: { min: 7.5, max: 8.5, label: 'pH' },
        do: { min: 4, max: 99, label: 'ออกซิเจน' },
        temp: { min: 26, max: 32, label: 'อุณหภูมิ' },
        turbidity: { min: 0, max: 200, label: 'ความขุ่น' }
    };

    const rule = rules[type];
    if (!rule) return { status: 'normal', msg: 'ปกติ' };

    if (value < rule.min) return { status: 'warning', msg: `ต่ำ (<${rule.min})` }; // ย่อคำให้สั้นลงเพื่อมือถือ
    if (value > rule.max) return { status: 'warning', msg: `สูง (>${rule.max})` }; // ย่อคำให้สั้นลงเพื่อมือถือ
    return { status: 'normal', msg: 'ปกติ' };
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

  const StatCard = ({ icon: Icon, label, value, unit, type }) => {
      const quality = checkQuality(type, value);
      return (
          <div className={`stat-card-small ${quality.status}`}>
            <span className="stat-label"><Icon size={16}/> {label}</span>
            <span className="stat-value">{value || '-'} <span className="stat-unit">{unit}</span></span>
            {quality.status === 'warning' && <span className="stat-reason">{quality.msg}</span>}
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
                <h2>ข้อมูลย้อนหลัง</h2>
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
                <ChevronDown size={14} style={{position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#007bff'}}/>
            </div>
        </div>
      </header>

      {error && (
        <div style={{background: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '12px', marginBottom: '20px', display:'flex', gap:'10px', fontSize:'14px'}}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <section className="latest-stats-grid">
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
                        {waterData.map((row, index) => {
                            const qDO = checkQuality('do', row.dissolved_oxygen);
                            const qPH = checkQuality('ph', row.ph);
                            const qTemp = checkQuality('temp', row.temperature);
                            const qTurb = checkQuality('turbidity', row.turbidity);

                            const alerts = [];
                            if(qDO.status === 'warning') alerts.push(`DO: ${qDO.msg}`);
                            if(qPH.status === 'warning') alerts.push(`pH: ${qPH.msg}`);
                            if(qTemp.status === 'warning') alerts.push(`Temp: ${qTemp.msg}`);
                            if(qTurb.status === 'warning') alerts.push(`Turbid: ${qTurb.msg}`);

                            return (
                                <tr key={index}>
                                    <td>{new Date(row.recorded_at).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})}</td>
                                    <td style={{color: qDO.status === 'warning' ? 'red' : 'inherit'}}>{row.dissolved_oxygen}</td>
                                    <td style={{color: qPH.status === 'warning' ? 'red' : 'inherit'}}>{row.ph}</td>
                                    <td style={{color: qTemp.status === 'warning' ? 'red' : 'inherit'}}>{row.temperature}</td>
                                    <td style={{color: qTurb.status === 'warning' ? 'red' : 'inherit'}}>{row.turbidity || '-'}</td>
                                    <td>
                                        {alerts.length > 0 ? (
                                            <span className="status-badge bg-danger">
                                                {alerts[0]} {alerts.length > 1 && `+${alerts.length - 1}`}
                                            </span>
                                        ) : (
                                            <span className="status-badge bg-success">ปกติ</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </section>
    </motion.div>
  );
};

export default WaterQuality;
