import type { DueReminderTodo } from "../email.types.js";
import {
  APP_NAME,
  buildAppUrl,
  buildEmailShell,
  buildPrimaryButton,
  escapeHtml,
} from "./email.shared.js";

function formatDueDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function buildTodoCard(todo: DueReminderTodo): string {
  const title = escapeHtml(todo.title);
  const dueDate = escapeHtml(formatDueDate(todo.dueDate));

  return `
    <tr>
      <td style="padding: 0 0 12px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <tr>
            <td style="padding: 16px 20px;">
              <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; line-height: 1.4; color: #111827;">
                ${title}
              </p>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #6b7280;">
                Due ${dueDate}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

export function buildDueReminderTemplate(
  username: string,
  todos: DueReminderTodo[],
  totalTodosDueIn6Hours: number,
): { subject: string; html: string } {
  const safeUsername = escapeHtml(username);
  const todosUrl = buildAppUrl("/todos");
  const todoCards = todos.map(buildTodoCard).join("");
  const todoLabel = totalTodosDueIn6Hours === 1 ? "todo" : "todos";
  const remainingCount = totalTodosDueIn6Hours - todos.length;

  const subject =
    totalTodosDueIn6Hours === 1
      ? "Reminder: 1 todo due in the next 6 hours"
      : `Reminder: ${totalTodosDueIn6Hours} todos due in the next 6 hours`;

  const overflowNote =
    remainingCount > 0
      ? `
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
      and <strong style="color: #111827;">${remainingCount} more ${remainingCount === 1 ? "todo" : "todos"}</strong> due in the next 6 hours
    </p>
  `
      : "";

  const body = `
    <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 1.6; color: #111827;">
      Hi ${safeUsername},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
      You have <strong style="color: #111827;">${totalTodosDueIn6Hours} ${todoLabel}</strong> due in the next 6 hours. Here ${totalTodosDueIn6Hours === 1 ? "is what needs" : "are the ones that need"} your attention:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${todoCards}
    </table>
    ${overflowNote}
    ${buildPrimaryButton(todosUrl, `Open ${APP_NAME}`)}
  `;

  const html = buildEmailShell({
    subject,
    headerTitle: "Due date reminder",
    body,
    footer:
      "You are receiving this because due date reminders are enabled for your account.",
  });

  return { subject, html };
}
