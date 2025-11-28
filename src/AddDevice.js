import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Save, HardDrive, AlertCircle, CheckCircle } from 'lucide-react';
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token check:', token ? 'Found' : 'Not found');
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
    console.log('🚀 Form submitted');
    
    // Validation
    if (!formData.deviceName.trim() || !formData.deviceId.trim()) {
      const msg = 'กรุณากรอกชื่อและรหัสอุปกรณ์';
      setError(msg);
      console.error('❌ Validation failed:', msg);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Session หมดอายุ กรุณาล็อกอินใหม่');
      navigate('/login');
      return;
    }

    const apiUrl = `${config.API_BASE_URL}/member/devices/add`;
    
    console.log('📤 API Request:');
    console.log('   URL:', apiUrl);
    console.log('   Data:', {
      deviceName: formData.deviceName.trim(),
      deviceId: formData.deviceId.trim(),
      location: formData.location.trim()
    });
    console.log('   Token (first 30 chars):', token.substring(0, 30) + '...');

    try {
      const response = await axios.post(
        apiUrl, 
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

      console.log('✅ Response received:');
      console.log('   Status:', response.status);
      console.log('   Data:', response.data);

      if (response.status === 201 || response.status === 200) {
        const successMsg = response.data.msg || response.data.message || 'เพิ่มอุปกรณ์สำเร็จ!';
        setSuccess(successMsg);
        console.log('✅ Success:', successMsg);
        
        // ล้างฟอร์ม
        setFormData({
          deviceName: '',
          deviceId: '',
          location: ''
        });
        
        // แสดง success message 2 วินาที แล้วกลับหน้าหลัก
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Error occurred:');
      console.error('   Full error:', error);
      
      let errorMsg = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      
      if (error.response) {
        // Server ตอบกลับมาแต่เป็น error
        console.error('   Response status:', error.response.status);
        console.error('   Response data:', error.response.data);
        console.error('   Response headers:', error.response.headers);
        
        errorMsg = error.response.data?.error || 
                   error.response.data?.msg || 
                   error.response.data?.message ||
                   `Server Error (${error.response.status})`;
        
        if (error.response.status === 401 || error.response.status === 403) {
          errorMsg = 'Token หมดอายุหรือไม่ถูกต้อง - กรุณาล็อกอินใหม่';
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.response.status === 400) {
          // Bad request - แสดง error ที่ได้จาก server
          errorMsg = error.response.data?.error || error.response.data?.msg || 'ข้อมูลไม่ถูกต้อง';
        } else if (error.response.status === 404) {
          errorMsg = 'ไม่พบ API Endpoint - ตรวจสอบ URL';
        } else if (error.response.status === 500) {
          errorMsg = 'เซิร์ฟเวอร์เกิดข้อผิดพลาด - ' + (error.response.data?.details || 'กรุณาลองใหม่อีกครั้ง');
        }
        
      } else if (error.request) {
        // ส่ง request ไปแล้วแต่ไม่ได้รับ response
        console.error('   Request sent but no response');
        console.error('   Request:', error.request);
        errorMsg = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ - ตรวจสอบว่า Backend กำลังรันอยู่";
      } else {
        // Error อื่นๆ ในการสร้าง request
        console.error('   Error message:', error.message);
        errorMsg = `Error: ${error.message}`;
      }
      
      setError(errorMsg);
      console.error('   Final error message:', errorMsg);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="add-device-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <button onClick={() => navigate('/')} className="back-home-btn">
        <Home size={16} /> กลับหน้าหลัก
      </button>

      <div className="form-card">
        <div className="form-header">
          <div className="icon-bg">
            <HardDrive size={32} color="#007bff" />
          </div>
          <h1>ลงทะเบียนอุปกรณ์</h1>
          <p>เพิ่มอุปกรณ์ใหม่ลงในระบบฐานข้อมูล</p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '15px',
            marginBottom: '15px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            color: '#155724',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle size={20} />
            <strong>{success}</strong>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '15px',
            marginBottom: '15px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={20} />
            <div>
              <strong>เกิดข้อผิดพลาด</strong>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ชื่ออุปกรณ์ (Device Name) *</label>
            <input 
              type="text" 
              name="deviceName" 
              placeholder="เช่น บ่อกุ้งโซน A" 
              value={formData.deviceName}
              onChange={handleChange}
              disabled={loading}
              required 
            />
          </div>

          <div className="form-group">
            <label>รหัสอุปกรณ์ (Device ID) *</label>
            <div className="input-with-hint">
              <input 
                type="text" 
                name="deviceId" 
                placeholder="เช่น ESP32_001" 
                value={formData.deviceId}
                onChange={handleChange}
                disabled={loading}
                required 
              />
              <small className="hint">* ห้ามซ้ำกับที่มีอยู่ในระบบ</small>
            </div>
          </div>

          <div className="form-group">
            <label>สถานที่ติดตั้ง</label>
            <input 
              type="text" 
              name="location" 
              placeholder="ระบุพิกัด หรือ ชื่อฟาร์ม" 
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>⏳ กำลังบันทึก...</>
            ) : (
              <>
                <Save size={18} /> บันทึกข้อมูล
              </>
            )}
          </button>
        </form>

        {/* Debug Info */}
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#6c757d'
        }}>
          <strong>🔧 Debug Info:</strong><br/>
          API URL: {config.API_BASE_URL}/member/devices/add<br/>
          Token: {localStorage.getItem('token') ? '✅ พบ' : '❌ ไม่พบ'}
        </div>
      </div>
    </motion.div>
  );
}

export default AddDevice;
