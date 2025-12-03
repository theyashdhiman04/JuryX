// docker run --name hackview -e POSTGRES_USER=yash -e POSTGRES_PASSWORD=yash -e POSTGRES_DB=hackbox -p 5433:5432 -d postgres
// my postgres database is running locally in this 

import { PrismaClient } from "@/generated/prisma";

// Create a singleton Prisma client instance for serverless environments
// This prevents creating multiple instances in serverless functions (Vercel, AWS Lambda, etc.)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// In serverless environments, we need to reuse the same instance
// This works for both development and production
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
} 

