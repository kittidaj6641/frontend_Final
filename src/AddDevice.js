import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, PlusCircle, MapPin, 
  AlertTriangle, CheckCircle 
} from 'lucide-react';
import axios from 'axios';
import config from './config';
import './AddDevice.css';

function AddDevice() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceId: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ตรวจสอบการเข้าสู่ระบบ
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.deviceName.trim() || !formData.deviceId.trim()) {
      setError('กรุณากรอกชื่อและรหัสอุปกรณ์ให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/member/devices/add`, 
        {
          deviceName: formData.deviceName.trim(),
          deviceId: formData.deviceId.trim(),
          location: formData.location.trim() || ''
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (response.status === 201 || response.status === 200) {
        setSuccess('เพิ่มอุปกรณ์เข้าสู่บัญชีของคุณเรียบร้อยแล้ว');
        setFormData({ deviceName: '', deviceId: '', location: '' });
        
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error:', error);
      let errorMsg = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
      
      if (error.response) {
        errorMsg = error.response.data?.msg || error.response.data?.error || `Server Error (${error.response.status})`;
        if (error.response.status === 401) {
          errorMsg = 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่';
          setTimeout(() => navigate('/login'), 2000);
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="add-device-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ── Header ── */}
      <header className="ad-header">
        <button className="ad-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
        </button>
        <div className="ad-header-title">ลงทะเบียนเซนเซอร์</div>
        <div style={{ width: 40 }}></div> {/* สร้างสมดุลให้ปุ่มย้อนกลับ */}
      </header>

      {/* ── Main Body ── */}
      <main className="ad-main">
        <motion.div 
          className="ad-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="ad-card-header">
            <div className="ad-icon-wrapper">
              <PlusCircle size={28} />
            </div>
            <div className="ad-card-text">
              <h2>เพิ่มบ่อใหม่</h2>
              <p>กรอกข้อมูลเพื่อเชื่อมต่อเซนเซอร์เข้าสู่ระบบของคุณ</p>
            </div>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }} 
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="ad-alert success"
              >
                <CheckCircle size={18} /> {success}
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }} 
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="ad-alert error"
              >
                <AlertTriangle size={18} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="ad-form">
            
            <div className="ad-input-group">
              <label>ชื่อเรียกอุปกรณ์ <span className="ad-required">*</span></label>
              <input 
                type="text" 
                name="deviceName" 
                className="ad-input"
                placeholder="เช่น บ่ออนุบาลกุ้ง, บ่อโซน A" 
                value={formData.deviceName}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <div className="ad-input-group">
              <label>รหัสอุปกรณ์ (Device ID) <span className="ad-required">*</span></label>
              <input 
                type="text" 
                name="deviceId" 
                className="ad-input font-mono"
                placeholder="เช่น ESP32_001" 
                value={formData.deviceId}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
              />
              <small className="ad-hint">กรอกรหัสที่ระบุอยู่บนกล่องเซนเซอร์หรือในคู่มือ</small>
            </div>

            <div className="ad-input-group">
              <label>สถานที่ติดตั้ง (เผื่อไว้ระบุโซน)</label>
              <div className="ad-input-with-icon">
                <MapPin size={18} className="ad-input-icon" />
                <input 
                  type="text" 
                  name="location" 
                  className="ad-input with-icon"
                  placeholder="เช่น ฟาร์มท้ายหมู่บ้าน" 
                  value={formData.location}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
            </div>

            <button type="submit" className="ad-submit-btn" disabled={loading}>
              {loading ? (
                <span className="ad-loader">กำลังบันทึกข้อมูล...</span>
              ) : (
                <>
                  <Save size={20} /> บันทึกและเชื่อมต่อ
                </>
              )}
            </button>
            
          </form>
        </motion.div>
      </main>
    </motion.div>
  );
}

export default AddDevice;
