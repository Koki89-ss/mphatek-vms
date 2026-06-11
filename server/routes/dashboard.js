const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");
const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", auth, async (req, res) => {
  const employeeId = req.user.employeeId; // from JWT


   try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM meetings 
          WHERE hostemployeeid = $1
          AND CAST(createddate AS DATE) = CURRENT_DATE) AS "todayTotal",

        (SELECT COUNT(*) FROM meetings 
          WHERE hostemployeeid = $1
          AND status = 'Pending'
          AND CAST(createddate AS DATE) = CURRENT_DATE) AS "pending",

        (SELECT COUNT(*) FROM meetings 
          WHERE hostemployeeid = $1
          AND status = 'CheckedIn'
          AND CAST(createddate AS DATE) = CURRENT_DATE) AS "checkedIn",

        (SELECT COUNT(*) FROM meetings 
          WHERE hostemployeeid = $1
          AND status = 'Completed'
          AND CAST(createddate AS DATE) = CURRENT_DATE) AS "completed",

        (SELECT COUNT(*) FROM meetings 
          WHERE hostemployeeid = $1
          AND status = 'CheckedIn'
          AND EXTRACT(EPOCH FROM (NOW() - checkintime)) / 3600 > 8) AS "overstayed"
    `, [employeeId]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
});

module.exports = router;