import { timingSafeEqual } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiResponse.js";

export const authenticateCron = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is not configured");
    return new ApiError(500, "Internal Server Error").send(res);
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return new ApiError(401, "Unauthorized cron request").send(res);
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) return new ApiError(401, "Unauthorized cron request").send(res);

  const expectedBuffer = Buffer.from(cronSecret);
  const receivedBuffer = Buffer.from(token);

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return new ApiError(401, "Unauthorized cron request").send(res);
  }

  next();
};
