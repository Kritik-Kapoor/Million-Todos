import { createHash, randomBytes, randomInt } from "crypto";
import type { Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { setAuthCookie } from "./authCookie.js";

interface AccessTokenPayload {
  userId: string;
}

export const generateToken = (userId: string, res: Response) => {
  const payload: AccessTokenPayload = { userId };
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, options);

  return setAuthCookie(res, token);
};

export const generateRandomToken = () => {
  return randomBytes(32).toString("hex");
};

export const generateOtp = (length = 6): string => {
  const max = 10 ** length;
  return randomInt(0, max).toString().padStart(length, "0");
};

export const generateHashedToken = (rawToken: string) => {
  return createHash("sha256").update(rawToken).digest("hex");
};
