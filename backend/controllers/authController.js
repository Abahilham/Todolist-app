const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const bcrypt = require("bcrypt");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. Fungsi Register (Pendaftaran Akun Baru - Menerima Nama & Membutuhkan Approval Admin)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi!" });
    }

    // Cek apakah email sudah terdaftar
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    // Enkripsi password (hash)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Gunakan nama yang diinput user, atau buat nama default dari email jika kosong
    const userName = name && name.trim() !== "" ? name : email.split("@")[0];

    // Simpan ke database dengan status is_approved = 0 (Menunggu persetujuan Admin)
    await db.query(
      "INSERT INTO users (name, email, password, is_approved) VALUES (?, ?, ?, 0)",
      [userName, email, hashedPassword],
    );

    res.status(201).json({
      message:
        "Registrasi berhasil! Akun Anda sedang menunggu persetujuan dari Admin.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server: " + err.message });
  }
};

// 2. Fungsi Login Manual (Email & Password dengan Pengecekan Approval)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi!" });
    }

    // Cari user berdasarkan email
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Email atau password salah!" });
    }

    const user = rows[0];

    // Cek apakah user mendaftar menggunakan Google (tidak punya password lokal)
    if (!user.password) {
      return res.status(400).json({
        message:
          "Akun ini terdaftar via Google. Silakan login menggunakan Google.",
      });
    }

    // Verifikasi password dengan bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah!" });
    }

    // Pengecekan status persetujuan Admin (is_approved)
    if (user.is_approved === 0 || user.is_approved === false) {
      return res.status(403).json({
        message:
          "Akun Anda sedang menunggu persetujuan dari Admin. Silakan hubungi Administrator.",
      });
    }

    // Buat JWT Token jika akun sudah disetujui
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secretkey123",
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login Berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server: " + error.message });
  }
};

// 3. Fungsi Google Login (Dinonaktifkan)
exports.googleLogin = async (req, res) => {
  res.status(403).json({
    message: "Fitur Login via Google telah dinonaktifkan.",
  });
};
