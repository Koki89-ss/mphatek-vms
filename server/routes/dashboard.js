const express = require("express");
const { getPool } = require("../db");
const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Meetings WHERE CAST(CheckInTime AS DATE) = CAST(GETDATE() AS DATE)) AS todayTotal,
        (SELECT COUNT(*) FROM Meetings WHERE CAST(CheckInTime AS DATE) = CAST(GETDATE() AS DATE) AND Status = 'CheckedIn') AS checkedIn,
        (SELECT COUNT(*) FROM Meetings WHERE CAST(CheckInTime AS DATE) = CAST(GETDATE() AS DATE) AND Status = 'Completed') AS completed,
        (SELECT COUNT(*) FROM Meetings WHERE Status = 'CheckedIn' AND DATEDIFF(HOUR, CheckInTime, GETDATE()) > 8) AS overstayed
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
});

module.exports = router;
