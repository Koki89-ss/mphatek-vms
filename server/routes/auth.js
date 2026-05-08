const express = require("express");
const pool = require("../db");
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
    const result = await pool.query(
      "SELECT u.UserID, u.HostEmployeeID, e.FullName, e.Email, e.Department, u.PasswordHash, e.Role FROM Users u JOIN Employees e ON u.HostEmployeeID = e.EmployeeID WHERE e.Email = $1", 
      [email] 
    );
  console.log("DB result:", result.rows);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.passwordhash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user.userid, employeeId: user.hostemployeeid, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // log the login action in the audit logs
    await pool.query(`
      INSERT INTO AuditLogs (EntityName, EntityID, ActionType, PerformedBy)
      VALUES ( $1, $2, $3, $4 )
    `, ["Employee", user.hostemployeeid, 'Login', user.email]);

    res.json({employeeID: user.hostemployeeid, fullName: user.fullname, email: user.email, department: user.department, role: user.role, token });


  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed." });
  }
});

module.exports = router;