import { Router } from "express";
import {
  createSubtask,
  deleteSubtask,
  deleteTodo,
  getSubtasksForTodo,
  getTodos,
  updateSubtask,
  updateTodo,
} from "../controllers/todo.controller.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";

const router = Router();

// TODO Routes
router.get("/", authenticateUser, getTodos);
router.post("/:todoId", authenticateUser, updateTodo);
router.delete("/:todoId", authenticateUser, deleteTodo);

// Subtask Routes
router.get("/:todoId/subtasks", authenticateUser, getSubtasksForTodo);
router.post("/:todoId/subtasks", authenticateUser, createSubtask);
router.post("/subtasks/:subtaskId", authenticateUser, updateSubtask);
router.delete("/subtasks/:subtaskId", authenticateUser, deleteSubtask);

export default router;
