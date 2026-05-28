import type { Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";

interface AccessTokenPayload {
  userId: string;
}

export const generateToken = (userId: string, res: Response) => {
  const payload: AccessTokenPayload = { userId };
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, options);

  return res.cookie("million-todos-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};
