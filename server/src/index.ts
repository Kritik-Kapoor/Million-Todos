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

dotenv.config();
connectDB();

const corsOptions: cors.CorsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_ORIGIN
      : "http://localhost:3000",
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/todos", todoRoutes);
app.use("/labels", labelRoutes);
app.use("/subtasks", subtaskRoutes);

const port = process.env.PORT ?? "3001";

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startReminderJob();
});
