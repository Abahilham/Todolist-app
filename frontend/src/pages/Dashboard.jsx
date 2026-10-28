import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import TimeTracker from "../components/TimeTracker";
import CalendarView from "../components/CalendarView";
import "./Dashboard.css";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const [user, setUser] = useState(null);
  const trackerRef = useRef(null);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDueDate, setEditDueDate] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const [isDarkMode, setIsDarkMode] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const fetchTasks = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser || !savedUser.id) return;

    try {
      const res = await API.get(`/user/tasks/${savedUser.id}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Gagal mengambil data tugas:", err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        fetchTasks();
      } catch (err) {
        console.error("Gagal membaca data user:", err);
      }
    } else {
      navigate("/login");
    }

    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setIsDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, [navigate]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showToast("Password baru dan konfirmasi tidak cocok!", "error");
    }

    try {
      await API.put("/user/change-password", {
        userId: user?.id, // Menggunakan optional chaining agar aman tidak crash
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      showToast(
        "Sandi berhasil diubah! Silakan gunakan sandi baru untuk login selanjutnya.",
        "success",
      );
      setIsPasswordModalOpen(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal mengubah password",
        "error",
      );
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "completed"
          ? task.status === "completed"
          : task.status !== "completed";
    const matchPriority =
      filterPriority === "all" ? true : task.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const totalDurationSeconds = tasks.reduce(
    (acc, task) => acc + (Number(task.duration) || 0),
    0,
  );
  const highPriorityTasks = tasks.filter(
    (task) => (task.priority || "").toLowerCase() === "high",
  ).length;

  const formatTotalTime = (totalSeconds) => {
    if (!totalSeconds || totalSeconds === 0) return "0s";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}j ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return "00:00:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleExportExcel = () => {
    if (filteredTasks.length === 0)
      return showToast("Tidak ada data tugas untuk diexport!", "error");

    const headers = [
      "Judul Tugas",
      "Deskripsi",
      "Prioritas",
      "Total Waktu Kerja",
      "Tenggat Waktu",
      "Status",
    ];
    const csvData = filteredTasks.map((task) => {
      const judul = `"${task.title}"`;
      const deskripsi = `"${task.description || "-"}"`;
      const prioritas = task.priority ? task.priority.toUpperCase() : "MEDIUM";
      const waktu = formatDuration(task.duration);
      const tanggal = task.due_date ? task.due_date.substring(0, 10) : "-";
      const status = task.status === "completed" ? "Selesai" : "Belum Selesai";
      return [judul, deskripsi, prioritas, waktu, tanggal, status].join(";");
    });

    const csvString = [headers.join(";"), ...csvData].join("\n");
    const blob = new Blob(["\uFEFF" + csvString], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const dateToday = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Laporan_WFH_${dateToday}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Laporan berhasil diunduh!", "success");
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title) return showToast("Judul tugas wajib diisi!", "error");

    const currentDuration = trackerRef.current
      ? trackerRef.current.getSeconds()
      : 0;
    try {
      await API.post("/tasks", {
        title,
        description,
        priority,
        duration: currentDuration,
        due_date: dueDate || null,
        status: "pending",
        user_id: user.id,
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      if (trackerRef.current) trackerRef.current.resetTimer();
      fetchTasks();
      showToast("Tugas berhasil disimpan!", "success");
    } catch (err) {
      showToast(
        "Gagal menambah tugas: " + (err.response?.data?.message || err.message),
        "error",
      );
    }
  };

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const currentTrackedTime = trackerRef.current
      ? trackerRef.current.getSeconds()
      : 0;
    const newDuration = Number(task.duration || 0) + currentTrackedTime;

    try {
      await API.put(`/user/tasks/${task.id}/status`, {
        status: newStatus,
        duration: newDuration,
      });
      if (trackerRef.current) trackerRef.current.resetTimer();
      fetchTasks();
      if (newStatus === "completed") {
        showToast("Tugas diselesaikan! Waktu kerja terekam. 🎉", "success");
      }
    } catch (err) {
      showToast(
        "Gagal mengubah status: " +
          (err.response?.data?.message || err.message),
        "error",
      );
    }
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority || "medium");
    setEditDueDate(task.due_date ? task.due_date.substring(0, 10) : "");
  };

  const handleUpdateTask = async (id) => {
    if (!editTitle)
      return showToast("Judul tugas tidak boleh kosong!", "error");
    const existingTask = tasks.find((t) => t.id === id);
    try {
      await API.put(`/tasks/${id}`, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        due_date: editDueDate || null,
        duration: existingTask.duration,
        status: existingTask.status,
      });
      setEditingTaskId(null);
      fetchTasks();
      showToast("Tugas berhasil diperbarui!", "success");
    } catch (err) {
      showToast(
        "Gagal memperbarui: " + (err.response?.data?.message || err.message),
        "error",
      );
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
      try {
        await API.delete(`/tasks/${id}`);
        fetchTasks();
        showToast("Tugas berhasil dihapus!", "success");
      } catch (err) {
        showToast("Gagal menghapus tugas", "error");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.body.classList.remove("dark-mode");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard-Aridev</h1>
        <div className="user-profile-section">
          {user && (
            <div className="user-info">
              {user.avatar ? (
                <>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="user-avatar"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextElementSibling) {
                        e.target.nextElementSibling.style.display = "flex";
                      }
                    }}
                  />
                  <div
                    className="user-avatar-placeholder"
                    style={{ display: "none" }}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                </>
              ) : (
                <div className="user-avatar-placeholder">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="user-details">
                <div className="user-name">{user.name || "Pengguna"}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          )}

          <button
            onClick={handleToggleDarkMode}
            className="btn-dark-mode"
            title="Ganti Tema"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="btn-action btn-save"
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            🔐 Ganti Sandi
          </button>

          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-icon task-icon">📋</div>
          <div className="analytics-info">
            <span className="analytics-label">Total Tugas</span>
            <h3 className="analytics-value">{totalTasks}</h3>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-icon completed-icon">✅</div>
          <div className="analytics-info">
            <span className="analytics-label">Tugas Selesai</span>
            <h3 className="analytics-value">{completedTasksCount}</h3>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-icon time-icon">⏱️</div>
          <div className="analytics-info">
            <span className="analytics-label">Total Waktu Kerja</span>
            <h3 className="analytics-value">
              {formatTotalTime(totalDurationSeconds)}
            </h3>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-icon priority-icon">🔥</div>
          <div className="analytics-info">
            <span className="analytics-label">Prioritas Tinggi</span>
            <h3 className="analytics-value">{highPriorityTasks}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div className="card">
            <h3 className="card-title">Tambah Tugas Baru</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Judul Tugas</label>
                <input
                  type="text"
                  placeholder="Masukkan judul..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea
                  placeholder="Deskripsi singkat..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                  rows="3"
                  style={{ resize: "vertical" }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Prioritas</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="form-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tenggat Waktu</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-submit">
                Simpan Tugas
              </button>
            </form>
          </div>
          <div className="card">
            <TimeTracker ref={trackerRef} />
          </div>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div className="card">
            <h3 className="card-title">Daftar Tugas Saya</h3>
            <div className="filter-bar">
              <input
                type="text"
                placeholder="🔍 Cari judul tugas..."
                className="form-input search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="form-select filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Belum Selesai</option>
                <option value="completed">Sudah Selesai</option>
              </select>
              <select
                className="form-select filter-select"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">Semua Prioritas</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button
                type="button"
                onClick={handleExportExcel}
                className="btn-export"
              >
                📄 Export Laporan
              </button>
            </div>

            {filteredTasks.length === 0 ? (
              <p className="empty-task">Tidak ada tugas yang sesuai.</p>
            ) : (
              <ul className="task-list">
                {filteredTasks.map((task) => {
                  const isCompleted =
                    task.status === "completed" || task.status === "Completed";
                  return (
                    <li
                      key={task.id}
                      className={`task-item ${isCompleted ? "completed" : ""}`}
                    >
                      {editingTaskId === task.id ? (
                        <div className="edit-task-box">
                          <input
                            type="text"
                            className="form-input"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Judul Baru"
                          />
                          <textarea
                            className="form-input"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Deskripsi Baru"
                            rows="2"
                          />
                          <select
                            className="form-select"
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value)}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          <input
                            type="date"
                            className="form-input"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                          />
                          <div className="action-buttons">
                            <button
                              onClick={() => handleUpdateTask(task.id)}
                              className="btn-action btn-save"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingTaskId(null)}
                              className="btn-action btn-cancel"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="task-header-row">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => handleToggleComplete(task)}
                              className="task-checkbox"
                              title="Tandai Selesai"
                            />
                            <div className="task-info">
                              <h4
                                className={
                                  isCompleted ? "task-completed-text" : ""
                                }
                              >
                                {task.title}
                              </h4>
                              <p>{task.description || "Tidak ada deskripsi"}</p>
                              <div className="task-meta">
                                {isCompleted ? (
                                  <span className="badge badge-completed">
                                    ✓ Selesai
                                  </span>
                                ) : (
                                  <span
                                    className={`badge badge-${(task.priority || "medium").toLowerCase()}`}
                                  >
                                    {task.priority || "medium"}
                                  </span>
                                )}
                                <span className="duration-badge">
                                  ⏱️ {formatDuration(task.duration)}
                                </span>
                                {task.due_date && (
                                  <span className="date-badge">
                                    📅 {task.due_date.substring(0, 10)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="task-actions">
                            <button
                              onClick={() => handleStartEdit(task)}
                              className="btn-icon btn-edit"
                              title="Edit Tugas"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="btn-icon btn-delete"
                              title="Hapus Tugas"
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <CalendarView tasks={filteredTasks} />
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Ganti Kata Sandi</h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsPasswordModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={handleChangePassword}
              className="modal-form"
              style={{ marginTop: "1rem" }}
            >
              <div className="form-group">
                <label className="form-label">Sandi Lama</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sandi Baru</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Konfirmasi Sandi Baru</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div
                className="modal-actions"
                style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}
              >
                <button
                  type="button"
                  className="btn-action btn-cancel"
                  style={{ flex: 1 }}
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-action btn-save"
                  style={{ flex: 1 }}
                >
                  Simpan Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`custom-toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" ? "✅" : "⚠️"}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
