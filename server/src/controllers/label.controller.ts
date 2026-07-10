import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  ApiError,
  ApiResponse,
  getErrorMessage,
} from "../utils/apiResponse.js";
import { prisma } from "../config/db.js";

const LABEL_RETURN_OPTIONS = {
  id: true,
  name: true,
  color: true,
} as const;

export const createLabel = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, color } = req.body as { name: string; color: string };

    if (!name || !color) {
      return new ApiError(400, "Name and color are required").send(res);
    }

    const label = await prisma.label.create({
      data: {
        userId,
        name,
        color,
      },
      select: LABEL_RETURN_OPTIONS,
    });

    return new ApiResponse(201, label, "Label created successfully").send(res);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return new ApiError(
        409,
        "A label with this name already exists",
      ).send(res);
    }

    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const getLabels = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const labels = await prisma.label.findMany({
      where: { userId },
      select: LABEL_RETURN_OPTIONS,
    });

    return new ApiResponse(200, labels, "Labels fetched successfully").send(
      res,
    );
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const updateLabel = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const labelId = req.params.labelId as string;

    if (!labelId) return new ApiError(400, "Label id is required").send(res);

    const label = await prisma.label.update({
      where: { id: labelId, userId },
      data: req.body,
      select: LABEL_RETURN_OPTIONS,
    });

    return new ApiResponse(200, label, "Label updated successfully").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const deleteLabel = async (req: Request, res: Response) => {
  try {
    const labelId = req.params.labelId as string;

    if (!labelId) return new ApiError(400, "Label id is required").send(res);

    await prisma.label.delete({
      where: { id: labelId },
    });

    return new ApiResponse(200, null, "Label deleted successfully").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};
