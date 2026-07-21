import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import type { Todo } from "@prisma/client";
import { prisma } from "../config/db.js";
import {
  ApiError,
  ApiResponse,
  getErrorMessage,
} from "../utils/apiResponse.js";

const TODO_DESCRIPTION_MAX_LENGTH = 300;

const LABELS_INCLUDE = {
  labels: {
    select: {
      label: { select: { id: true, name: true, color: true } },
    },
  },
} satisfies Prisma.TodoInclude;

type TodoWithLabels = Prisma.TodoGetPayload<{ include: typeof LABELS_INCLUDE }>;

function formatTodoWithLabels({ labels: todoLabels, ...todo }: TodoWithLabels) {
  return {
    ...todo,
    labels: todoLabels.map(({ label }) => label),
  };
}

export const getTodos = async (req: Request, res: Response) => {
  const BATCH_SIZE = 5000;

  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-cache");

  const userId = req.user!.userId;

  type TodoRow = Prisma.TodoGetPayload<{ include: typeof LABELS_INCLUDE }>;

  let cursor: number | undefined = undefined;
  let todos: TodoRow[] = [];

  try {
    console.time("stream");
    while (true) {
      todos = await prisma.todo.findMany({
        where: { userId },
        take: BATCH_SIZE,
        orderBy: { seq: "asc" },
        include: LABELS_INCLUDE,
        ...(cursor !== undefined ? { skip: 1, cursor: { seq: cursor } } : {}),
      });

      if (todos.length === 0) break;

      for (const { labels: todoLabels, ...todo } of todos) {
        res.write(
          JSON.stringify({
            ...todo,
            labels: todoLabels.map(({ label }) => label),
          }) + "\n",
        );
      }

      cursor = todos[todos.length - 1]!.seq;

      // Fewer rows than requested means we've reached the last batch
      if (todos.length < BATCH_SIZE) break;
    }

    console.timeEnd("stream");
  } catch (error) {
    const message = getErrorMessage(error);
    if (!res.headersSent) {
      new ApiError(500, message).send(res);
    } else {
      // Mid-stream error
      res.write(JSON.stringify({ error: message }) + "\n");
    }
  } finally {
    res.end();
  }
};

export const getFilteredTodos = async (req: Request, res: Response) => {
  const BATCH_SIZE = 5000;

  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-cache");

  try {
    const userId = req.user!.userId;

    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const labelIds: string[] = Array.isArray(req.query.labelIds)
      ? (req.query.labelIds as string[])
      : req.query.labelIds
        ? [req.query.labelIds as string]
        : [];
    const rawDueDateFrom =
      typeof req.query.dueDateFrom === "string"
        ? req.query.dueDateFrom
        : undefined;
    const rawDueDateTo =
      typeof req.query.dueDateTo === "string" ? req.query.dueDateTo : undefined;

    let dueDateFrom: Date | undefined;
    let dueDateTo: Date | undefined;

    if (rawDueDateFrom) {
      dueDateFrom = new Date(rawDueDateFrom);
      if (Number.isNaN(dueDateFrom.getTime())) {
        return new ApiError(400, "Invalid dueDateFrom").send(res);
      }
    }

    if (rawDueDateTo) {
      dueDateTo = new Date(rawDueDateTo);
      if (Number.isNaN(dueDateTo.getTime())) {
        return new ApiError(400, "Invalid dueDateTo").send(res);
      }
    }

    let where = Prisma.sql`t."userId" = ${userId}`;

    if (search?.trim()) {
      const tsquery = search
        .trim()
        .split(/\s+/)
        .map((word) => `${word}:*`)
        .join(" & ");
      where = Prisma.sql`${where} AND t.search_vector @@ to_tsquery('english', ${tsquery})`;
    }

    if (labelIds.length > 0) {
      const idSqls = labelIds.map((id) => Prisma.sql`${id}`);
      const inList = idSqls
        .slice(1)
        .reduce((acc, cur) => Prisma.sql`${acc}, ${cur}`, idSqls[0]!);
      where = Prisma.sql`${where} AND EXISTS (
        SELECT 1 FROM "TodoLabel" tl
        WHERE tl."todoId" = t.id
          AND tl."labelId" IN (${inList})
      )`;
    }

    if (dueDateFrom) {
      where = Prisma.sql`${where} AND t."dueDate" >= ${dueDateFrom}`;
    }

    if (dueDateTo) {
      where = Prisma.sql`${where} AND t."dueDate" < ${dueDateTo}`;
    }

    let cursor: number | undefined = undefined;

    while (true) {
      const cursorClause: Prisma.Sql =
        cursor !== undefined
          ? Prisma.sql`AND t."seq" > ${cursor}`
          : Prisma.empty;

      const rows: (Todo & {
        seq: bigint;
        labels: Array<{ id: string; name: string; color: string }>;
      })[] = await prisma.$queryRaw`
        SELECT
          t."id", t."seq", t."userId", t."title", t."description",
          t."completed", t."dueDate", t."createdAt", t."updatedAt",
          t."subtaskCount", t."hasLabels",
          COALESCE(
            (
              SELECT json_agg(json_build_object('id', l."id", 'name', l."name", 'color', l."color"))
              FROM "TodoLabel" tl
              JOIN "Label" l ON tl."labelId" = l."id"
              WHERE tl."todoId" = t."id"
            ),
            '[]'::json
          ) AS labels
        FROM "Todo" t
        WHERE ${where} ${cursorClause}
        ORDER BY t."seq" ASC
        LIMIT ${BATCH_SIZE}
      `;

      if (rows.length === 0) break;

      for (const todo of rows) {
        res.write(JSON.stringify(todo) + "\n");
      }

      cursor = rows[rows.length - 1]!.seq;

      if (rows.length < BATCH_SIZE) break;
    }
  } catch (error) {
    const message = getErrorMessage(error);
    if (!res.headersSent) {
      new ApiError(500, message).send(res);
    } else {
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
        hasLabels: labelIds.length > 0,
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
      include: LABELS_INCLUDE,
    });

    return new ApiResponse(
      201,
      formatTodoWithLabels(todo),
      "Todo created successfully",
    ).send(res);
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

    const { title, completed, dueDate, labels, description } = req.body as {
      title?: string;
      completed?: boolean;
      dueDate?: string | null;
      labels?: string[];
      description?: string;
    };

    const data: Prisma.TodoUpdateInput = {};

    if (title !== undefined) {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        return new ApiError(400, "Title is required").send(res);
      }
      data.title = trimmedTitle;
    }

    if (description !== undefined) {
      const trimmedDescription = description.trim();
      if (!trimmedDescription) {
        return new ApiError(400, "Description is required").send(res);
      }
      if (trimmedDescription.length > TODO_DESCRIPTION_MAX_LENGTH) {
        return new ApiError(
          400,
          `Description must be at most ${TODO_DESCRIPTION_MAX_LENGTH} characters`,
        ).send(res);
      }
      data.description = trimmedDescription;
    }

    if (completed !== undefined) {
      data.completed = completed;
    }

    if (dueDate !== undefined) {
      data.dueDate = dueDate === null ? null : new Date(dueDate);
    }

    if (labels !== undefined) {
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

      data.hasLabels = labelIds.length > 0;
      data.labels = {
        deleteMany: {},
        ...(labelIds.length > 0 && {
          create: labelIds.map((labelId) => ({
            label: { connect: { id: labelId } },
          })),
        }),
      };
    }

    if (Object.keys(data).length === 0) {
      return new ApiError(400, "No valid fields to update").send(res);
    }

    const todo = await prisma.todo.update({
      where: { id: todoId, userId },
      data,
      include: LABELS_INCLUDE,
    });

    return new ApiResponse(
      200,
      formatTodoWithLabels(todo),
      "Todo updated successfully",
    ).send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const deleteAllTodos = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    await prisma.todo.deleteMany({
      where: { userId },
    });

    return new ApiResponse(200, null, "All todos deleted successfully").send(
      res,
    );
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};
