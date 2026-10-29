const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const caPath = path.join(__dirname, "../ca.pem");

const caCert = process.env.CA_CERT
  ? process.env.CA_CERT.replace(/\\n/g, "\n")
  : fs.existsSync(caPath)
    ? fs.readFileSync(caPath, "utf8")
    : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ...(caCert
    ? {
        ssl: {
          ca: caCert,
          rejectUnauthorized: true,
        },
      }
    : {}),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

module.exports = pool.promise();
