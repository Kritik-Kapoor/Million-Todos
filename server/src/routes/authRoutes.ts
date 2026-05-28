import { Router } from "express";
import {
  getUser,
  Login,
  Logout,
  Register,
} from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = Router();

router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", Logout);
router.get("/me", authenticateUser, getUser);

export default router;
