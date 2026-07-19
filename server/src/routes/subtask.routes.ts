import { Router } from "express";
import {
  createSubtask,
  getSubtasksForTodo,
  updateSubtask,
  deleteSubtask,
} from "../controllers/subtask.controller.js";
import rateLimiterMiddleware from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.get(
  "/:todoId",
  rateLimiterMiddleware({ limit: 20, windowMs: 60 * 1000 }),
  getSubtasksForTodo,
);
router.post(
  "/:todoId",
  rateLimiterMiddleware({ limit: 20, windowMs: 60 * 1000 }),
  createSubtask,
);
router.patch("/:subtaskId", updateSubtask);
router.delete("/:subtaskId", deleteSubtask);

export default router;
