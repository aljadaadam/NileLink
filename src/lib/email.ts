import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "NileLink <noreply@nilelink.net>";

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({ from: FROM, to, subject, html });
}

export function generateVerifyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
