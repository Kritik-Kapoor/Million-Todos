import { Router } from "express";
import {
  createTodo,
  deleteAllTodos,
  deleteTodo,
  getFilteredTodos,
  getTodos,
  updateTodo,
} from "../controllers/todo.controller.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import rateLimiterMiddleware from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.get(
  "/",
  authenticateUser,
  rateLimiterMiddleware({ limit: 8, windowMs: 60 * 1000 }),
  getTodos,
);
router.post(
  "/",
  authenticateUser,
  rateLimiterMiddleware({ limit: 20, windowMs: 60 * 1000 }),
  createTodo,
);
router.get("/filter", authenticateUser, getFilteredTodos);
router.patch("/:todoId", authenticateUser, updateTodo);
router.delete("/:todoId", authenticateUser, deleteTodo);
router.delete("/all", authenticateUser, deleteAllTodos);

export default router;
