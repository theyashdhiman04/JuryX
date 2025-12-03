import { NextResponse } from "next/server";
import { prisma } from "@/dbConfig/dbConfig";

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Health check failed:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    
    // Check if it's a database connection error
    const isDatabaseError = 
      errorMessage.includes("Can't reach database") ||
      errorMessage.includes("P1001") ||
      errorMessage.includes("P1003") ||
      errorMessage.includes("connection") ||
      (error && typeof error === 'object' && 'code' in error && String((error as { code: unknown }).code).startsWith('P'));
    
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: errorMessage,
        hasDatabaseUrl,
        isDatabaseError,
        message: hasDatabaseUrl
          ? "Database URL is set but connection failed. Check your DATABASE_URL format and database accessibility."
          : "DATABASE_URL environment variable is not set. Please configure it in Vercel.",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
