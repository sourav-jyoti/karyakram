import { prisma } from "../lib/prisma.js";

export async function connectDB(): Promise<void> {
    try {
        await prisma.$connect();
        console.log("Database connected");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

export async function disconnectDB(): Promise<void> {
    await prisma.$disconnect();
    console.log("Database disconnected");
}
