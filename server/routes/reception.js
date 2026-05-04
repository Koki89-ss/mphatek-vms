const express = require("express");
const { sql, getPool } = require("../db");
const auth = require("../middleware/auth");
const router = express.Router();

// Middleware to check reception role
function receptionOnly(req, res, next) {
  if (req.user.role !== "reception" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Reception only." });
  }
  next();
}

// GET /api/reception/stats - all meetings stats
router.get("/stats", auth, receptionOnly, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Meetings 
          WHERE CAST(CheckInTime AS DATE) = CAST(GETDATE() AS DATE)
          OR (Status = 'Pending' AND CAST(CreatedDate AS DATE) = CAST(GETDATE() AS DATE))) AS todayTotal,

        (SELECT COUNT(*) FROM Meetings 
          WHERE Status = 'Pending'
          AND CAST(CreatedDate AS DATE) = CAST(GETDATE() AS DATE)) AS pending,

        (SELECT COUNT(*) FROM Meetings 
          WHERE Status = 'CheckedIn'
          AND CAST(CheckInTime AS DATE) = CAST(GETDATE() AS DATE)) AS checkedIn,

        (SELECT COUNT(*) FROM Meetings 
          WHERE Status = 'Completed'
          AND CAST(CheckOutTime AS DATE) = CAST(GETDATE() AS DATE)) AS completed
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching reception stats:", err);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

// GET /api/reception/meetings - all meetings across all employees
router.get("/meetings", auth, receptionOnly, async (req, res) => {
  const { status, date } = req.query;

  console.log("Reception meetings requested by:" , req.user.email);
  console.log("Role:", req.user.role);

  try {
    const pool = await getPool();
    const request = pool.request();

    let query = `
      SELECT
        m.MeetingID, m.VisitorCategory, m.Purpose, m.CheckInTime, m.CheckOutTime, m.Status,
        e.FullName AS HostName, e.Department,
        l.LocationName
      FROM Meetings m
      JOIN Employees e ON m.HostEmployeeID = e.EmployeeID
      JOIN Locations l ON m.LocationID = l.LocationID
      WHERE (m.IsDELETED IS NULL OR m.IsDELETED = 0)
    `;

    if (status) {
      request.input("status", sql.NVarChar, status);
      query += " AND m.Status = @status";
    }

    if (date) {
      request.input("date", sql.NVarChar, date);
      query += " AND CAST(m.CreatedDate AS DATE) = @date";
    } else {
      query += " AND CAST(m.CreatedDate AS DATE) = CAST(GETDATE() AS DATE)";
    }

    query += " ORDER BY m.CreatedDate DESC";

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching reception meetings:", err);
    res.status(500).json({ error: "Failed to fetch meetings." });
  }
});

// GET /api/reception/meetings/:id/visitors
router.get("/meetings/:id/visitors", auth, receptionOnly, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("meetingId", sql.Int, parseInt(req.params.id))
      .query("SELECT * FROM Visitors WHERE MeetingID = @meetingId");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching visitors:", err);
    res.status(500).json({ error: "Failed to fetch visitors." });
  }
});

module.exports = router;