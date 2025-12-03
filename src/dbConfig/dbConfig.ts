// docker run --name hackview -e POSTGRES_USER=yash -e POSTGRES_PASSWORD=yash -e POSTGRES_DB=hackbox -p 5433:5432 -d postgres
// my postgres database is running locally in this 

import { PrismaClient } from "@/generated/prisma";

// Create a singleton Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Test database connection
prisma.$connect().catch((error) => {
  console.error("❌ Database connection failed:", error);
  console.error("💡 Make sure DATABASE_URL is set correctly in your environment variables");
}); 

