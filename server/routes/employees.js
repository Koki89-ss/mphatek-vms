const express = require("express");
const  pool = require("../db");
const router = express.Router();

// GET /api/employees
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT EmployeeID, FullName, Email, PhoneNum, Department FROM Employees WHERE IsActive = 1"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees." });
  }
});

module.exports = router;