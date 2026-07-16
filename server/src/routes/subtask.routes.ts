import { Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
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
  authenticateUser,
  rateLimiterMiddleware({ limit: 20, windowMs: 60 * 1000 }),
  getSubtasksForTodo,
);
router.post(
  "/:todoId",
  authenticateUser,
  rateLimiterMiddleware({ limit: 20, windowMs: 60 * 1000 }),
  createSubtask,
);
router.patch("/:subtaskId", authenticateUser, updateSubtask);
router.delete("/:subtaskId", authenticateUser, deleteSubtask);

export default router;
