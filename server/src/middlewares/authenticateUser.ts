import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies["million-todos-token"];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized user, No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;

    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized user, Invalid token",
    });
  }
};
