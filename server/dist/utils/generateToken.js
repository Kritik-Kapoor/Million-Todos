import { createHash, randomBytes, randomInt } from "crypto";
import jwt from "jsonwebtoken";
import { setAuthCookie } from "./authCookie.js";
export const generateToken = (userId, res) => {
    const payload = { userId };
    const options = {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d"),
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, options);
    return setAuthCookie(res, token);
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
