import { Router } from "express";
import { createTodo, deleteAllTodos, deleteTodo, getFilteredTodos, getTodos, updateTodo, } from "../controllers/todo.controller.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
const router = Router();
// TODO Routes
router.get("/", authenticateUser, getTodos);
router.post("/", authenticateUser, createTodo);
router.get("/filter", authenticateUser, getFilteredTodos);
router.patch("/:todoId", authenticateUser, updateTodo);
router.delete("/:todoId", authenticateUser, deleteTodo);
router.delete("/all", authenticateUser, deleteAllTodos);
export default router;
