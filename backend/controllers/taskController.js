const db = require("../config/db");

// 1. Ambil daftar tugas berdasarkan user yang sedang login
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id; // Didapat dari middleware JWT
    const [rows] = await db.query("SELECT * FROM tasks WHERE user_id = ?", [
      userId,
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil tugas: " + err.message });
  }
};

// 2. Tambah tugas baru
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, duration, due_date, status } =
      req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: "Judul tugas wajib diisi!" });
    }

    const [result] = await db.query(
      "INSERT INTO tasks (user_id, title, description, priority, duration, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        title,
        description || "",
        priority || "medium",
        duration || 0,
        due_date || null,
        status || "pending", // Status default saat tugas dibuat
      ],
    );

    res
      .status(201)
      .json({ id: result.insertId, message: "Tugas berhasil dibuat!" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambah tugas: " + err.message });
  }
};

// 3. Update Tugas (Termasuk Status, Prioritas, & Due Date)
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, duration, priority, due_date } =
      req.body;
    const taskId = req.params.id;
    const userId = req.user.id;

    await db.query(
      "UPDATE tasks SET title = ?, description = ?, status = ?, duration = ?, priority = ?, due_date = ? WHERE id = ? AND user_id = ?",
      [
        title,
        description,
        status || "pending", // Memastikan status tidak null
        duration,
        priority,
        due_date || null,
        taskId,
        userId,
      ],
    );

    res.json({ message: "Tugas berhasil diperbarui!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal memperbarui tugas: " + err.message });
  }
};

// 4. Menghapus Tugas
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id; // Memastikan hanya pemilik tugas yang bisa menghapus

    const [result] = await db.query(
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      [taskId, userId],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Tugas tidak ditemukan atau tidak diizinkan." });
    }

    res.json({ message: "Tugas berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus tugas: " + err.message });
  }
};

// 5. Timer Start (Opsional)
exports.startTimer = async (req, res) => {
  try {
    res.json({ message: "Timer started" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. Timer Stop (Opsional)
exports.stopTimer = async (req, res) => {
  try {
    res.json({ message: "Timer stopped" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7. Admin Analytics (Khusus Admin)
exports.getAdminAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak. Khusus admin!" });
    }
    res.json({ message: "Data analytics berhasil dimuat" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
