import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";
import {
  ApiError,
  ApiResponse,
  getErrorMessage,
} from "../utils/apiResponse.js";

type RegisterBody = {
  username: string;
  email: string;
  password: string;
};

type LoginBody = {
  email: string;
  password: string;
};

const USER_RETURN_OPTIONS = {
  username: true,
  email: true,
  dueDateReminder: true,
  dailyDigest: true,
} as const;

export const Register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as RegisterBody;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return new ApiError(400, "User with this email already exists").send(res);
    }

    if (password.length < 8) {
      return new ApiError(
        400,
        "Password must be at least 8 characters long",
      ).send(res);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
      select: { id: true, ...USER_RETURN_OPTIONS },
    });

    generateToken(user.id, res);

    const { id, ...publicUserDetails } = user;

    return new ApiResponse(
      201,
      publicUserDetails,
      "User created successfully",
    ).send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginBody;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, ...USER_RETURN_OPTIONS },
    });

    if (!user) {
      return new ApiError(401, "Invalid email or password").send(res);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new ApiError(401, "Invalid email or password").send(res);
    }

    generateToken(user.id, res);

    const { id, password: _, ...publicUserDetails } = user;

    return new ApiResponse(
      200,
      publicUserDetails,
      "User logged in successfully",
    ).send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const Logout = async (_: Request, res: Response) => {
  try {
    res.cookie("million-todos-token", "", {
      httpOnly: true,
      expires: new Date(),
    });
    return new ApiResponse(200, null, "User logged out successfully").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_RETURN_OPTIONS,
    });

    if (!user) {
      return new ApiError(404, "User not found").send(res);
    }

    return new ApiResponse(200, user, "User fetched successfully").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { username, password } = req.body as {
      username: string;
      password?: string;
    };

    if (!username) {
      return new ApiError(400, "Display name is required").send(res);
    }

    const updateData: { username: string; password?: string } = {
      username,
    };

    if (password) {
      if (password.length < 8) {
        return new ApiError(
          400,
          "Password must be at least 8 characters long",
        ).send(res);
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: USER_RETURN_OPTIONS,
    });

    return new ApiResponse(200, user, "Account updated successfully").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { dueDateReminder, dailyDigest } = req.body as {
      dueDateReminder: boolean;
      dailyDigest: boolean;
    };

    if (dueDateReminder === undefined || dailyDigest === undefined) {
      return new ApiError(
        400,
        "Invalid input, both dueDateReminder and dailyDigest must be provided",
      ).send(res);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: req.body,
      select: USER_RETURN_OPTIONS,
    });

    return new ApiResponse(
      200,
      user,
      "User preferences updated successfully",
    ).send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};
