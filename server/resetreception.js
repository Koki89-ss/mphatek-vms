// save as resetReception.js in your server folder
const bcrypt = require("bcrypt");
const { getPool, sql } = require("./db");

async function reset() {
  const hash = await bcrypt.hash("Reception@2026!", 10);
  const pool = await getPool();

  await pool.request()
    .input("hash", sql.NVarChar, hash)
    .input("email", sql.NVarChar, "busisiwe.zikhalala@mphatek.com")
    .query("UPDATE Users SET PasswordHash = @hash WHERE Email = @email");

  console.log("✅ Reception password updated.");
  process.exit(0);
}

reset().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});