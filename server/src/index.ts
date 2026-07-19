import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import labelRoutes from "./routes/label.routes.js";
import todoRoutes from "./routes/todo.routes.js";
import subtaskRoutes from "./routes/subtask.routes.js";
import { startReminderJob } from "./jobs/reminder.job.js";
import cronRoutes from "./routes/cron.routes.js";
import { authenticateCron } from "./middlewares/authenticateCron.middleware.js";
import { authenticateUser } from "./middlewares/authenticateUser.middleware.js";
import { ApiResponse } from "./utils/apiResponse.js";

dotenv.config();
connectDB();

const corsOptions: cors.CorsOptions = {
  origin: process.env.WEBAPP_URL,
  credentials: true,
};

const app = express();

app.set("trust proxy", 1);

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/health", (_req, res) => {
  return new ApiResponse(200, null, "SERVER IS CONNECTED").send(res);
});
app.use("/auth", authRoutes);
app.use("/todos", authenticateUser, todoRoutes);
app.use("/labels", authenticateUser, labelRoutes);
app.use("/subtasks", authenticateUser, subtaskRoutes);
app.use("/cron", authenticateCron, cronRoutes);

const port = process.env.PORT ?? "3001";

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  if (process.env.NODE_ENV === "development") {
    startReminderJob();
  }
});
