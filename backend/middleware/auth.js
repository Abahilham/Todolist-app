const jwt = require("jsonwebtoken");

// Verifikasi Token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak, token tidak ada" });
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey123",
    );
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: "Token tidak valid" });
  }
};

// RBAC Middleware (Membatasi akses berdasarkan Role)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Akses ditolak: Anda tidak memiliki izin" });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
