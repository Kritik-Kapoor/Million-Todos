import { Router } from "express";
import {
  getUser,
  Login,
  Logout,
  Register,
  updateUser,
  updateUserPreferences,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";

const router = Router();

router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", Logout);
router.get("/me", authenticateUser, getUser);
router.post("/me", authenticateUser, updateUser);
router.post("/me/preferences", authenticateUser, updateUserPreferences);

export default router;
