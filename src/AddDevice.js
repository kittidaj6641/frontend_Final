import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, Cpu, MapPin, 
  AlertCircle, CheckCircle 
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
      alert('กรุณาเข้าสู่ระบบก่อนใช้งาน');
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ตรวจสอบข้อมูลก่อนส่ง
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
        setSuccess('บันทึกอุปกรณ์ใหม่สำเร็จ!');
        setFormData({ deviceName: '', deviceId: '', location: '' });
        
        // รอ 1.5 วินาทีแล้วนำทางกลับหน้าหลัก
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error:', error);
      let errorMsg = "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      
      if (error.response) {
        errorMsg = error.response.data?.error || error.response.data?.msg || `Server Error (${error.response.status})`;
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
    <div className="add-device-page">
      <motion.div 
        className="add-device-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* ส่วนหัวของฟอร์ม */}
        <header className="form-header-nav">
          <button onClick={() => navigate('/')} className="back-btn">
            <ArrowLeft size={20} /> ย้อนกลับ
          </button>
          <h2>ลงทะเบียนอุปกรณ์</h2>
        </header>

        <div className="form-card">
          <div className="card-icon-header">
            <div className="icon-circle">
              <Cpu size={32} color="white" />
            </div>
            <p className="form-subtitle">กรอกข้อมูลเพื่อเชื่อมต่ออุปกรณ์ IoT เข้าสู่ระบบ</p>
          </div>

          {/* ส่วนแสดงข้อความแจ้งเตือน (สำเร็จ / ผิดพลาด) */}
          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="alert-box success"
              >
                <CheckCircle size={20} /> {success}
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="alert-box error"
              >
                <AlertCircle size={20} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ฟอร์มกรอกข้อมูล */}
          <form onSubmit={handleSubmit} className="device-form">
            <div className="form-group">
              <label>
                ชื่ออุปกรณ์ (Device Name) <span className="required">*</span>
              </label>
              <input 
                type="text" 
                name="deviceName" 
                className="form-input"
                placeholder="เช่น บ่อกุ้ง A, เครื่องวัดหน้าฟาร์ม" 
                value={formData.deviceName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                รหัสอุปกรณ์ (Device ID) <span className="required">*</span>
              </label>
              <input 
                type="text" 
                name="deviceId" 
                className="form-input monospace-font"
                placeholder="เช่น ESP32_001" 
                value={formData.deviceId}
                onChange={handleChange}
                disabled={loading}
              />
              <small className="input-hint">
                ต้องตรงกับ ID ที่ระบุใน Code ของบอร์ด ESP32
              </small>
            </div>

            <div className="form-group">
              <label>สถานที่ติดตั้ง (Location)</label>
              <div className="input-with-icon">
                <MapPin size={18} className="field-icon" />
                <input 
                  type="text" 
                  name="location" 
                  className="form-input pl-10"
                  placeholder="เช่น โซนเหนือ, บ่ออนุบาล" 
                  value={formData.location}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="loader"></span>
              ) : (
                <>
                  <Save size={20} /> บันทึกข้อมูล
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default AddDevice;
