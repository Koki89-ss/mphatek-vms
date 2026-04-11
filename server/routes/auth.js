const express = require("express");
const { sql, getPool } = require("../db");
const router = express.Router();

const SHARED_PASSWORD = "Mphatek2026";

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (password !== SHARED_PASSWORD) {
    return res.status(401).json({ error: "Invalid password." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT EmployeeID, FullName, Email, Department FROM Employees WHERE Email = @email AND IsActive = 1");

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Employee not found." });
    }

    const employee = result.recordset[0];

    // log the login
    await pool.request()
      .input("entityName", sql.NVarChar, "Employee")
      .input("entityId", sql.Int, employee.EmployeeID)
      .input("actionType", sql.NVarChar, "Login")
      .input("performedBy", sql.NVarChar, employee.FullName)
      .query("INSERT INTO AuditLogs (EntityName, EntityID, ActionType, PerformedBy) VALUES (@entityName, @entityId, @actionType, @performedBy)");

    res.json(employee);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed." });
  }
});

module.exports = router;
