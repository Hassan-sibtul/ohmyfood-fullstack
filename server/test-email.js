require("dotenv").config();
const nodemailer = require("nodemailer");

// Test email configuration
async function testEmail() {
  console.log("🧪 Testing email configuration...\n");
  
  console.log("Environment variables:");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_SECURE:", process.env.SMTP_SECURE);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "***SET***" : "NOT SET");
  console.log("FROM_EMAIL:", process.env.FROM_EMAIL);
  console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
  console.log();

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("❌ Missing required environment variables!");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Boolean(process.env.SMTP_SECURE === "true"),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      debug: true, // Enable debug output
      logger: true, // Log to console
    });

    console.log("📧 Verifying connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified!\n");

    console.log("📨 Sending test email...");
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: "OhMyFood Password Reset Test",
      html: `
        <h2>Test Email from OhMyFood</h2>
        <p>If you receive this email, your SMTP configuration is working correctly!</p>
        <p>Test link: <a href="${process.env.FRONTEND_URL}/reset-password/test-token-123">Click here</a></p>
      `,
      text: `Test email from OhMyFood. Link: ${process.env.FRONTEND_URL}/reset-password/test-token-123`,
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("\n📬 Check your inbox at:", process.env.SMTP_USER);
  } catch (error) {
    console.error("❌ Email test failed:");
    console.error(error);
  }
}

testEmail();
