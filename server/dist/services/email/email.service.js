import { resend } from "../../config/resend.js";
import { getErrorMessage } from "../../utils/apiResponse.js";
import { buildDueReminderTemplate } from "./templates/dueReminder.template.js";
import { buildPasswordResetEmailTemplate } from "./templates/passwordReset.template.js";
import { buildVerificationEmailTemplate } from "./templates/verificationEmail.template.js";
export class EmailService {
    async sendEmail(options) {
        try {
            const { data, error } = await resend.emails.send({
                from: process.env.EMAIL_FROM,
                ...options,
            });
            if (error) {
                console.error("Failed to send mail", error);
                return { success: false, data: null, error: getErrorMessage(error) };
            }
            return { success: true, data };
        }
        catch (error) {
            console.error("Failed to send mail", error);
            return { success: false, data: null, error: getErrorMessage(error) };
        }
    }
    async sendDueReminders(options) {
        try {
            const { to, username, todos, totalTodosDueIn6Hours } = options;
            const { subject, html } = buildDueReminderTemplate(username, todos, totalTodosDueIn6Hours);
            return await this.sendEmail({ to: [to], subject, html });
        }
        catch (error) {
            console.error(error);
            return { success: false, data: null, error: getErrorMessage(error) };
        }
    }
    async sendVerificationEmail(options) {
        try {
            const { to, username, verificationToken } = options;
            const { subject, html } = buildVerificationEmailTemplate(to, username, verificationToken);
            return await this.sendEmail({ to: [to], subject, html });
        }
        catch (error) {
            console.error(error);
            return { success: false, data: null, error: getErrorMessage(error) };
        }
    }
    async sendPasswordResetEmail(options) {
        try {
            const { to, username, passwordResetToken } = options;
            const { subject, html } = buildPasswordResetEmailTemplate(username, passwordResetToken);
            return await this.sendEmail({ to: [to], subject, html });
        }
        catch (error) {
            console.error(error);
            return { success: false, data: null, error: getErrorMessage(error) };
        }
    }
}
export const emailService = new EmailService();
