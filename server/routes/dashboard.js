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
        (SELECT COUNT(*) FROM Meetings WHERE CAST(CheckInTime AS DATE) = CURRENT_DATE AND HostEmployeeID = $1) AS todayTotal,
        (SELECT COUNT(*) FROM Meetings WHERE CAST(CheckInTime AS DATE) = CURRENT_DATE AND Status = 'CheckedIn' AND HostEmployeeID = $1) AS checkedIn,
        (SELECT COUNT(*) FROM Meetings WHERE CAST(CheckInTime AS DATE) = CURRENT_DATE AND Status = 'Completed' AND HostEmployeeID = $1) AS completed,
        (SELECT COUNT(*) FROM Meetings WHERE Status = 'CheckedIn' AND EXTRACT(EPOCH FROM(NOW()- CheckInTime)) /3600 > 8 AND HostEmployeeID = $1) AS overstayed
    `, [employeeId]);
    

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
});

module.exports = router;