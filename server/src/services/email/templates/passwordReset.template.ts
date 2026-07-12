import {
  APP_NAME,
  buildAppUrl,
  buildEmailShell,
  buildFallbackLink,
  buildPrimaryButton,
  escapeHtml,
} from "./email.shared.js";

export function buildPasswordResetEmailTemplate(
  username: string,
  passwordResetToken: string,
): { subject: string; html: string } {
  const safeUsername = escapeHtml(username);
  const resetUrl = buildAppUrl(`/reset-password/${encodeURIComponent(passwordResetToken)}`);
  const subject = `Reset your ${APP_NAME} password`;

  const body = `
    <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 1.6; color: #111827;">
      Hi ${safeUsername},
    </p>
    <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
      We received a request to reset the password for your ${APP_NAME} account.
    </p>
    <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
      If you made this request, use the button below to choose a new password. This link will expire in <strong style="color: #111827;">1 hour</strong>.
    </p>
    <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged. If you are concerned about your account security, please contact our support team.
    </p>
    ${buildPrimaryButton(resetUrl, "Reset password")}
    ${buildFallbackLink(resetUrl)}
  `;

  const html = buildEmailShell({
    subject,
    headerTitle: "Password reset",
    body,
    footer: `This password reset link expires in 1 hour. If you did not request it, no action is required.`,
  });

  return { subject, html };
}
