import { Router } from "express";
import { getUser, Login, Logout, Register, } from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
const router = Router();
router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", Logout);
router.get("/me", authenticateUser, getUser);
export default router;
