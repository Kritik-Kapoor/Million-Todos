import { resend } from "../../config/resend.js";
import {
  SendDueReminderOptions,
  SendEmailOptions,
  SendPasswordResetEmailOptions,
  SendVerificationEmailOptions,
} from "./email.types.js";
import { buildDueReminderTemplate } from "./templates/dueReminder.template.js";
import { buildPasswordResetEmailTemplate } from "./templates/passwordReset.template.js";
import { buildVerificationEmailTemplate } from "./templates/verificationEmail.template.js";

export class EmailService {
  async sendEmail(options: SendEmailOptions) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        ...options,
      });

      if (error) {
        return console.error(error);
      }

      return data;
    } catch (error) {
      return console.error(error);
    }
  }

  async sendDueReminder(options: SendDueReminderOptions) {
    try {
      const { to, username, todos } = options;
      const { subject, html } = buildDueReminderTemplate(username, todos);
      await this.sendEmail({ to: [to], subject, html });
    } catch (error) {
      return console.error(error);
    }
  }

  async sendVerificationEmail(options: SendVerificationEmailOptions) {
    try {
      const { to, username, verificationToken } = options;
      const { subject, html } = buildVerificationEmailTemplate(
        to,
        username,
        verificationToken,
      );
      await this.sendEmail({ to: [to], subject, html });
    } catch (error) {
      return console.error(error);
    }
  }

  async sendPasswordResetEmail(options: SendPasswordResetEmailOptions) {
    try {
      const { to, username, passwordResetToken } = options;
      const { subject, html } = buildPasswordResetEmailTemplate(
        username,
        passwordResetToken,
      );
      await this.sendEmail({ to: [to], subject, html });
    } catch (error) {
      return console.error(error);
    }
  }
}

export const emailService = new EmailService();
