const express = require("express");
const pool = require("../db");
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
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM Meetings 
          WHERE CAST(CheckInTime AS DATE) = CURRENT_DATE
          OR (Status = 'Pending' AND CAST(CreatedDate AS DATE) = CURRENT_DATE)) AS todayTotal,

        (SELECT COUNT(*) FROM Meetings 
          WHERE Status = 'Pending'
          AND CAST(CreatedDate AS DATE) = CURRENT_DATE) AS pending,

        (SELECT COUNT(*) FROM Meetings 
          WHERE Status = 'CheckedIn'
          AND CAST(CheckInTime AS DATE) = CURRENT_DATE) AS checkedIn,

        (SELECT COUNT(*) FROM Meetings 
          WHERE Status = 'Completed'
          AND CAST(CheckOutTime AS DATE) = CURRENT_DATE) AS completed
    `);
    res.json(result.rows[0]);
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
    let query = `
      SELECT
        m.MeetingID, m.VisitorCategory, m.Purpose, m.CheckInTime, m.CheckOutTime, m.Status,
        e.FullName AS HostName, e.Department,
        l.LocationName
      FROM Meetings m
      JOIN Employees e ON m.HostEmployeeID = e.EmployeeID
      JOIN Locations l ON m.LocationID = l.LocationID
      WHERE 1 = 1
    `;

    const  params = [];
    let paramIndex = 1;


    if (status) {
      query += ` AND m.Status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (date) {
      query += ` AND CAST(m.CheckInTime AS DATE) = $${paramIndex}`; 
      params.push(date);
      paramIndex++;
    }else{
      query += ` AND CAST(m.CreatedDate AS DATE) = CURRENT_DATE`;
    }
    

    query += " ORDER BY m.CreatedDate DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching reception meetings:", err);
    res.status(500).json({ error: "Failed to fetch meetings." });
  }
});

// GET /api/reception/meetings/:id/visitors
router.get("/meetings/:id/visitors", auth, receptionOnly, async (req, res) => {
  try {;
    const result = await pool.query(
      "SELECT * FROM Visitors WHERE MeetingID = $1",
      [parseInt(req.params.id)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching visitors:", err);
    res.status(500).json({ error: "Failed to fetch visitors." });
  }
});

module.exports = router;