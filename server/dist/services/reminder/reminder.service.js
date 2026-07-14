import { ReminderChannel, ReminderType } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { emailService } from "../email/email.service.js";
class ReminderService {
    async processDueReminders() {
        const now = new Date();
        const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        const users = await this.getEligibleUsers(twelveHoursAgo);
        for (const user of users) {
            try {
                const todos = await this.getDueTodos(user.id, now, sixHoursFromNow);
                if (todos.length === 0)
                    continue;
                const previewTodos = todos.slice(0, 3);
                const { success } = await emailService.sendDueReminders({
                    to: user.email,
                    username: user.username,
                    todos: previewTodos.map((todo) => ({
                        id: todo.id,
                        title: todo.title,
                        dueDate: todo.dueDate,
                    })),
                    totalTodosDueIn6Hours: todos.length,
                });
                if (!success)
                    continue;
                await prisma.$transaction(async (tx) => {
                    await tx.user.update({
                        where: { id: user.id },
                        data: { lastReminderAt: now },
                    });
                    await tx.todoReminder.createMany({
                        data: todos.map((todo) => ({
                            todoId: todo.id,
                            type: ReminderType.DUE_6_HOURS,
                            channel: ReminderChannel.EMAIL,
                        })),
                        skipDuplicates: true,
                    });
                });
            }
            catch (error) {
                console.error(`Failed processing reminders for user ${user.id}`, error);
            }
        }
    }
    async getEligibleUsers(twelveHoursAgo) {
        const users = await prisma.user.findMany({
            where: {
                dueDateReminder: true,
                isEmailVerified: true,
                OR: [
                    { lastReminderAt: null },
                    {
                        lastReminderAt: {
                            lt: twelveHoursAgo,
                        },
                    },
                ],
            },
        });
        return users;
    }
    async getDueTodos(userId, now, sixHoursFromNow) {
        return prisma.todo.findMany({
            where: {
                userId,
                completed: false,
                dueDate: {
                    not: null,
                    gt: now,
                    lte: sixHoursFromNow,
                },
                reminders: {
                    none: {
                        type: ReminderType.DUE_6_HOURS,
                        channel: ReminderChannel.EMAIL,
                    },
                },
            },
            orderBy: {
                dueDate: "asc",
            },
            select: {
                id: true,
                title: true,
                dueDate: true,
            },
        });
    }
}
export const reminderService = new ReminderService();
