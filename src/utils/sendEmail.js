const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Use user-provided SMTP credentials or create a test account on the fly if testing
  // However, for best results, expect environment variables to be set.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Since we might not have credentials during dev, fallback to console log
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log("=====================================================");
    console.log(`[SIMULATED EMAIL] To: ${options.email}`);
    console.log(`[SIMULATED EMAIL] Subject: ${options.subject}`);
    console.log(`[SIMULATED EMAIL] Message: \n${options.message}`);
    console.log("=====================================================");
    return;
  }

  const message = {
    from: `${process.env.FROM_NAME || "e-GramSAARTHI"} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.htmlMessage || options.message,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
