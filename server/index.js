const express = require("express");
const cors = require("cors");

const employeesRouter = require("./routes/employees");
const locationsRouter = require("./routes/locations");
const meetingsRouter = require("./routes/meetings");
const dashboardRouter = require("./routes/dashboard");
const authRouter = require("./routes/auth");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// routes
app.use("/api/employees", employeesRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/meetings", meetingsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/auth", authRouter);

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const { getPool } = require("./db");

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await getPool();
  } catch (err) {
    console.error("Failed to connect to database:", err.message);
  }
});
