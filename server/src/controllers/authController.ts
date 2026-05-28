import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";

type RegisterBody = {
  username: string;
  email: string;
  password: string;
};

type LoginBody = {
  email: string;
  password: string;
};

export const Register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as RegisterBody;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    generateToken(user.id, res);

    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        id: user.id,
        username,
        email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginBody;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    generateToken(user.id, res);

    return res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: {
        id: user.id,
        email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};

export const Logout = async (_: Request, res: Response) => {
  try {
    res.cookie("million-todos-token", "", {
      httpOnly: true,
      expires: new Date(),
    });
    return res.status(200).json({
      status: "success",
      message: "User logged out successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};
