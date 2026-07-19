import { Router } from "express";
import {
  createSubtask,
  getSubtasksForTodo,
  updateSubtask,
  deleteSubtask,
} from "../controllers/subtask.controller.js";
import rateLimiterMiddleware from "../middlewares/rateLimiter.middleware.js";

const router = Router();

const subtaskRateLimiter = rateLimiterMiddleware({
  limit: 20,
  windowMs: 60 * 1000,
});

router.get("/:todoId", subtaskRateLimiter, getSubtasksForTodo);
router.post("/:todoId", subtaskRateLimiter, createSubtask);
router.patch("/:subtaskId", updateSubtask);
router.delete("/:subtaskId", deleteSubtask);

export default router;
