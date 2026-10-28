const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

// Import middleware yang dibuat kemarin malam
const { verifyToken } = require("../middleware/authMiddleware");

// 1. Endpoint untuk mengambil tugas khusus milik karyawan yang sedang login
router.get("/tasks/:userId", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const [tasks] = await db.query("SELECT * FROM tasks WHERE user_id = ?", [
      userId,
    ]);
    res.json(tasks);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil tugas", error: err.message });
  }
});

// 2. Endpoint untuk mengubah status dan menyimpan waktu kerja
router.put("/tasks/:taskId/status", verifyToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { status, duration } = req.body;

    await db.query("UPDATE tasks SET status = ?, duration = ? WHERE id = ?", [
      status,
      duration,
      taskId,
    ]);
    res.json({ message: `Status dan waktu berhasil diperbarui` });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal memperbarui status", error: err.message });
  }
});

// 3. Endpoint untuk Ganti Password Karyawan (AMAN DENGAN GEMBOK JWT)
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    // req.user.id didapat secara otomatis & aman dari verifyToken
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // 1. Ambil password lama dari database
    const [users] = await db.query("SELECT password FROM users WHERE id = ?", [
      userId,
    ]);
    if (users.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    // 2. Cocokkan password lama
    const validPassword = await bcrypt.compare(oldPassword, users[0].password);
    if (!validPassword)
      return res.status(400).json({ message: "Password lama salah!" });

    // 3. Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Simpan password baru ke database
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Password berhasil diperbarui!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengubah password", error: err.message });
  }
});

module.exports = router;
