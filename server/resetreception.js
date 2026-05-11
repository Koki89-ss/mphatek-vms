// save as resetReception.js in your server folder
const bcrypt = require("bcrypt");
const pool = require("./db");

async function reset() {
  const hash = await bcrypt.hash("Reception@2026!", 10);

  await pool.query(
    "UPDATE Users SET PasswordHash = $1 WHERE Email = $2",
    [hash, "busisiwe.zikhalala@mphatek.com"]
  );

  console.log("✅ Reception password updated.");
  process.exit(0);
}

reset().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});