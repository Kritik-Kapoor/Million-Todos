import type { Request, Response } from "express";

import { prisma } from "../config/db.js";

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
