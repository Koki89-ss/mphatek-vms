const express = require("express");
const pool = require("../db");
const { sendVisitorNotification } = require("../notify");
const auth = require("../middleware/auth");
const router = express.Router();

// POST /api/meetings - create a meeting with visitors
router.post("/", async (req, res) => {
  const { visitorCategory, purpose, hostEmployeeId, locationId, checkInTime, visitors } = req.body;

  if (!visitorCategory || !hostEmployeeId || !locationId || !visitors || visitors.length === 0) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const client = await pool.connect();

  try {
   await client.query("BEGIN");


    // insert meeting
    
    const meetingResult = await client.query(
      `INSERT INTO Meetings
         (VisitorCategory, Purpose, HostEmployeeID, LocationID, CheckInTime, Status, CreatedDate)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING MeetingID`,                            
      [
        visitorCategory,
        purpose || "",
        Number(hostEmployeeId),
        Number(locationId),
        checkInTime ? new Date(checkInTime) : new Date(),
        "Pending",
        new Date(),
      ]
    );
    const meetingId = meetingResult.rows[0].meetingid;

    // insert each visitor
    for (const v of visitors) {
      await client.query(
        `INSERT INTO Visitors
           (meetingid, fullname, contactnum, email, organizationname, vehiclenum, idprooftype, idproofnumber, createddate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,  // ← changed (@param → $n)
        [
          meetingId, v.fullName, v.contactNum,
          v.email || "", v.organizationName || "",
          v.vehicleNum || "", v.idProofType || "",
          v.idProofNumber || "", new Date(),
        ]
      );
    }


    // log the action
    await client.query(
      `INSERT INTO AuditLogs (EntityName, EntityID, ActionType, PerformedBy)
       VALUES ($1, $2, $3, $4)`,
      ["Meeting", meetingId, "Insert", visitors[0].fullName]
    );
    await client.query("COMMIT");

    // send notification to host employee (don't block the response)
   pool.query(
      "SELECT e.Email, e.FullName, l.LocationName FROM Employees e, Locations l WHERE e.EmployeeID = $1 AND l.LocationID = $2",
      [Number(hostEmployeeId), Number(locationId)]     // ← changed ($1,$2 + array)
    )
      .then((r) => {
        if (r.rows.length > 0) {                         // ← changed
          const row = r.rows[0];                         // ← changed
          sendVisitorNotification({
            meetingId,
            hostEmail: row.email,                        // ← lowercase
            hostName: row.fullname,                      // ← lowercase
            locationName: row.locationname,              // ← lowercase
            purpose: purpose || "",
            visitors,
            checkInTime: checkInTime || new Date().toISOString(),
          });
        }
      })
        .catch((err) => console.error("Notification lookup failed:", err.message));
    

    res.status(201).json({ meetingId, status: "Pending" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating meeting:", err);
    res.status(500).json({ error: "Failed to create meeting." });
  }finally {
    client.release();
  }
});

// GET /api/meetings - list meetings with optional filters
router.get("/", auth, async (req, res) => {
  const { status, date } = req.query;
  const employeeId = req.user.employeeId; // from JWT

  try {
    let query = `
      SELECT
        m.MeetingID, m.VisitorCategory, m.Purpose, m.CheckInTime, m.CheckOutTime, m.Status,
        e.FullName AS HostName, e.Department,
        l.LocationName
      FROM Meetings m
      JOIN Employees e ON m.HostEmployeeID = e.EmployeeID
      JOIN Locations l ON m.LocationID = l.LocationID
      WHERE m.HostEmployeeID =$1
    `;


   const params = [employeeId]; 
   let paramIndex = 2;

    if (status) {
      query += ` AND m.Status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (date) {
      query += ` AND CAST(m.CheckInTime AS DATE) = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    query += " ORDER BY m.CheckInTime DESC";

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching meetings:", err);
    res.status(500).json({ error: "Failed to fetch meetings." });
  }
});

// GET /api/meetings/:id/visitors - get visitors for a meeting
router.get("/:id/visitors", auth, async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);

    const ownerCheck = await pool.query(
      `SELECT MeetingID FROM Meetings
       WHERE MeetingID = $1 AND HostEmployeeID = $2`,  
      [meetingId, req.user.employeeId]
    );

      if (ownerCheck.rows.length === 0)
      return res.status(403).json({ error: "Not authorized." });

      const result = await pool.query(
       "SELECT * FROM Visitors WHERE MeetingID = $1",   
      [meetingId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching visitors:", err);
    res.status(500).json({ error: "Failed to fetch visitors." });
  }
});


//PUT/api/meetings/:id/approve - host approves the meeting

router.put("/:id/approve", auth, async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);

    const ownerCheck = await pool.query(
      `SELECT MeetingID FROM Meetings
       WHERE MeetingID = $1 AND HostEmployeeID = $2 AND Status = 'Pending'`,
      [meetingId, req.user.employeeId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: "Not authorized." });
    }

    const now = new Date();

    await pool.query(
      
        `UPDATE Meetings
        SET Status = 'CheckedIn', CheckInTime = $1
        WHERE MeetingID = $2`,
      [now, meetingId]
      );

      await pool.query(
      `INSERT INTO AuditLogs (EntityName, EntityID, ActionType, PerformedBy)
       VALUES ($1, $2, $3, $4)`,
      ["Meeting", meetingId, "Approve", req.user.email]
    );

    res.json({ meetingId, status: "CheckedIn"});
  } catch (err) {
    console.error("Error approving meeting:", err);
    res.status(500).json({ error: "Failed to approve meeting." });
  }
});


// PUT /api/meetings/:id/checkout - mark checkout
router.put("/:id/checkout", auth, async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);

    const ownerCheck = await pool.query(
      `SELECT MeetingID FROM Meetings
       WHERE MeetingID = $1 AND HostEmployeeID = $2 AND Status = 'CheckedIn'`,
      [meetingId, req.user.employeeId]
    );


    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: "Not authorized." });
    }

    const now = new Date();

    await pool.query(
      `UPDATE Meetings SET CheckOutTime = $1, Status = 'Completed' WHERE MeetingID = $2`,
      [now, meetingId]
    );


    
    // log the action
    await pool.query(
      `INSERT INTO AuditLogs (EntityName, EntityID, ActionType, PerformedBy)
       VALUES ($1, $2, $3, $4)`,
      ["Meeting", meetingId, "CheckOut", req.user.email]
    );

      

    res.json({ meetingId, status: "Completed", checkOutTime: now });
  } catch (err) {
    console.error("Error checking out:", err);
    res.status(500).json({ error: "Failed to check out." });
  }
});

module.exports = router;