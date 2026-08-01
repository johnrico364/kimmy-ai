export async function sendEmail({ to, subject, body }) {
  console.log(`[Simulated Email] to=${to} subject=${subject}`);
  return {
    success: true,
    to,
    subject,
    sentAt: new Date().toISOString(),
  };
}
