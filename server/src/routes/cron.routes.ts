import { Router } from "express";
import { reminderService } from "../services/reminder/reminder.service.js";
import {
  ApiError,
  ApiResponse,
  getErrorMessage,
} from "../utils/apiResponse.js";

const router = Router();

router.post("/reminders", async (_req, res) => {
  try {
    await reminderService.processDueReminders();
    return new ApiResponse(200, null, "Reminders processed").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
});

export default router;
