import { Router } from "express";
import { getSubtasksForTodo } from "../controllers/todoController.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";
const router = Router();
router.get("/:todoId/subtasks", authenticateUser, getSubtasksForTodo);
export default router;
