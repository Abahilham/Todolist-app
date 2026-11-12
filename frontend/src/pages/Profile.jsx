import React, { useState, useEffect } from "react";
import API from "../api";
import "./Profile.css"; // Mengimpor CSS eksternal

export default function Profile() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.name) {
      setName(userData.name);
    }
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await API.put("/user/profile", { name });

      const userData = JSON.parse(localStorage.getItem("user"));
      userData.name = name;
      localStorage.setItem("user", JSON.stringify(userData));

      setMessage("✅ " + res.data.message);
    } catch (err) {
      setMessage(
        "❌ Gagal memperbarui nama: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  return (
    <div className="profile-container">
      <h2>Pengaturan Profil</h2>

      {message && <p className="alert-message">{message}</p>}

      <form onSubmit={handleUpdateName}>
        <div className="form-group">
          <label>Nama Lengkap:</label>
          <input
            type="text"
            className="profile-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama baru (misal: Alex)"
            required
          />
        </div>

        <button type="submit" className="btn-save-profile">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
