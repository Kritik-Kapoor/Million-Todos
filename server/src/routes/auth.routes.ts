import { Router } from "express";
import {
  forgotPassword,
  getUser,
  Login,
  Logout,
  Register,
  resetPassword,
  sendVerificationMail,
  updateUser,
  updateUserPreferences,
  verifyAccount,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import rateLimiterMiddleware from "../middlewares/rateLimiter.middleware.js";

const router = Router();

const authRateLimiter = rateLimiterMiddleware({
  limit: 5,
  windowMs: 60 * 60 * 1000,
});

router.post("/register", authRateLimiter, Register);
router.post("/login", rateLimiterMiddleware(), Login);
router.post("/logout", Logout);
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authenticateUser, getUser);
router.post("/me", authenticateUser, updateUser);
router.post("/me/preferences", authenticateUser, updateUserPreferences);
router.post(
  "/send-verification-mail",
  authenticateUser,
  authRateLimiter,
  sendVerificationMail,
);
router.get("/verify-email", rateLimiterMiddleware(), verifyAccount);

export default router;
