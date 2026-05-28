import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
dotenv.config();
connectDB();
const corsOptions = {
    origin: process.env.NODE_ENV === "production"
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
const port = process.env.PORT ?? "3001";
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
