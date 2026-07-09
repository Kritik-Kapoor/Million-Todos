import { Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import {
  createSubtask,
  getSubtasksForTodo,
  updateSubtask,
  deleteSubtask,
} from "../controllers/subtask.controller.js";

const router = Router();

router.get("/:todoId", authenticateUser, getSubtasksForTodo);
router.post("/:todoId", authenticateUser, createSubtask);
router.patch("/:subtaskId", authenticateUser, updateSubtask);
router.delete("/:subtaskId", authenticateUser, deleteSubtask);

export default router;
