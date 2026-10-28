import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./Login.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", { name, email, password });
      alert(res.data.message || "Registrasi berhasil!");
      navigate("/login");
    } catch (err) {
      alert(
        "Gagal registrasi: " + (err.response?.data?.message || err.message),
      );
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glass-card">
        <div className="login-header">
          <h1 className="login-title">Register Akun Baru</h1>
          <p className="login-subtitle">Bergabunglah dengan tim kreatif kami</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          <div className="input-group">
            <label>Nama Lengkap</label>
            <input
              type="text"
              placeholder="Nama Karyawan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="karyawan@aridevstudio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login-primary">
            Sign Up
          </button>
        </form>

        <p className="login-footer">
          Sudah punya akun? <a href="/login">Login di sini</a>
        </p>
      </div>
    </div>
  );
}
