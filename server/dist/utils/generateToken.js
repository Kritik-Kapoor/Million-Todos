import { createHash, randomBytes, randomInt } from "crypto";
import jwt from "jsonwebtoken";
export const generateToken = (userId, res) => {
    const payload = { userId };
    const options = {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d"),
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, options);
    return res.cookie("million-todos-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
};
export const generateRandomToken = () => {
    return randomBytes(32).toString("hex");
};
export const generateOtp = (length = 6) => {
    const max = 10 ** length;
    return randomInt(0, max).toString().padStart(length, "0");
};
export const generateHashedToken = (rawToken) => {
    return createHash("sha256").update(rawToken).digest("hex");
};
