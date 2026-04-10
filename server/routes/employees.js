const express = require("express");
const { getPool } = require("../db");
const router = express.Router();

// GET /api/employees
router.get("/", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      "SELECT EmployeeID, FullName, Email, PhoneNumber, Department FROM Employees WHERE IsActive = 1"
    );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees." });
  }
});

module.exports = router;
