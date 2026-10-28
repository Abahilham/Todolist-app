import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const verifyAdminAccess = (data) => {
    if (data.user.role !== "admin") {
      alert("Akses Ditolak: Portal ini khusus untuk Administrator.");
      return;
    }
    // Jika benar admin, simpan token dan arahkan langsung ke Workspace Admin
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/admin");
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      verifyAdminAccess(res.data);
    } catch (err) {
      alert("Login Gagal: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="lock-icon">🔒</div>
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-subtitle">Restricted Access Area</p>
        </div>

        <form onSubmit={handleManualLogin} className="admin-login-form">
          <div className="input-group">
            <label>Administrator Email</label>
            <input
              type="email"
              placeholder="admin@aridevstudio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Secret Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-admin-login">
            Authenticate
          </button>
        </form>

        <div className="back-to-public">
          <a href="/login">← Kembali ke Portal Karyawan</a>
        </div>
      </div>
    </div>
  );
}
