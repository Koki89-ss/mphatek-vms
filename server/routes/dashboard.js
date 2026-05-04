const express = require("express");
const { sql, getPool } = require("../db");
const auth = require("../middleware/auth");
const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", auth, async (req, res) => {
  const employeeId = req.user.employeeId; // from JWT


  try {
    const pool = await getPool();

    const result = await pool.request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
      SELECT
        (SELECT COUNT(*) FROM Meetings WHERE CAST(CheckInTime AS DATE) = CAST(GETDATE() AS DATE) AND HostEmployeeID = @employeeId) AS todayTotal,
        (SELECT COUNT(*) FROM Meetings WHERE CAST(CheckInTime AS DATE) = CAST(GETDATE() AS DATE) AND Status = 'CheckedIn' AND HostEmployeeID = @employeeId) AS checkedIn,
        (SELECT COUNT(*) FROM Meetings WHERE CAST(CheckInTime AS DATE) = CAST(GETDATE() AS DATE) AND Status = 'Completed' AND HostEmployeeID = @employeeId) AS completed,
        (SELECT COUNT(*) FROM Meetings WHERE Status = 'CheckedIn' AND DATEDIFF(HOUR, CheckInTime, GETDATE()) > 8 AND HostEmployeeID = @employeeId) AS overstayed
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
});

module.exports = router;