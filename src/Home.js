// src/Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Info, LogOut, Search, AlertTriangle, Clock, Activity,
  PlusCircle, ChevronDown, Fish, BarChart2
} from 'lucide-react';

import config from './config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './Home.css';

const Home = () => {

  const navigate = useNavigate();

  const [waterData, setWaterData] = useState([]);
  const [error, setError] = useState('');
  const [devices, setDevices] = useState([]);

  const [selectedDeviceId, setSelectedDeviceId] = useState(
    localStorage.getItem('lastSelectedDevice') || ''
  );

  const [loadingDevices, setLoadingDevices] = useState(true);

  // โหลดรายการอุปกรณ์
  useEffect(() => {

    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDevices = async () => {

      try {

        const response = await axios.get(
          `${config.API_BASE_URL}/member/devices`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data && response.data.length > 0) {

          setDevices(response.data);

          const currentDeviceExists =
            response.data.some(d => d.device_id === selectedDeviceId);

          if (!selectedDeviceId || !currentDeviceExists) {
            setSelectedDeviceId(response.data[0].device_id);
          }

        } else {

          setDevices([]);

        }

      } catch (err) {

        console.error("Error fetching devices", err);

      } finally {

        setLoadingDevices(false);

      }

    };

    fetchDevices();

  }, [navigate, selectedDeviceId]);


  // บันทึก device ล่าสุด
  useEffect(() => {

    if (selectedDeviceId) {
      localStorage.setItem('lastSelectedDevice', selectedDeviceId);
    }

  }, [selectedDeviceId]);


  // โหลดข้อมูลคุณภาพน้ำ
  useEffect(() => {

    if (!selectedDeviceId) return;

    const token = localStorage.getItem('token');

    const fetchWaterQuality = async () => {

      try {

        const response = await axios.get(
          `${config.API_BASE_URL}/member/water-quality?deviceId=${selectedDeviceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setWaterData(response.data || []);
        setError('');

      } catch (err) {

        setError('ไม่สามารถดึงข้อมูลคุณภาพน้ำได้ โปรดตรวจสอบการเชื่อมต่ออุปกรณ์');

      }

    };

    fetchWaterQuality();

  }, [selectedDeviceId]);


  const handleLogout = async () => {

    const token = localStorage.getItem('token');

    try {

      await axios.post(
        `${config.API_BASE_URL}/member/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

    } catch (error) {}

    localStorage.removeItem('token');
    localStorage.removeItem('lastSelectedDevice');

    navigate('/login');

  };


  const latest = waterData.length > 0 ? waterData[0] : {};

  const chartData = latest.device_id
    ? [
        { name: 'pH', value: Number(latest.ph) || 0, color: '#0ea5e9' },
        { name: 'DO', value: Number(latest.dissolved_oxygen) || 0, color: '#10b981' },
        { name: 'Temp', value: Number(latest.temperature) || 0, color: '#f59e0b' }
      ]
    : [];


  return (

    <div className="home-page">

      <header className="header">

        <div className="brand-logo">
          <Fish size={28} color="var(--primary)" /> SmartFarm AI
        </div>

        <nav className="nav">

          <button className="nav-btn" onClick={() => navigate('/login-logs')}>
            <Clock size={20}/>
          </button>

          <button className="nav-btn danger" onClick={handleLogout}>
            <LogOut size={20}/>
          </button>

        </nav>

      </header>


      <main className="dashboard-container">

        <section className="controls-section">

          <div className="welcome-text">
            <h1>ภาพรวมบ่อเลี้ยง 🌊</h1>
            <p>ติดตามคุณภาพน้ำแบบ Real-time เพื่อผลผลิตที่ดีที่สุด</p>
          </div>


          {!loadingDevices && (

            <div className="device-wrapper">

              <span style={{color:'var(--primary)'}}>
                <Activity size={18}/>
              </span>

              <select
                className="device-select"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
              >

                <option value="">เลือกอุปกรณ์</option>

                {devices.map(d => (
                  <option key={d.device_id} value={d.device_id}>
                    {d.device_name}
                  </option>
                ))}

              </select>

              <ChevronDown size={18}/>

            </div>

          )}

        </section>


        {error && (

          <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            style={{
              padding:'15px',
              background:'#fef2f2',
              color:'#ef4444',
              borderRadius:'10px',
              marginBottom:'20px'
            }}
          >

            <AlertTriangle size={18}/> {error}

          </motion.div>

        )}


        <div className="main-grid">

          <div className="card-box">

            <div className="section-title">
              <BarChart2 size={22}/> ระดับค่าปัจจัยน้ำล่าสุด
            </div>

            <div style={{width:'100%', height:280}}>

              {latest.device_id ? (

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart data={chartData}>

                    <CartesianGrid strokeDasharray="3 3"/>

                    <XAxis dataKey="name"/>
                    <YAxis/>

                    <Tooltip/>

                    <Bar dataKey="value">

                      {chartData.map((entry, index) => (

                        <Cell key={index} fill={entry.color}/>

                      ))}

                    </Bar>

                  </BarChart>

                </ResponsiveContainer>

              ) : (

                <div style={{textAlign:'center'}}>
                  ไม่มีข้อมูลสำหรับแสดงผล
                </div>

              )}

            </div>

          </div>


          <div className="card-box">

            <div className="section-title">
              เมนูจัดการ
            </div>

            <div className="menu-grid">

              <button
                className="menu-btn btn-primary"
                onClick={() => {

                  if (!selectedDeviceId) {
                    alert("กรุณาเลือกอุปกรณ์ก่อน");
                    return;
                  }

                  navigate(`/realtime?deviceId=${selectedDeviceId}`);

                }}
              >

                <Activity size={20}/> ดูกราฟ Real-time

              </button>


              <button
                className="menu-btn btn-outline"
                onClick={() =>
                  navigate(
                    selectedDeviceId
                      ? `/water-quality?deviceId=${selectedDeviceId}`
                      : '/water-quality'
                  )
                }
              >

                <Search size={20}/> ประวัติย้อนหลัง

              </button>


              <button
                className="menu-btn btn-success"
                onClick={() => navigate('/add-device')}
              >

                <PlusCircle size={20}/> ลงทะเบียนเซนเซอร์เพิ่ม

              </button>


              <button
                className="menu-btn btn-outline"
                onClick={() => navigate('/shrimp-info')}
              >

                <Info size={20}/> คู่มือการดูแลน้ำ

              </button>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

};

export default Home;
