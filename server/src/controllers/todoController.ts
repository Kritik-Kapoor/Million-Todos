import type { Request, Response } from "express";

import { prisma } from "../config/db.js";

export const getTodos = async (req: Request, res: Response) => {
  const BATCH_SIZE = 5000;

  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-cache");

  const userId = req.user?.userId;
  let cursor: number | undefined = undefined;
  type TodoRow = Awaited<ReturnType<typeof prisma.todo.findMany>>[number];
  let todos: TodoRow[] = [];

  try {
    while (true) {
      todos = await prisma.todo.findMany({
        where: { userId },
        take: BATCH_SIZE,
        orderBy: { seq: "asc" },
        ...(cursor !== undefined ? { skip: 1, cursor: { seq: cursor } } : {}),
      });

      if (todos.length === 0) break;

      for (const todo of todos) {
        res.write(JSON.stringify(todo) + "\n");
      }

      cursor = todos[todos.length - 1]!.seq;

      // Fewer rows than requested means we've reached the last batch
      if (todos.length < BATCH_SIZE) break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (!res.headersSent) {
      // Error before streaming started — can still set status
      res.status(500).json({ state: "error", message });
    } else {
      // Mid-stream error — send a sentinel error line so the client knows
      res.write(JSON.stringify({ error: message }) + "\n");
    }
  } finally {
    res.end();
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const todoId = req.params.todoId as string;
    const userId = req.user?.userId;

    if (!todoId)
      return res.status(400).json({ message: "Todo id is required" });

    await prisma.todo.delete({
      where: { id: todoId, userId },
    });

    return res.status(200).json({
      status: "success",
      message: "Todo deleted successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ state: "error", message });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {
    const todoId = req.params.todoId as string;
    const userId = req.user?.userId;

    if (!todoId) {
      return res.status(400).json({ message: "Todo id is required" });
    }

    const todo = await prisma.todo.update({
      where: { id: todoId, userId },
      data: req.body,
    });

    return res.status(200).json({
      status: "success",
      message: "Todo updated successfully",
      data: { todo },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ state: "error", message });
  }
};

// Subtasks
export const getSubtasksForTodo = async (req: Request, res: Response) => {
  try {
    const todoId = req.params.todoId as string;

    if (!todoId) {
      return res.status(400).json({ message: "Todo id is required" });
    }

    const subtasks = await prisma.subtask.findMany({
      where: { todoId },
      orderBy: { position: "asc" },
    });

    let completed = 0;
    for (const subtask of subtasks) {
      if (subtask.completed) completed += 1;
    }

    return res.status(200).json({
      status: "success",
      data: {
        subtasks,
        counts: {
          all: subtasks.length,
          completed,
          pending: subtasks.length - completed,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ state: "error", message });
  }
};

export const updateSubtask = async (req: Request, res: Response) => {
  try {
    const subtaskId = req.params.subtaskId as string;

    if (!subtaskId) {
      return res.status(400).json({ message: "Subtask id is required" });
    }

    const subtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: req.body,
    });

    return res.status(200).json({
      status: "success",
      message: "Subtask updated successfully",
      data: { subtask },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ state: "error", message });
  }
};

export const createSubtask = async (req: Request, res: Response) => {
  try {
    const todoId = req.params.todoId as string;
    const userId = req.user?.userId;
    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";

    if (!todoId) {
      return res.status(400).json({ message: "Todo id is required" });
    }

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const todo = await prisma.todo.findFirst({
      where: { id: todoId, userId },
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const lastSubtask = await prisma.subtask.findFirst({
      where: { todoId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const POSITION_STEP = 1000;
    const position = lastSubtask
      ? lastSubtask.position + POSITION_STEP
      : POSITION_STEP;

    const subtask = await prisma.$transaction(async (tx) => {
      const created = await tx.subtask.create({
        data: { todoId, title, position },
      });

      await tx.todo.update({
        where: { id: todoId },
        data: { subtaskCount: { increment: 1 } },
      });

      return created;
    });

    return res.status(201).json({
      status: "success",
      message: "Subtask created successfully",
      data: { subtask },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ state: "error", message });
  }
};

export const deleteSubtask = async (req: Request, res: Response) => {
  try {
    const subtaskId = req.params.subtaskId as string;

    if (!subtaskId) {
      return res.status(400).json({ message: "Subtask id is required" });
    }

    await prisma.$transaction(async (tx) => {
      const subtask = await tx.subtask.delete({
        where: { id: subtaskId },
      });

      await tx.todo.update({
        where: { id: subtask.todoId },
        data: { subtaskCount: { decrement: 1 } },
      });
    });

    return res
      .status(200)
      .json({ status: "success", message: "Subtask deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ state: "error", message });
  }
};
