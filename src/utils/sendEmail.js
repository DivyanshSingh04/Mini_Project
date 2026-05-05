const { Resend } = require('resend');

const sendEmail = async (options) => {
  // Since we might not have credentials during dev, fallback to console log
  if (!process.env.RESEND_API_KEY) {
    console.log("=====================================================");
    console.log(`[SIMULATED EMAIL] To: ${options.email}`);
    console.log(`[SIMULATED EMAIL] Subject: ${options.subject}`);
    console.log(`[SIMULATED EMAIL] Message: \n${options.message}`);
    console.log("=====================================================");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // If you are using Resend's free tier without a verified custom domain,
  // you MUST send emails FROM 'onboarding@resend.dev'
  // and you can ONLY send TO the email address you registered with on Resend.
  const fromEmail = 'onboarding@resend.dev';

  const { data, error } = await resend.emails.send({
    from: `e-GramSAARTHI <${fromEmail}>`,
    to: [options.email],
    subject: options.subject,
    text: options.message,
    html: options.htmlMessage || options.message,
  });

  if (error) {
    console.error("Resend API Error:", error);
    throw new Error(error.message);
  }

  return data;
};

module.exports = sendEmail;
