import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getFilteredTodos,
  getTodos,
  updateTodo,
} from "../controllers/todo.controller.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";

const router = Router();

// TODO Routes
router.get("/", authenticateUser, getTodos);
router.post("/", authenticateUser, createTodo);
router.get("/filter", authenticateUser, getFilteredTodos);
router.patch("/:todoId", authenticateUser, updateTodo);
router.delete("/:todoId", authenticateUser, deleteTodo);

export default router;
