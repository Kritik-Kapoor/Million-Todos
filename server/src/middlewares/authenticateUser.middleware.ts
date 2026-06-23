import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiResponse.js";

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies["million-todos-token"];

    if (!token)
      return new ApiError(401, "Unauthorized user, No token provided").send(
        res,
      );

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;

    if (!decoded.userId)
      return new ApiError(401, "Unauthorized user, Invalid token").send(res);

    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch {
    return new ApiError(401, "Unauthorized user, Invalid token").send(res);
  }
};
