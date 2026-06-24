import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import {
  ApiError,
  ApiResponse,
  getErrorMessage,
} from "../utils/apiResponse.js";

export const getTodos = async (req: Request, res: Response) => {
  const BATCH_SIZE = 5000;

  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-cache");

  const userId = req.user!.userId;
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
    const message = getErrorMessage(error);
    if (!res.headersSent) {
      new ApiError(500, message).send(res);
    } else {
      // Mid-stream error — send a sentinel error line so the client knows
      res.write(JSON.stringify({ error: message }) + "\n");
    }
  } finally {
    res.end();
  }
};

export const createTodo = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, labels, dueDate } = req.body as {
      title: string;
      dueDate?: string;
      labels?: string[];
    };

    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    if (!trimmedTitle) {
      return new ApiError(400, "Title is required").send(res);
    }

    const labelIds = Array.isArray(labels)
      ? [...new Set(labels.filter((id) => typeof id === "string" && id))]
      : [];

    if (labelIds.length > 0) {
      const ownedLabels = await prisma.label.findMany({
        where: { userId, id: { in: labelIds } },
        select: { id: true },
      });

      if (ownedLabels.length !== labelIds.length) {
        return new ApiError(400, "One or more labels are invalid").send(res);
      }
    }

    const todo = await prisma.todo.create({
      data: {
        userId,
        title: trimmedTitle,
        ...(dueDate && {
          dueDate: new Date(dueDate),
        }),
        ...(labelIds.length > 0 && {
          labels: {
            create: labelIds.map((labelId) => ({
              label: { connect: { id: labelId } },
            })),
          },
        }),
      },
    });

    return new ApiResponse(201, todo, "Todo created successfully").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const todoId = req.params.todoId as string;
    const userId = req.user?.userId;

    if (!todoId) {
      return new ApiError(400, "Todo id is required").send(res);
    }

    await prisma.todo.delete({
      where: { id: todoId, userId },
    });

    return new ApiResponse(200, null, "Todo deleted successfully").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {
    const todoId = req.params.todoId as string;
    const userId = req.user!.userId;

    if (!todoId) {
      return new ApiError(400, "Todo id is required").send(res);
    }

    const todo = await prisma.todo.update({
      where: { id: todoId, userId },
      data: req.body,
    });

    return new ApiResponse(200, todo, "Todo updated successfully").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

// Subtasks
export const getSubtasksForTodo = async (req: Request, res: Response) => {
  try {
    const todoId = req.params.todoId as string;

    if (!todoId) {
      return new ApiError(400, "Todo id is required").send(res);
    }

    const subtasks = await prisma.subtask.findMany({
      where: { todoId },
      orderBy: { position: "asc" },
    });

    let completed = 0;
    for (const subtask of subtasks) {
      if (subtask.completed) completed += 1;
    }

    return new ApiResponse(200, {
      subtasks,
      counts: {
        all: subtasks.length,
        completed,
        pending: subtasks.length - completed,
      },
    }).send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const updateSubtask = async (req: Request, res: Response) => {
  try {
    const subtaskId = req.params.subtaskId as string;

    if (!subtaskId) {
      return new ApiError(400, "Subtask id is required").send(res);
    }

    const subtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: req.body,
    });

    return new ApiResponse(
      200,
      { subtask },
      "Subtask updated successfully",
    ).send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const createSubtask = async (req: Request, res: Response) => {
  try {
    const todoId = req.params.todoId as string;
    const userId = req.user!.userId;
    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";

    if (!todoId) {
      return new ApiError(400, "Todo id is required").send(res);
    }

    if (!title) {
      return new ApiError(400, "Title is required").send(res);
    }

    const todo = await prisma.todo.findFirst({
      where: { id: todoId, userId },
    });

    if (!todo) {
      return new ApiError(404, "Todo not found").send(res);
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

    return new ApiResponse(
      201,
      { subtask },
      "Subtask created successfully",
    ).send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const deleteSubtask = async (req: Request, res: Response) => {
  try {
    const subtaskId = req.params.subtaskId as string;

    if (!subtaskId) {
      return new ApiError(400, "Subtask id is required").send(res);
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

    return new ApiResponse(200, null, "Subtask deleted successfully").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};
