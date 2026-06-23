import { Router } from "express";
import {
  createLabel,
  deleteLabel,
  getLabels,
  updateLabel,
} from "../controllers/label.controller.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";

const router = Router();

router.get("/", authenticateUser, getLabels);
router.post("/", authenticateUser, createLabel);
router.post("/:labelId", authenticateUser, updateLabel);
router.delete("/:labelId", authenticateUser, deleteLabel);

export default router;
