const sql = require("mssql");

const config = {
  server: "DESKTOP-JALOKH3",
  database: "VisitorsManagementSystem",
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  driver: "msnodesqlv8",
};

let pool;

async function getPool() {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect();
    console.log("Connected to SQL Server");
  }
  return pool;
}

module.exports = { sql, getPool };
