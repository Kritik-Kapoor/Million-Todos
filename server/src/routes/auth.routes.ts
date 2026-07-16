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

router.post(
  "/register",
  rateLimiterMiddleware({ limit: 5, windowMs: 60 * 60 * 1000 }),
  Register,
);
router.post("/login", rateLimiterMiddleware, Login);
router.post("/logout", Logout);
router.post(
  "/forgot-password",
  rateLimiterMiddleware({ limit: 5, windowMs: 60 * 60 * 1000 }),
  forgotPassword,
);
router.post("/reset-password", resetPassword);
router.get("/me", authenticateUser, getUser);
router.post("/me", authenticateUser, updateUser);
router.post("/me/preferences", authenticateUser, updateUserPreferences);
router.post(
  "/send-verification-mail",
  authenticateUser,
  rateLimiterMiddleware({ limit: 5, windowMs: 60 * 60 * 1000 }),
  sendVerificationMail,
);
router.get("/verify-email", rateLimiterMiddleware, verifyAccount);

export default router;
