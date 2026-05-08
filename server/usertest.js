const bcrypt = require("bcrypt");
const pool = require("./db");

async function seed() {
  const hash = await bcrypt.hash("TempPassword123!", 10);
  const receptionHash = await bcrypt.hash("Reception@2026!", 10);

  const users = [
    { fullName: "Sikhozana Fanelesibonge", email: "fanele.skhosana@mphatek.com", role: "employee", employeeId: 4 },
    { fullName: "Mawelele Busisiwe HP", email: "busisiwe.mawelele@mphatek.com", role: "employee", employeeId: 5 },
    { fullName: "Samarjeet Singh", email: "samarjeet.signh@mphatek.com", role: "employee", employeeId: 6 },
    { fullName: "Vinod Savannapelly", email: "yinod.s@mpatek.com", role: "employee", employeeId: 7 },
    { fullName: "Busisiwe Zikhalala", email: "busisiwe.zikhalala@mphatek.com", role: "reception", employeeId: 3 }, 
  ];

  for (const u of users) {
    try {
       const passwordHash = u.role === "reception" ? receptionHash : hash;
      await poolquery(
        `
          INSERT INTO Users (FullName, Email, PasswordHash, Role, IsActive, CreatedDate, HostEmployeeID)
          VALUES (@fullName, @email, @hash, @role, 1, GETDATE(), @employeeId)
        `);
        [u.fullName, u.email, passwordHash, u.role, u.employeeId]
      console.log(`✅ User ${u.fullName} seeded successfully.`);
    } catch (err) {
      console.error(`❌ Failed to seed user ${u.fullName}:`, err);
    }
}

   console.log("Done");
    process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});