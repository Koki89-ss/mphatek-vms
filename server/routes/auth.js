const express = require("express");
const { sql, getPool } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("email", sql.NVarChar, email)
      .query(`
        SELECT u.UserID, u.PasswordHash, u.Role,
               e.EmployeeID, e.FullName, e.Email, e.Department
        FROM Users u
        JOIN Employees e ON u.HostEmployeeID = e.EmployeeID
        WHERE u.Email = @email AND u.IsActive = 1
      `);
  console.log("DB result:", result.recordset);
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.recordset[0];

    const valid = await bcrypt.compare(password, user.PasswordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user.UserID, employeeId: user.EmployeeID, email: user.Email, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // log the login action in the audit logs
    await pool.request()
      .input("entityName", sql.NVarChar, "Employee")
      .input("entityId", sql.Int, user.EmployeeID)
      .input("actionType", sql.NVarChar, "Login")
      .input("performedBy", sql.NVarChar, user.FullName)
      .query("INSERT INTO AuditLogs (EntityName, EntityID, ActionType, PerformedBy) VALUES (@entityName, @entityId, @actionType, @performedBy)");

    res.json
    ({EmployeeID: user.EmployeeID, FullName: user.FullName, Email: user.Email, Department: user.Department, Role: user.Role, token });


  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed." });
  }
});

module.exports = router;