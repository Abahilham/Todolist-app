import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);

  // State untuk menyimpan data dari database
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Pop-up Tambah User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // State untuk Pop-up Tambah Tugas
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    user_id: "",
    status: "pending",
    priority: "medium",
    due_date: "",
    duration: 0,
  });

  useEffect(() => {
    // 1. Cek apakah user sudah login dan berstatus admin
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      navigate("/admin-login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      alert("Akses Ditolak! Halaman ini khusus Admin.");
      navigate("/dashboard");
      return;
    }

    setAdminData(parsedUser);

    // 2. Ambil data asli dari backend saat halaman dimuat
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const usersResponse = await API.get("/admin/users");
      const tasksResponse = await API.get("/admin/tasks/all");

      setUsers(usersResponse.data);
      setTasks(tasksResponse.data);
    } catch (error) {
      console.warn(
        "Backend endpoint belum siap, menggunakan data aman sementara.",
      );
      setUsers([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin-login");
  };

  // Fungsi menyetujui akun karyawan baru (BARU)
  const handleApproveUser = async (id, name) => {
    if (
      window.confirm(`Setujui pendaftaran akun karyawan atas nama ${name}?`)
    ) {
      try {
        await API.put(`/admin/users/${id}/approve`);
        alert(`Akun ${name} berhasil disetujui!`);
        fetchDashboardData();
      } catch (error) {
        alert(
          "Gagal menyetujui akun: " +
            (error.response?.data?.message || error.message),
        );
      }
    }
  };

  // Fungsi menghapus user
  const handleDeleteUser = async (id, name) => {
    if (
      window.confirm(
        `Yakin ingin menghapus karyawan bernama ${name}? Tindakan ini tidak bisa dibatalkan.`,
      )
    ) {
      try {
        await API.delete(`/admin/users/${id}`);
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        alert(
          "Gagal menghapus user: " +
            (error.response?.data?.message || error.message),
        );
      }
    }
  };

  // Fungsi mengubah role (Admin <-> User)
  const handleEditRole = async (id, currentRole, name) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (
      window.confirm(`Ubah hak akses ${name} menjadi ${newRole.toUpperCase()}?`)
    ) {
      try {
        await API.put(`/admin/users/${id}/role`, { role: newRole });
        setUsers(
          users.map((user) =>
            user.id === id ? { ...user, role: newRole } : user,
          ),
        );
      } catch (error) {
        alert(
          "Gagal mengubah role: " +
            (error.response?.data?.message || error.message),
        );
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/users", newUserData);
      alert("Karyawan baru berhasil ditambahkan!");
      setIsModalOpen(false);
      setNewUserData({ name: "", email: "", password: "", role: "user" });
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menambahkan karyawan");
    }
  };

  // Fungsi menambah Tugas
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/tasks", newTaskData);
      alert("Tugas baru berhasil ditugaskan!");
      setIsTaskModalOpen(false);
      setNewTaskData({
        title: "",
        user_id: "",
        status: "pending",
        priority: "medium",
        due_date: "",
        duration: 0,
      });
      fetchDashboardData();
    } catch (error) {
      alert(
        "Gagal menambahkan tugas: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  if (loading) {
    return (
      <div style={{ color: "white", padding: "2rem", textAlign: "center" }}>
        Memuat Data Workspace...
      </div>
    );
  }

  // Kalkulasi statistik secara dinamis
  const totalKaryawan = users.filter((u) => u.role === "user").length;
  const totalTugas = tasks.length;
  const tugasPending = tasks.filter(
    (t) => (t.status || "pending").toLowerCase() === "pending",
  ).length;

  return (
    <div className="admin-dashboard-container">
      {/* Header Panel */}
      <header className="admin-header">
        <div className="header-left">
          <h1 className="admin-title">Admin Workspace</h1>
          <span className="badge-rbac">RBAC CONTROL PANEL</span>
        </div>
        <div className="header-right">
          <div className="admin-profile">
            <div className="admin-avatar">
              {adminData?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="admin-info">
              <span className="admin-name">
                {adminData?.name || "Administrator"}
              </span>
              <span className="admin-email">{adminData?.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* Statistik Cards */}
      <section className="stats-container">
        <div className="stat-card">
          <div className="stat-icon users-icon">👥</div>
          <div className="stat-details">
            <span className="stat-label">TOTAL KARYAWAN</span>
            <span className="stat-value">{totalKaryawan}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tasks-icon">📋</div>
          <div className="stat-details">
            <span className="stat-label">TOTAL TUGAS TIM</span>
            <span className="stat-value">{totalTugas}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending-icon">⏳</div>
          <div className="stat-details">
            <span className="stat-label">TUGAS PENDING</span>
            <span className="stat-value">{tugasPending}</span>
          </div>
        </div>
      </section>

      {/* Tabel Data */}
      <section className="data-tables-container">
        {/* Tabel Manajemen Tim */}
        <div className="data-box">
          <div className="box-header">
            <h2>Manajemen Tim (Users)</h2>
            <button
              className="btn-add-user"
              onClick={() => setIsModalOpen(true)}
            >
              + Tambah User
            </button>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>NAMA</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS AKUN</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => {
                    const isApproved =
                      user.is_approved === 1 || user.is_approved === true;
                    return (
                      <tr key={user.id}>
                        <td className="fw-bold">{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {isApproved ? (
                            <span
                              style={{ color: "#10b981", fontWeight: "bold" }}
                            >
                              ✓ Aktif
                            </span>
                          ) : (
                            <span
                              style={{ color: "#f59e0b", fontWeight: "bold" }}
                            >
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td>
                          {!isApproved && (
                            <button
                              className="btn-action approve"
                              title="Setujui Akun"
                              onClick={() =>
                                handleApproveUser(user.id, user.name)
                              }
                              style={{
                                backgroundColor: "#10b981",
                                color: "#fff",
                                marginRight: "5px",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              ✅ Setujui
                            </button>
                          )}
                          <button
                            className="btn-action edit"
                            title="Ubah Hak Akses"
                            onClick={() =>
                              handleEditRole(user.id, user.role, user.name)
                            }
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-action delete"
                            title="Hapus Karyawan"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      Belum ada data user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Pantauan Tugas */}
        <div className="data-box">
          <div className="box-header">
            <h2>Pantauan Tugas (All Tasks)</h2>
            <button
              className="btn-add-user"
              onClick={() => setIsTaskModalOpen(true)}
            >
              + Tambah Tugas
            </button>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>TUGAS</th>
                  <th>DITUGASKAN KE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length > 0 ? (
                  tasks.map((task) => {
                    const statusSafe = (task.status || "pending").toLowerCase();
                    return (
                      <tr key={task.id}>
                        <td className="fw-bold">{task.title}</td>
                        <td>{task.assigned_to_name || "Belum Ditugaskan"}</td>
                        <td>
                          <span className={`status-badge ${statusSafe}`}>
                            {task.status || "pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center" }}>
                      Belum ada data tugas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* KOTAK MODAL POP-UP TAMBAH USER */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Tambah Karyawan Baru</h3>
              <button
                className="btn-close-modal"
                onClick={() => setIsModalOpen(false)}
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleAddUser} className="modal-form">
              <div className="input-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="input-group">
                <label>Email Resmi</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="input-group">
                <label>Sandi Sementara</label>
                <input
                  type="text"
                  value={newUserData.password}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="input-group">
                <label>Hak Akses (Role)</label>
                <select
                  value={newUserData.role}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, role: e.target.value })
                  }
                >
                  <option value="user">User (Karyawan)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-save">
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KOTAK MODAL POP-UP TAMBAH TUGAS */}
      {isTaskModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Tambah Tugas Baru</h3>
              <button
                className="btn-close-modal"
                onClick={() => setIsTaskModalOpen(false)}
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleAddTask} className="modal-form">
              <div className="input-group">
                <label>Nama Tugas / Instruksi</label>
                <input
                  type="text"
                  value={newTaskData.title}
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, title: e.target.value })
                  }
                  required
                  placeholder="Tuliskan instruksi tugas..."
                />
              </div>

              <div className="input-group">
                <label>Prioritas</label>
                <select
                  value={newTaskData.priority}
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, priority: e.target.value })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="input-group">
                <label>Tenggat Waktu</label>
                <input
                  type="date"
                  value={newTaskData.due_date}
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, due_date: e.target.value })
                  }
                />
              </div>

              <div className="input-group">
                <label>Tugaskan Kepada (Assign To)</label>
                <select
                  value={newTaskData.user_id}
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, user_id: e.target.value })
                  }
                  required
                >
                  <option value="">-- Pilih Karyawan --</option>
                  {users
                    .filter((u) => u.role === "user")
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="input-group">
                <label>Status Awal</label>
                <select
                  value={newTaskData.status}
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, status: e.target.value })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsTaskModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-save">
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
