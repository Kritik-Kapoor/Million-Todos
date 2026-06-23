import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";
import { ApiError, ApiResponse, getErrorMessage, } from "../utils/apiResponse.js";
export const Register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await prisma.user.findUnique({
            where: { email },
        });
        if (userExists) {
            return new ApiError(400, "User with this email already exists").send(res);
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await prisma.user.create({
            data: { username, email, password: hashedPassword },
        });
        generateToken(user.id, res);
        return new ApiResponse(201, { id: user.id, username, email }, "User created successfully").send(res);
    }
    catch (error) {
        return new ApiError(500, getErrorMessage(error)).send(res);
    }
};
export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return new ApiError(401, "Invalid email or password").send(res);
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return new ApiError(401, "Invalid email or password").send(res);
        }
        generateToken(user.id, res);
        return new ApiResponse(200, { id: user.id, email }, "User logged in successfully").send(res);
    }
    catch (error) {
        return new ApiError(500, getErrorMessage(error)).send(res);
    }
};
export const Logout = async (_, res) => {
    try {
        res.cookie("million-todos-token", "", {
            httpOnly: true,
            expires: new Date(),
        });
        return new ApiResponse(200, null, "User logged out successfully").send(res);
    }
    catch (error) {
        return new ApiError(500, getErrorMessage(error)).send(res);
    }
};
export const getUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return new ApiError(401, "Unauthorized user").send(res);
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return new ApiError(404, "User not found").send(res);
        }
        return new ApiResponse(200, { id: user.id, username: user.username, email: user.email }, "User fetched successfully").send(res);
    }
    catch (error) {
        return new ApiError(500, getErrorMessage(error)).send(res);
    }
};
