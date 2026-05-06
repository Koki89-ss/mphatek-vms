require("dotenv").config();

const express = require("express");
const cors = require("cors");

const employeesRouter = require("./routes/employees");
const locationsRouter = require("./routes/locations");
const meetingsRouter = require("./routes/meetings");
const dashboardRouter = require("./routes/dashboard");
const authRouter = require("./routes/auth");
const receptionRouter = require("./routes/reception");
 

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
origin: process.env.FRONTEND_URL || "http://localhost:3000",
methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// routes
app.use("/api/employees", employeesRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/meetings", meetingsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/auth", authRouter);
app.use("/api/reception", receptionRouter);

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

(async () => {
  try {
    await pool.connect();
    console.log("Connected to the database");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
})();