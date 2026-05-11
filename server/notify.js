const pool = require("./db");

async function sendVisitorNotification({ meetingId, hostEmail, hostName, locationName, purpose, visitors, checkInTime }) {
  const visitorNames = visitors.map((v) => v.fullName).join(", ");
  const time = new Date(checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = new Date(checkInTime).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });


  try{
    if(!process.env.BREVO_API_KEY) {
      console.log("Breavo API key not configured-skipping email");
      return;
    }
  
    const respons= await fetch("https://api.brevo.com/v3/smtp/email", {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY, 
      },
      body: JSON.stringify({
        sender: { name: "Mphatek VMS", email: process.env.SMTP_USER },
        to: [{ email: hostEmail, name: hostName }],
        subject: `Visitor Arrival: ${visitorNames}`,
        htmlContent: `
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
  `,
      }),
    });

  if (response.ok) {
    console.log("Email sent successfully to", hostEmail);
    await logNotification(meetingId, hostEmail, "Email", "Sent");
  } else {
    const err =await response.json();
    console.error("Brevo API error:", err);
    await logNotification(meetingId, hostEmail, "Email", `Failed: ${err.message || response.statusText}`);
  }
  }catch(err) {
    console.error("Failed to send notification:", err.message);
    await logNotification(meetingId, hostEmail, "Email", `Failed: ${err.message}`);
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