import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
dotenv.config();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}
const prisma = new PrismaClient({
    adapter: new PrismaPg(databaseUrl),
    log: process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
});
const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Connected to the database");
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Error connecting to the database", message);
        process.exit(1);
    }
};
const disconnectDB = async () => {
    await prisma.$disconnect();
    console.log("Disconnected from the database");
};
export { prisma, connectDB, disconnectDB };
