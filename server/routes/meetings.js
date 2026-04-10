const express = require("express");
const { sql, getPool } = require("../db");
const router = express.Router();

// POST /api/meetings - create a meeting with visitors
router.post("/", async (req, res) => {
  const { visitorCategory, purpose, hostEmployeeId, locationId, checkInTime, visitors } = req.body;

  if (!visitorCategory || !hostEmployeeId || !locationId || !visitors || visitors.length === 0) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // insert meeting
      const meetingResult = await transaction.request()
        .input("hostEmployeeId", sql.Int, hostEmployeeId)
        .input("locationId", sql.Int, locationId)
        .input("visitorCategory", sql.VarChar(100), visitorCategory)
        .input("purpose", sql.VarChar(500), purpose || "")
        .input("checkInTime", sql.DateTime, checkInTime ? new Date(checkInTime) : new Date())
        .query(`
          INSERT INTO Meetings (HostEmployeeID, LocationID, VisitorCategory, Purpose, CheckInTime, Status)
          OUTPUT INSERTED.MeetingID
          VALUES (@hostEmployeeId, @locationId, @visitorCategory, @purpose, @checkInTime, 'CheckedIn')
        `);

      const meetingId = meetingResult.recordset[0].MeetingID;

      // insert each visitor
      for (const v of visitors) {
        await transaction.request()
          .input("meetingId", sql.Int, meetingId)
          .input("fullName", sql.VarChar(150), v.fullName)
          .input("contactNumber", sql.VarChar(20), v.contactNum)
          .input("email", sql.VarChar(150), v.email || "")
          .input("organizationName", sql.VarChar(150), v.organizationName || "")
          .input("vehicleNumber", sql.VarChar(50), v.vehicleNum || "")
          .query(`
            INSERT INTO Visitors (MeetingID, FullName, ContactNumber, Email, OrganizationName, VehicleNumber)
            VALUES (@meetingId, @fullName, @contactNumber, @email, @organizationName, @vehicleNumber)
          `);
      }

      // log the action
      await transaction.request()
        .input("entityName", sql.VarChar(100), "Meeting")
        .input("entityId", sql.Int, meetingId)
        .input("actionType", sql.VarChar(50), "Insert")
        .input("performedBy", sql.VarChar(150), visitors[0].fullName)
        .query(`
          INSERT INTO AuditLogs (EntityName, EntityID, ActionType, PerformedBy)
          VALUES (@entityName, @entityId, @actionType, @performedBy)
        `);

      await transaction.commit();
      res.status(201).json({ meetingId, status: "CheckedIn" });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error("Error creating meeting:", err);
    res.status(500).json({ error: "Failed to create meeting." });
  }
});

// GET /api/meetings - list meetings with optional filters
router.get("/", async (req, res) => {
  const { status, date, employeeId } = req.query;

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
      WHERE 1=1
    `;

    if (status) {
      request.input("status", sql.VarChar(50), status);
      query += " AND m.Status = @status";
    }

    if (date) {
      request.input("date", sql.VarChar(10), date);
      query += " AND CAST(m.CheckInTime AS DATE) = @date";
    }

    if (employeeId) {
      request.input("employeeId", sql.Int, parseInt(employeeId));
      query += " AND m.HostEmployeeID = @employeeId";
    }

    query += " ORDER BY m.CheckInTime DESC";

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching meetings:", err);
    res.status(500).json({ error: "Failed to fetch meetings." });
  }
});

// GET /api/meetings/:id/visitors - get visitors for a meeting
router.get("/:id/visitors", async (req, res) => {
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

// PUT /api/meetings/:id/checkout - mark checkout
router.put("/:id/checkout", async (req, res) => {
  try {
    const pool = await getPool();
    const now = new Date();

    const result = await pool.request()
      .input("meetingId", sql.Int, parseInt(req.params.id))
      .input("checkOutTime", sql.DateTime, now)
      .query(`
        UPDATE Meetings
        SET CheckOutTime = @checkOutTime, Status = 'Completed'
        WHERE MeetingID = @meetingId AND Status = 'CheckedIn'
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Meeting not found or already checked out." });
    }

    // log the action
    await pool.request()
      .input("entityName", sql.VarChar(100), "Meeting")
      .input("entityId", sql.Int, parseInt(req.params.id))
      .input("actionType", sql.VarChar(50), "CheckOut")
      .input("performedBy", sql.VarChar(150), "Reception")
      .query(`
        INSERT INTO AuditLogs (EntityName, EntityID, ActionType, PerformedBy)
        VALUES (@entityName, @entityId, @actionType, @performedBy)
      `);

    res.json({ meetingId: parseInt(req.params.id), status: "Completed", checkOutTime: now });
  } catch (err) {
    console.error("Error checking out:", err);
    res.status(500).json({ error: "Failed to check out." });
  }
});

module.exports = router;
