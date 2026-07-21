import { Router } from "express";
import { createLabel, deleteLabel, getLabels, updateLabel, } from "../controllers/label.controller.js";
const router = Router();
router.get("/", getLabels);
router.post("/", createLabel);
router.patch("/:labelId", updateLabel);
router.delete("/:labelId", deleteLabel);
export default router;
