import { Resend } from "resend";

export async function sendEmail(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.RESEND_FROM_EMAIL ?? "Personal AI <onboarding@resend.dev>";
  if (!apiKey || !to) {
    console.warn("Email not sent — RESEND_API_KEY or NOTIFY_EMAIL_TO missing.");
    return;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({ from, to, subject, html });
}
