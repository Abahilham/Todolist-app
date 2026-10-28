const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Pastikan path ke file koneksi database MySQL-mu sudah benar
const bcrypt = require("bcrypt"); // Wajib untuk mengenkripsi sandi baru

// 1. Endpoint untuk mengambil semua user (Termasuk kolom is_approved)
router.get("/users", async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role, is_approved FROM users",
    );
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data user", error: err.message });
  }
});

// 2. Endpoint untuk mengambil semua tugas tim (Join ke tabel users)
router.get("/tasks/all", async (req, res) => {
  try {
    const [tasks] = await db.query(`
      SELECT tasks.*, users.name AS assigned_to_name 
      FROM tasks 
      LEFT JOIN users ON tasks.user_id = users.id
    `);
    res.json(tasks);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data tugas", error: err.message });
  }
});

// 3. Endpoint untuk menghapus user
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await db.query("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal menghapus user", error: err.message });
  }
});

// 4. Endpoint untuk mengubah role user (Edit)
router.put("/users/:id/role", async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body; // Menerima role baru ('admin' atau 'user')
    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    res.json({ message: "Role berhasil diperbarui" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengubah role", error: err.message });
  }
});

// 5. BARU: Endpoint untuk menyetujui pendaftaran akun karyawan (Approval Admin)
router.put("/users/:id/approve", async (req, res) => {
  try {
    const userId = req.params.id;
    await db.query("UPDATE users SET is_approved = 1 WHERE id = ?", [userId]);
    res.json({ message: "Akun karyawan berhasil disetujui!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal menyetujui akun", error: err.message });
  }
});

// 6. Endpoint untuk menambah user baru oleh Admin (Otomatis is_approved = 1)
router.post("/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Cek apakah email sudah terdaftar
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "Pendaftaran gagal: Email sudah digunakan!" });
    }

    // Enkripsi sandi sementara agar aman di database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan data karyawan baru (otomatis disetujui karena dibuat langsung oleh Admin)
    await db.query(
      "INSERT INTO users (name, email, password, role, is_approved) VALUES (?, ?, ?, ?, 1)",
      [name, email, hashedPassword, role || "user"],
    );

    res.status(201).json({ message: "User berhasil ditambahkan" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal menambah user", error: err.message });
  }
});

// 7. Endpoint untuk menambah tugas baru dan menugaskannya (Assign)
router.post("/tasks", async (req, res) => {
  try {
    const { title, user_id, status, priority, due_date } = req.body;

    await db.query(
      "INSERT INTO tasks (title, user_id, status, priority, due_date) VALUES (?, ?, ?, ?, ?)",
      [
        title,
        user_id,
        status || "Pending",
        priority || "medium",
        due_date || null,
      ],
    );

    res.status(201).json({ message: "Tugas berhasil ditambahkan" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal menambah tugas", error: err.message });
  }
});

// WAJIB: Ekspor router diletakkan di paling bawah agar semua rute di atas terbaca
module.exports = router;
