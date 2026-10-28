import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register"; // Impor halaman Register
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import "./App.css"; // Impor CSS global untuk aplikasi

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Halaman Login */}
        <Route path="/login" element={<Login />} />

        {/* Rute Halaman Admin Login */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Rute Halaman Register */}
        <Route path="/register" element={<Register />} />

        {/* Rute Halaman Dashboard Utama / Kanban & Todo */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Rute Halaman Admin Workspace (RBAC) */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Mengarahkan root (/) otomatis ke halaman /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
