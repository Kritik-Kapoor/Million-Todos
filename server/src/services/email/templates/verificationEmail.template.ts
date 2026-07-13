import {
  APP_NAME,
  buildAppUrl,
  buildEmailShell,
  buildFallbackLink,
  buildPrimaryButton,
  escapeHtml,
} from "./email.shared.js";

export function buildVerificationEmailTemplate(
  email: string,
  username: string,
  verificationToken: string,
): { subject: string; html: string } {
  const safeUsername = escapeHtml(username);
  const verifyUrl = buildAppUrl(
    `/verify-email-token?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(email)}`,
  );
  const subject = `Verify your ${APP_NAME} email`;

  const body = `
    <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 1.6; color: #111827;">
      Hi ${safeUsername},
    </p>
    <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
      Thanks for signing up for ${APP_NAME}. Verify your email address using the button below.
    </p>
    <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
      This link will expire in <strong style="color: #111827;">1 hour</strong>.
    </p>
    <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
      If you did not create a ${APP_NAME} account, you can safely ignore this email.
    </p>
    ${buildPrimaryButton(verifyUrl, "Verify email")}
    ${buildFallbackLink(verifyUrl)}
  `;

  const html = buildEmailShell({
    subject,
    headerTitle: "Verify your email",
    body,
    footer: `This verification link expires in 1 hour. If you did not request it, no action is required.`,
  });

  return { subject, html };
}
