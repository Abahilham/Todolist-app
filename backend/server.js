const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const { verifyToken, isAdmin } = require("./middleware/authMiddleware");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Routes API
// Rute Auth (Login/Register) DIBIARKAN TERBUKA agar orang bisa login
app.use("/api/auth", authRoutes);

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes); // Endpoint Tugas, Kanban, Timer & Analytics
app.use("/api/admin", verifyToken, isAdmin, adminRoutes); // Endpoint Admin Workspace (RBAC)
app.use("/api/user", userRoutes);

// Test Endpoint
app.get("/", (req, res) => {
  res.send("API WFH Todo List Running...");
});

// Cek Koneksi DB
db.getConnection()
  .then((conn) => {
    console.log("Database MySQL todo_wfh_db berhasil terhubung!");
    conn.release();
  })
  .catch((err) => console.error("Gagal koneksi:", err.message));

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
