const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const { verifyToken, isAdmin } = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", verifyToken, isAdmin, adminRoutes);
app.use("/api/user", userRoutes);

// Test endpoint
app.get("/", (req, res) => {
  res.status(200).send("API WFH Todo List Running...");
});

// Jalankan server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API WFH Todo List berjalan pada port ${PORT}`);
});

// Cek koneksi database MySQL
db.getConnection()
  .then((conn) => {
    console.log("Database MySQL todo_wfh_db berhasil terhubung!");
    conn.release();
  })
  .catch((err) => {
    console.error("Gagal koneksi database:", err.message);
  });
