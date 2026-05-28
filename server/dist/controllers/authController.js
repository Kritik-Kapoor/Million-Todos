import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";
export const Register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await prisma.user.findUnique({
            where: { email },
        });
        if (userExists) {
            return res
                .status(400)
                .json({ message: "User with this email already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await prisma.user.create({
            data: { username, email, password: hashedPassword },
        });
        generateToken(user.id, res);
        return res.status(201).json({
            status: "success",
            message: "User created successfully",
            data: {
                id: user.id,
                username,
                email,
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ message });
    }
};
export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        generateToken(user.id, res);
        return res.status(200).json({
            status: "success",
            message: "User logged in successfully",
            data: {
                id: user.id,
                email,
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ message });
    }
};
export const Logout = async (_, res) => {
    try {
        res.cookie("million-todos-token", "", {
            httpOnly: true,
            expires: new Date(),
        });
        return res.status(200).json({
            status: "success",
            message: "User logged out successfully",
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ message });
    }
};
