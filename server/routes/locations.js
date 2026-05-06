const express = require("express");
const pool = require("../db");
const router = express.Router();

// GET /api/locations
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT LocationID, LocationName, Floor, Capacity FROM Locations WHERE IsActive = 1"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching locations:", err);
    res.status(500).json({ error: "Failed to fetch locations." });
  }
});

module.exports = router;