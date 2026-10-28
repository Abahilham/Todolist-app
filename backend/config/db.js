const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Jalur ke file ca.pem lokal
const caPath = path.join(__dirname, "../ca.pem");

// Prioritaskan membaca isi sertifikat dari Environment Variable (untuk Render),
// jika tidak ada, baru baca file ca.pem di laptop (untuk lokal)
const caCert = process.env.CA_CERT
  ? process.env.CA_CERT
  : fs.existsSync(caPath)
    ? fs.readFileSync(caPath)
    : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: caCert ? { ca: caCert } : { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise();
