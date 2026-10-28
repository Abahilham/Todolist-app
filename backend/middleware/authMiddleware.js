const jwt = require("jsonwebtoken");

// 1. Satpam Pengecek KTP (Token)
const verifyToken = (req, res, next) => {
  // Ambil header authorization
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Token tidak ditemukan!" });
  }

  try {
    // Verifikasi token JWT menggunakan secret key milikmu
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey123",
    );
    req.user = verified; // Menyimpan data user yang sedang login ke request
    next(); // KTP valid, silakan masuk
  } catch (err) {
    res
      .status(403)
      .json({ message: "Token tidak valid atau sudah kedaluwarsa!" });
  }
};

// 2. Satpam Khusus Pintu Admin
const isAdmin = (req, res, next) => {
  // Pastikan user sudah melewati verifyToken dan rolenya adalah admin
  if (req.user && req.user.role === "admin") {
    next(); // Dia admin, silakan masuk ke rute khusus
  } else {
    res.status(403).json({ message: "Akses ditolak! Area khusus Admin." });
  }
};

// Mengekspor kedua fungsi dengan nama yang jelas agar dikenali oleh server.js
module.exports = { verifyToken, isAdmin };
