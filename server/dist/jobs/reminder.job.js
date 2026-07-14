import cron from "node-cron";
import { reminderService } from "../services/reminder/reminder.service.js";
export function startReminderJob() {
    cron.schedule("*/30 * * * *", async () => {
        console.log("🔔 Running due reminder job...");
        try {
            await reminderService.processDueReminders();
        }
        catch (error) {
            console.error("Failed to process due reminders", error);
        }
    }, {
        noOverlap: true,
    });
}
