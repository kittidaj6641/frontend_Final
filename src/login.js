import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import config from "./config";
import "./login.css";

const HERO_URL = "/background/19.jpg"; // ภาพฝั่งขวา

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${config.API_BASE_URL}/member/login`, {
        email,
        password,
      });
      if (res.status === 200) {
        setMessage("เข้าสู่ระบบสำเร็จ");
        localStorage.setItem("token", res.data.token);
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (err) {
      setMessage(err.response?.data?.msg || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="auth-wrapper">
      {/* Left panel: branding + form */}
      <section className="auth-left">
        <div className="brand">
          {/* logo เล็ก ๆ (ใส่ไฟล์โลโก้ได้ตามต้องการ) */}
          {/* <img src="/logo-shrimp.svg" alt="logo" className="brand-logo" /> */}
          <h1 className="brand-title">
              SANBOON FARM
            <img
              src="https://cdn-icons-png.flaticon.com/512/2619/2619560.png"
              alt="shrimp icon"
              className="brand-icon"
            />
          </h1>
        </div>

        <div className="form-card" role="region" aria-label="เข้าสู่ระบบ">
          <h3 className="form-title">เข้าสู่ระบบ</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <label className="form-label">
              EMAIL
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                autoComplete="username"
              />
            </label>

            <label className="form-label">
              PASSWORD
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                autoComplete="current-password"
              />
            </label>

            <Link to="/forgot-password" className="forgot-password-link">
              
            </Link>

            <button type="submit" className="btn-primary">
              เข้าสู่ระบบ
            </button>
          </form>

          {message && (
            <p className={`msg ${message.includes("สำเร็จ") ? "ok" : "err"}`}>
              {message}
            </p>
          )}

          <p className="alt-link">
            ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
          </p>
        </div>
      </section>

      {/* Right hero image */}
      <aside
        className="auth-hero"
        aria-hidden="true"
        style={{ backgroundImage: `url('${HERO_URL}')` }}
      />
    </motion.div>
  );
};

export default Login;
