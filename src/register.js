import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import config from "./config";
import "./register.css"; // มีสไตล์เหมือนหน้า Login (ดูด้านล่าง)

const HERO_URL = "/background/19.jpg";

const Register = () => {
  // === LOGIC เดิมคงไว้ ===
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/register/register`,
        { name, email, password }
      );
      if (response.status === 201) {
        setMessage("สมัครสมาชิกสำเร็จ");
        setTimeout(() => navigate("/login"), 1000);
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorMsg = error.response.data?.msg || "เกิดข้อผิดพลาดในการสมัคร";
        if (status === 409) setMessage("อีเมล์นี้ถูกใช้ไปแล้ว");
        else setMessage(errorMsg);
      } else if (error.request) {
        setMessage(
          "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ"
        );
      } else {
        setMessage("เกิดข้อผิดพลาดในการสมัคร: " + error.message);
      }
      console.error("Error during registration:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="auth-wrapper">
      {/* Left: Branding + Card */}
      <section className="auth-left">
        <div className="brand">
          <h1 className="brand-title">
            SANBOON FARM
            <img
              src="https://cdn-icons-png.flaticon.com/512/2619/2619560.png"
              alt="shrimp icon"
              className="brand-icon"
            />
          </h1>
        </div>

        <div className="form-card" role="region" aria-label="สมัครสมาชิก">
          <h3 className="form-title">สมัครสมาชิก</h3>

          <form onSubmit={handleSubmit} className="form-grid">
            <label className="form-label">
              ชื่อ
              <input
                type="text"
                className="form-input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>

            <label className="form-label">
              อีเมล์
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label className="form-label">
              รหัสผ่าน
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>

            <button type="submit" className="btn-primary">
              สมัครสมาชิก
            </button>
          </form>

          {message && (
            <p className={`msg ${message.includes("สำเร็จ") ? "ok" : "err"}`}>
              {message}
            </p>
          )}

          <p className="alt-link">
            มีบัญชีแล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </section>

      {/* Right: Hero image */}
      <aside
        className="auth-hero"
        aria-hidden="true"
        style={{ backgroundImage: `url('${HERO_URL}')` }}
      />
    </motion.div>
  );
};

export default Register;
