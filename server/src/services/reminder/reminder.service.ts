import { ReminderChannel, ReminderStatus, ReminderType } from "@prisma/client";
import { prisma } from "../../config/db.js";

class ReminderService {
  async processDueReminders() {}

  private async getEligibleUsers() {
    const users = await prisma.user.findMany({
      where: {
        dueDateReminder: true,
        isEmailVerified: true,
      },
    });

    return users;
  }

  private async getDueTodos(userId: string) {
    const now = new Date();
    const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    return prisma.todo.findMany({
      where: {
        userId,
        completed: false,
        dueDate: {
          gt: now,
          lte: sixHoursFromNow,
        },
      },
      include: {
        reminders: {
          where: {
            type: ReminderType.DUE_6_HOURS,
            channel: ReminderChannel.EMAIL,
            OR: [
              {
                sentAt: null,
              },
              {
                sentAt: { lt: twelveHoursAgo },
              },
            ],
          },
        },
      },
    });
  }
}

export const reminderService = new ReminderService();
