const express = require("express");
const { getPool } = require("../db");
const router = express.Router();

// GET /api/locations
router.get("/", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      "SELECT LocationID, LocationName, Floor, Capacity FROM Locations WHERE IsActive = 1"
    );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching locations:", err);
    res.status(500).json({ error: "Failed to fetch locations." });
  }
});

module.exports = router;
