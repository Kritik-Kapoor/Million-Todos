import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import {
  generateHashedToken,
  generateOtp,
  generateRandomToken,
  generateToken,
} from "../utils/generateToken.js";
import {
  ApiError,
  ApiResponse,
  getErrorMessage,
} from "../utils/apiResponse.js";
import { TokenType } from "@prisma/client";
import { emailService } from "../services/email/email.service.js";
import { parseDurationMs } from "../utils/dateTime.js";

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
  emailReminder: true,
  isEmailVerified: true,
} as const;

export const Register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as RegisterBody;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists)
      return new ApiError(400, "User with this email already exists").send(res);

    if (password.length < 8)
      return new ApiError(
        400,
        "Password must be at least 8 characters long",
      ).send(res);

    const hashedPassword = await bcrypt.hash(password, 10);

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

    if (!user) return new ApiError(401, "Invalid email or password").send(res);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return new ApiError(401, "Invalid email or password").send(res);

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
    res.clearCookie("million-todos-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      domain: ".kritikkapoor.in",
      path: "/",
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

    if (!user) return new ApiError(404, "User not found").send(res);

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

    if (!username)
      return new ApiError(400, "Display name is required").send(res);

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

      updateData.password = await bcrypt.hash(password, 10);
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
    const { dueDateReminder, emailReminder } = req.body as {
      dueDateReminder: boolean;
      emailReminder: boolean;
    };

    if (dueDateReminder === undefined || emailReminder === undefined) {
      return new ApiError(
        400,
        "Invalid input, both dueDateReminder and emailReminder must be provided",
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return new ApiResponse(
        200,
        null,
        "If an account with that email exists, we've sent a password reset link.",
      ).send(res);
    }

    const rawToken = generateRandomToken();
    const tokenHash = generateHashedToken(rawToken);

    const storeToken = await prisma.$transaction(async (tx) => {
      await tx.userTokens.deleteMany({
        where: {
          userId: user.id,
          type: TokenType.PASSWORD_RESET,
          usedAt: null,
        },
      });
      return await tx.userTokens.create({
        data: {
          userId: user.id,
          type: TokenType.PASSWORD_RESET,
          tokenHash,
          expiresAt: new Date(
            Date.now() +
              parseDurationMs(process.env.RESET_PASSWORD_EXPIRES_IN ?? "15m"),
          ),
        },
      });
    });

    if (!storeToken)
      return new ApiError(500, "Failed to generate password reset mail").send(
        res,
      );

    const { success } = await emailService.sendPasswordResetEmail({
      to: user.email,
      username: user.username,
      passwordResetToken: rawToken,
    });

    if (!success)
      return new ApiError(500, "Failed to send password reset email").send(res);

    return new ApiResponse(
      200,
      null,
      "If an account with that email exists, we've sent a password reset link.",
    ).send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetPasswordToken, newPassword } = req.body as {
      resetPasswordToken: string;
      newPassword: string;
    };

    if (!resetPasswordToken || !newPassword)
      return new ApiError(
        400,
        "Failed to reset password. Token and password are required",
      ).send(res);

    if (newPassword.length < 8)
      return new ApiError(
        400,
        "Password must be at least 8 characters long",
      ).send(res);

    const tokenHash = generateHashedToken(resetPasswordToken);

    const isTokenValid = await prisma.userTokens.findFirst({
      where: {
        tokenHash,
        type: TokenType.PASSWORD_RESET,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!isTokenValid) {
      return new ApiError(400, "Invalid or expired link").send(res);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: isTokenValid.userId },
        data: { password: hashedPassword },
      }),
      prisma.userTokens.updateMany({
        where: {
          userId: isTokenValid.userId,
          type: TokenType.PASSWORD_RESET,
          usedAt: null,
        },
        data: { usedAt: new Date() },
      }),
    ]);

    return new ApiResponse(200, null, "Password reset successfully").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const sendVerificationMail = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true, isEmailVerified: true },
    });

    if (!user) return new ApiError(404, "User not found").send(res);

    if (user.isEmailVerified)
      return new ApiError(400, "Email already verified").send(res);

    const verificationToken = generateOtp();
    const hashedVerificationToken = generateHashedToken(verificationToken);

    const storeToken = await prisma.$transaction(async (tx) => {
      await tx.userTokens.deleteMany({
        where: {
          userId,
          type: TokenType.EMAIL_VERIFICATION,
          usedAt: null,
        },
      });
      return await tx.userTokens.create({
        data: {
          userId,
          type: TokenType.EMAIL_VERIFICATION,
          tokenHash: hashedVerificationToken,
          expiresAt: new Date(
            Date.now() +
              parseDurationMs(
                process.env.EMAIL_VERIFICATION_EXPIRES_IN ?? "1hr",
              ),
          ),
        },
      });
    });

    if (!storeToken)
      return new ApiError(500, "Failed to generate verification mail").send(
        res,
      );

    const { success } = await emailService.sendVerificationEmail({
      to: user.email,
      username: user.username,
      verificationToken,
    });

    if (!success)
      return new ApiError(500, "Failed to send verification email").send(res);

    return new ApiResponse(200, null, "Verification email sent").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.query as { token: string; email: string };

    if (!token || !email)
      return new ApiError(400, "Token and email are required").send(res);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isEmailVerified: true },
    });

    if (!user) return new ApiError(400, "Invalid or expired link").send(res);

    if (user.isEmailVerified)
      return new ApiResponse(200, null, "Account already verified").send(res);

    const tokenHash = generateHashedToken(token);

    const isTokenValid = await prisma.userTokens.findFirst({
      where: {
        userId: user.id,
        type: TokenType.EMAIL_VERIFICATION,
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!isTokenValid)
      return new ApiError(400, "Invalid or expired link").send(res);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });
      await tx.userTokens.updateMany({
        where: {
          userId: user.id,
          type: TokenType.EMAIL_VERIFICATION,
          usedAt: null,
        },
        data: { usedAt: new Date() },
      });
    });

    return new ApiResponse(200, null, "Account verified").send(res);
  } catch (error) {
    return new ApiError(500, getErrorMessage(error)).send(res);
  }
};
