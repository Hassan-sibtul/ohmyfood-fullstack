require("dotenv").config();
const sgMail = require("@sendgrid/mail");

async function testSendGrid() {
  console.log("🧪 Testing SendGrid API...\n");

  console.log("Environment variables:");
  console.log(
    "SENDGRID_API_KEY:",
    process.env.SENDGRID_API_KEY ? "***SET***" : "NOT SET"
  );
  console.log("FROM_EMAIL:", process.env.FROM_EMAIL);
  console.log();

  if (!process.env.SENDGRID_API_KEY) {
    console.error("❌ SENDGRID_API_KEY not found in .env file!");
    return;
  }

  try {
    // Set API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    console.log("📧 Sending test email...");

    const msg = {
      to: process.env.FROM_EMAIL || "sibtulhassan47@gmail.com",
      from: process.env.FROM_EMAIL || "sibtulhassan47@gmail.com",
      subject: "OhMyFood - SendGrid Test Email",
      text: "This is a test email from OhMyFood using SendGrid HTTP API!",
      html: `
        <h2>SendGrid Test Email</h2>
        <p>If you receive this email, your SendGrid API key is working correctly! ✅</p>
        <p>Your password reset emails will work now!</p>
      `,
    };

    const response = await sgMail.send(msg);

    console.log("✅ Email sent successfully!");
    console.log("Response status:", response[0].statusCode);
    console.log("Response headers:", response[0].headers);
    console.log("\n📬 Check your inbox at:", process.env.FROM_EMAIL);
    console.log("\n🎉 Your SendGrid API key is working perfectly!");
  } catch (error) {
    console.error("❌ SendGrid test failed:");

    if (error.response) {
      console.error("Status:", error.response.statusCode);
      console.error("Body:", error.response.body);

      if (error.response.statusCode === 401) {
        console.error(
          "\n⚠️  Authentication failed - Your API key might be invalid or revoked."
        );
        console.error("Please generate a new API key in SendGrid dashboard.");
      } else if (error.response.statusCode === 403) {
        console.error("\n⚠️  Sender identity not verified!");
        console.error("Go to SendGrid → Settings → Sender Authentication");
        console.error("Verify your sender email:", process.env.FROM_EMAIL);
      }
    } else {
      console.error(error);
    }
  }
}

testSendGrid();
