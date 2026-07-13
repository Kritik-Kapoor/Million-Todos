import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import {
  ApiError,
  ApiResponse,
  getErrorMessage,
} from "../utils/apiResponse.js";

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

    return new ApiResponse(201, subtask, "Subtask created successfully").send(
      res,
    );
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

    return new ApiResponse(200, subtask, "Subtask updated successfully").send(
      res,
    );
  } catch (error) {
    console.error(error);
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
