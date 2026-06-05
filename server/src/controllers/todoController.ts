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
      res.status(500).json({ message });
    } else {
      // Mid-stream error — send a sentinel error line so the client knows
      res.write(JSON.stringify({ error: message }) + "\n");
    }
  } finally {
    res.end();
  }
};

/**
 * GET /todos/:todoId/subtasks
 *
 * Returns every subtask for a todo (ordered by `position`) along with
 * aggregate counts so the UI can render filter pills like
 *   "All 10,000 · Completed 3,420 · Pending 6,580"
 * without a second round trip.
 */
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
    return res.status(500).json({ message });
  }
};
