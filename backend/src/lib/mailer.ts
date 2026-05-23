import nodemailer from "nodemailer";

/**
 * Dev-mode transporter — logs emails to console instead of sending.
 * Replace with real SMTP config via env vars for production.
 */
const transporter = nodemailer.createTransport({
  streamTransport: true,
  newline: "unix",
});

export interface EmailPayload {
  recipientEmail: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email (or log it in dev mode).
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  const from = process.env.SMTP_FROM ?? "noreply@karyakram.com";

  const info = await transporter.sendMail({
    from,
    to: payload.recipientEmail,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  // In dev/stream mode, log the email content
  if (info.message) {
    let body = "";
    for await (const chunk of info.message) {
      body += chunk.toString();
    }
    console.log(`\n📧 Email sent to ${payload.recipientEmail}:`);
    console.log(`   Subject: ${payload.subject}`);
    console.log(`   Body preview: ${payload.text.substring(0, 200)}`);
  }
}
