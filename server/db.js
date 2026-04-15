const sql = require("mssql");

const config = {
  server: "DESKTOP-JALOKH3",
  database: "VisitorsManagementSystem",
  user: "visitor_user",
  password: "Mph@t3kV1s1t0r2026",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log("Connected to SQL Server");
  }
  return pool;
}

module.exports = { sql, getPool };
