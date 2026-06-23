import type { Response } from "express";

export class ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;

  constructor(statusCode: number, data: T | null, message = "Success") {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  send(res: Response) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

export class ApiError extends Error {
  statusCode: number;
  success: boolean;
  errors: unknown[];

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: unknown[] = [],
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }

  send(res: Response) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      errors: this.errors,
    });
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
