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
  const safeCode = escapeHtml(verificationToken);
  const verifyUrl = buildAppUrl(
    `/verify-email-token?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(email)}`,
  );
  const subject = `Verify your ${APP_NAME} email`;

  const body = `
    <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 1.6; color: #111827;">
      Hi ${safeUsername},
    </p>
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
      Thanks for signing up for ${APP_NAME}. Verify your email address using either option below.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px 0; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280;">
            Option 1: Verification code
          </p>
          <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
            Enter this 6-digit code in the app to verify your email:
          </p>
          <p style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 0.3em; line-height: 1.2; color: #111827; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
            ${safeCode}
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 8px 0; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280;">
            Option 2: One-click verification
          </p>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
            Click the button below to verify your email instantly.
          </p>
        </td>
      </tr>
    </table>

    ${buildPrimaryButton(verifyUrl, "Verify email")}
    ${buildFallbackLink(verifyUrl)}

    <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.6; color: #9ca3af;">
      If you did not create a ${APP_NAME} account, you can ignore this email.
    </p>
  `;

  const html = buildEmailShell({
    subject,
    headerTitle: "Verify your email",
    body,
    footer: `Use the verification code or the link above to complete your signup.`,
  });

  return { subject, html };
}
