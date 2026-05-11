const nodemailer = require("nodemailer");
const pool = require("./db");

// SMTP config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

async function sendVisitorNotification({ meetingId, hostEmail, hostName, locationName, purpose, visitors, checkInTime }) {
  const visitorNames = visitors.map((v) => v.fullName).join(", ");
  const time = new Date(checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = new Date(checkInTime).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px;">
      <h2 style="color: #050516;">Visitor Arrival</h2>
      <p>Hi ${hostName},</p>
      <p>You have visitors waiting at reception.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px; color: #666;">Visitor(s)</td><td style="padding: 8px; font-weight: bold;">${visitorNames}</td></tr>
        <tr><td style="padding: 8px; color: #666;">Purpose</td><td style="padding: 8px;">${purpose}</td></tr>
        <tr><td style="padding: 8px; color: #666;">Location</td><td style="padding: 8px;">${locationName}</td></tr>
        <tr><td style="padding: 8px; color: #666;">Arrival</td><td style="padding: 8px;">${time} on ${date}</td></tr>
        <tr><td style="padding: 8px; color: #666;">Meeting ID</td><td style="padding: 8px;">${meetingId}</td></tr>
      </table>
      <p style="color: #666; font-size: 12px;">Mphatek Visitor Management System</p>
    </div>
  `;

  try {
    // only send if SMTP is configured
    if (!process.env.SMTP_USER) {
      console.log("SMTP not configured — skipping email to", hostEmail);
      await logNotification(meetingId, hostEmail, "Email", "Skipped");
      return;
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: hostEmail,
      subject: `Visitor Arrival: ${visitorNames}`,
      html,
    });

    console.log("Notification sent to", hostEmail);
    await logNotification(meetingId, hostEmail, "Email", "Sent");
  } catch (err) {
    console.error("Failed to send email:", err.message);
    await logNotification(meetingId, hostEmail, "Email", "Failed");
  }
}

async function logNotification(meetingId, sentTo, channel, status) {
  try {
    await pool.query(
   `INSERT INTO notifications_log(MeetingID, SentTo, Channel, Status)
        VALUES ($1, $2, $3, $4)
      `, [meetingId, sentTo, channel, status]);
  } catch (err) {
    console.error("Failed to log notification:", err.message);
  }
}

module.exports = { sendVisitorNotification };