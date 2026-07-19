import { Router } from "express";
import {
  createTodo,
  deleteAllTodos,
  deleteTodo,
  getFilteredTodos,
  getTodos,
  updateTodo,
} from "../controllers/todo.controller.js";
import rateLimiterMiddleware from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.get(
  "/",
  rateLimiterMiddleware({ limit: 8, windowMs: 60 * 1000 }),
  getTodos,
);
router.post(
  "/",
  rateLimiterMiddleware({ limit: 20, windowMs: 60 * 1000 }),
  createTodo,
);
router.get("/filter", getFilteredTodos);
router.patch("/:todoId", updateTodo);
router.delete("/:todoId", deleteTodo);
router.delete("/all", deleteAllTodos);

export default router;
