export const APP_NAME = "Million Todos";

export function getAppUrl(): string {
  return process.env.NODE_ENV === "production"
    ? process.env.WEBAPP_PROD_URL!
    : (process.env.WEBAPP_DEV_URL ?? "http://localhost:3000");
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildAppUrl(path: string): string {
  return `${getAppUrl().replace(/\/$/, "")}${path}`;
}

type EmailShellOptions = {
  subject: string;
  headerTitle: string;
  body: string;
  footer?: string;
};

export function buildEmailShell({
  subject,
  headerTitle,
  body,
  footer = `You are receiving this email from ${APP_NAME}.`,
}: EmailShellOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
            <tr>
              <td style="padding: 28px 32px; background: linear-gradient(135deg, #111827 0%, #1f2937 100%);">
                <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #9ca3af;">
                  ${APP_NAME}
                </p>
                <h1 style="margin: 0; font-size: 24px; font-weight: 700; line-height: 1.3; color: #ffffff;">
                  ${escapeHtml(headerTitle)}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px;">
                ${body}
                <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.6; color: #9ca3af; text-align: center;">
                  ${footer}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

export function buildPrimaryButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0 0 0;">
      <tr>
        <td align="center">
          <a
            href="${safeHref}"
            style="display: inline-block; padding: 14px 28px; background-color: #111827; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 10px;"
          >
            ${safeLabel}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function buildFallbackLink(url: string): string {
  const safeUrl = escapeHtml(url);

  return `
    <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.6; color: #6b7280;">
      If the button above does not work, copy and paste this link into your browser:
    </p>
    <p style="margin: 8px 0 0 0; font-size: 13px; line-height: 1.6; word-break: break-all;">
      <a href="${safeUrl}" style="color: #111827; text-decoration: underline;">
        ${safeUrl}
      </a>
    </p>
  `;
}
