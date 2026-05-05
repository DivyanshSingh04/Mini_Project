require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log("Testing with email:", process.env.SMTP_EMAIL);
  console.log("Password set:", !!process.env.SMTP_PASSWORD);

  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.error("Missing SMTP_EMAIL or SMTP_PASSWORD in .env");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", 
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    const info = await transporter.verify();
    console.log("SMTP Connection successful! Server is ready to take our messages");
  } catch (error) {
    console.error("SMTP Connection failed:", error);
  }
}

testEmail();
