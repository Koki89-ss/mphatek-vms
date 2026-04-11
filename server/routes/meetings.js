const express = require("express");
const { sql, getPool } = require("../db");
const { sendVisitorNotification } = require("../notify");
const router = express.Router();

// POST /api/meetings - create a meeting with visitors
router.post("/", async (req, res) => {
  const { visitorCategory, purpose, hostEmployeeId, locationId, checkInTime, visitors } = req.body;

  if (!visitorCategory || !hostEmployeeId || !locationId || !visitors || visitors.length === 0) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  let transaction;

  try {
    const pool = await getPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // insert meeting
    const meetingRequest = new sql.Request(transaction);
    const meetingResult = await meetingRequest
      .input("visitorCategory", sql.NVarChar, visitorCategory)
      .input("purpose", sql.NVarChar, purpose || "")
      .input("hostEmployeeId", sql.Int, Number(hostEmployeeId))
      .input("locationId", sql.Int, Number(locationId))
      .input("checkInTime", sql.DateTime, checkInTime ? new Date(checkInTime) : new Date())
      .input("status", sql.NVarChar, "CheckedIn")
      .input("createdDate", sql.DateTime, new Date())
      .query(`
        INSERT INTO Meetings (VisitorCategory, Purpose, HostEmployeeID, LocationID, CheckInTime, Status, CreatedDate)
        OUTPUT INSERTED.MeetingID
        VALUES (@visitorCategory, @purpose, @hostEmployeeId, @locationId, @checkInTime, @status, @createdDate)
      `);

    const meetingId = meetingResult.recordset[0].MeetingID;

    // insert each visitor
    for (const v of visitors) {
      const visitorRequest = new sql.Request(transaction);
      await visitorRequest
        .input("meetingId", sql.Int, meetingId)
        .input("fullName", sql.NVarChar, v.fullName)
        .input("contactNum", sql.NVarChar, v.contactNum)
        .input("email", sql.NVarChar, v.email || "")
        .input("organizationName", sql.NVarChar, v.organizationName || "")
        .input("vehicleNum", sql.NVarChar, v.vehicleNum || "")
        .input("idProofType", sql.NVarChar, v.idProofType || "")
        .input("idProofNumber", sql.NVarChar, v.idProofNumber || "")
        .input("createdDate", sql.DateTime, new Date())
        .query(`
          INSERT INTO Visitors (MeetingID, FullName, ContactNum, Email, OrganizationName, VehicleNum, IDProofType, IDProofNumber, CreatedDate)
          VALUES (@meetingId, @fullName, @contactNum, @email, @organizationName, @vehicleNum, @idProofType, @idProofNumber, @createdDate)
        `);
    }

    // log the action
    const auditRequest = new sql.Request(transaction);
    await auditRequest
      .input("entityName", sql.NVarChar, "Meeting")
      .input("entityId", sql.Int, meetingId)
      .input("actionType", sql.NVarChar, "Insert")
      .input("performedBy", sql.NVarChar, visitors[0].fullName)
      .query(`
        INSERT INTO AuditLogs (EntityName, EntityID, ActionType, PerformedBy)
        VALUES (@entityName, @entityId, @actionType, @performedBy)
      `);

    await transaction.commit();

    // send notification to host employee (don't block the response)
    getPool().then((pool) =>
      pool.request()
        .input("empId", sql.Int, Number(hostEmployeeId))
        .input("locId", sql.Int, Number(locationId))
        .query("SELECT e.Email, e.FullName, l.LocationName FROM Employees e, Locations l WHERE e.EmployeeID = @empId AND l.LocationID = @locId")
        .then((r) => {
          if (r.recordset.length > 0) {
            const row = r.recordset[0];
            sendVisitorNotification({
              meetingId,
              hostEmail: row.Email,
              hostName: row.FullName,
              locationName: row.LocationName,
              purpose: purpose || "",
              visitors,
              checkInTime: checkInTime || new Date().toISOString(),
            });
          }
        })
        .catch((err) => console.error("Notification lookup failed:", err.message))
    );

    res.status(201).json({ meetingId, status: "CheckedIn" });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { console.error("Rollback failed:", e); }
    }
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
      request.input("status", sql.NVarChar, status);
      query += " AND m.Status = @status";
    }

    if (date) {
      request.input("date", sql.NVarChar, date);
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
      .input("entityName", sql.NVarChar, "Meeting")
      .input("entityId", sql.Int, parseInt(req.params.id))
      .input("actionType", sql.NVarChar, "CheckOut")
      .input("performedBy", sql.NVarChar, "Reception")
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
