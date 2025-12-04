import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { put, del } from "@vercel/blob";
import { prisma } from "@dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Storage type detection
type StorageType = "aws" | "vercel" | "local";

function getStorageType(): StorageType {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const awsRegion = process.env.AWS_REGION;
  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;

  // Check AWS S3 first
  if (bucketName && awsRegion && awsAccessKey && awsSecretKey) {
    return "aws";
  }

  // Check if we're on Vercel AND has BLOB_READ_WRITE_TOKEN
  // Vercel doesn't automatically provide this - it needs to be set manually
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return "vercel";
  }
  
  // If on Vercel but no blob token, we can't use local storage (serverless)
  // So we'll try vercel anyway and handle the error gracefully
  if (process.env.VERCEL) {
    return "vercel"; // Will fail gracefully and fall back in catch block
  }

  // Fallback to local storage (only works in non-serverless environments)
  return "local";
}

// S3Client initialization (only if AWS is configured)
let s3: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3) {
    const region = process.env.AWS_REGION!;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
    
    s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3;
}

// Local storage helper
async function saveToLocalStorage(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  // fileName includes the full path: eventId/teamName/timestamp-project.zip
  const uploadDir = join(process.cwd(), "public", "uploads", "projects");
  const filePath = join(uploadDir, fileName);
  
  // Extract directory path from fileName (everything except the filename)
  // fileName format: "eventId/teamName/timestamp-project.zip"
  // We need to get: "eventId/teamName"
  const lastSlashIndex = fileName.lastIndexOf("/");
  if (lastSlashIndex > 0) {
    const dirPath = fileName.substring(0, lastSlashIndex);
    const fullDirPath = join(uploadDir, dirPath);
    
    // Create all necessary directories recursively
    if (!existsSync(fullDirPath)) {
      await mkdir(fullDirPath, { recursive: true });
      console.log("Created directory:", fullDirPath);
    }
  }

  // Write the file
  await writeFile(filePath, buffer);
  console.log("File saved to:", filePath);

  // Return public URL
  return `/uploads/projects/${fileName}`;
}

async function deleteFromLocalStorage(fileUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    const fileName = fileUrl.replace("/uploads/projects/", "");
    const filePath = join(process.cwd(), "public", "uploads", "projects", fileName);
    
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (e) {
    console.warn("Failed to delete local file:", e);
  }
}

export async function POST(request: NextRequest) {
  // Declare variables outside try block for catch block access
  let eventId: string | null = null;
  let userId: string | null = null;
  let buffer: Buffer | null = null;
  let team: { id: string; name: string; storageUrl: string | null } | null = null;
  let safeTeamName: string = "";

  try {
    const formData = await request.formData();
    const file = formData.get("project") as File;
    userId = formData.get("userId") as string;
    eventId = formData.get("eventId") as string;

    if (!file || !userId || !eventId) {
      return NextResponse.json(
        { error: "Missing file, userId, or eventId" },
        { status: 400 }
      );
    }

    // Handle shortened event ID (last 4 characters)
    // Strip # prefix if present
    if (eventId && eventId.startsWith('#')) {
      eventId = eventId.slice(1);
    }

    // If eventId is short (4 chars or less), find the full event ID
    if (eventId && eventId.length <= 4) {
      const events = await prisma.event.findMany({
        where: {
          id: {
            endsWith: eventId,
          },
        },
        select: { id: true },
      });
      if (events.length === 1) {
        eventId = events[0].id;
      } else if (events.length === 0) {
        return NextResponse.json(
          { error: "Event not found" },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { error: "Multiple events found. Please use the full event ID." },
          { status: 400 }
        );
      }
    }

    buffer = Buffer.from(await file.arrayBuffer());
    const storageType = getStorageType();

    // 1. Find the User's Team via EventRole
    const eventRole = await prisma.eventRole.findUnique({
      where: {
        userId_eventId: {
          userId: Number(userId),
          eventId: eventId,
        },
      },
      include: {
        team: true,
      },
    });

    if (!eventRole || !eventRole.team) {
      return NextResponse.json(
        { error: "User is not part of a team for this event. Please create or join a team first." },
        { status: 404 }
      );
    }

    team = eventRole.team;
    safeTeamName = team.name.replace(/[^a-zA-Z0-9]/g, "_");
    const timestamp = Date.now();
    const fileName = `${eventId}/${safeTeamName}/${timestamp}-project.zip`;

    let fileUrl: string;

    // 2. Delete old file if exists
    if (team.storageUrl) {
      try {
        if (team.storageUrl.startsWith("https://") && team.storageUrl.includes("amazonaws.com")) {
          // AWS S3 file
          if (storageType === "aws") {
            const fileUrlObj = new URL(team.storageUrl);
            const existingKey = fileUrlObj.pathname.substring(1);
            await getS3Client().send(
              new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: existingKey,
              })
            );
          }
        } else if (team.storageUrl.startsWith("https://") && team.storageUrl.includes("blob.vercel-storage.com")) {
          // Vercel Blob file
          if (storageType === "vercel") {
            await del(team.storageUrl);
          }
        } else if (team.storageUrl.startsWith("/uploads/")) {
          // Local file
          if (storageType === "local") {
            await deleteFromLocalStorage(team.storageUrl);
          }
        }
      } catch (e) {
        console.warn("Failed to delete old file:", e);
        // Continue with upload even if deletion fails
      }
    }

    // 3. Upload new file based on storage type
    switch (storageType) {
      case "aws": {
        const bucketName = process.env.AWS_S3_BUCKET_NAME!;
        const awsRegion = process.env.AWS_REGION!;
        
        await getS3Client().send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
          })
        );
        
        fileUrl = `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${fileName}`;
        break;
      }

      case "vercel": {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          // On Vercel without blob token, we can't use local storage
          // So we'll throw an error that will be caught and handled
          throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
        }
        try {
          const blob = await put(fileName, buffer, {
            access: "public",
            contentType: file.type,
          });
          fileUrl = blob.url;
        } catch (blobError) {
          // Re-throw with more context
          if (blobError instanceof Error && blobError.message.includes("token")) {
            throw new Error("BLOB_READ_WRITE_TOKEN is not configured or invalid");
          }
          throw blobError;
        }
        break;
      }

      case "local": {
        fileUrl = await saveToLocalStorage(buffer, fileName);
        break;
      }

      default:
        throw new Error("No storage method available");
    }

    console.log(`File uploaded using ${storageType} storage at:`, fileUrl);

    // 4. Update the Team's storageUrl
    await prisma.team.update({
      where: { id: team.id },
      data: { storageUrl: fileUrl },
    });

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      storageType 
    });

  } catch (err) {
    console.error("Upload error:", err);
    
    // If Vercel Blob fails and we're NOT on Vercel, try local storage as fallback
    if (err instanceof Error && 
        (err.message.includes("BLOB_READ_WRITE_TOKEN") || err.message.includes("No token found")) && 
        !process.env.VERCEL &&
        eventId && 
        buffer && 
        team && 
        safeTeamName) {
      try {
        console.log("Falling back to local storage...");
        const fileName = `${eventId}/${safeTeamName}/${Date.now()}-project.zip`;
        const fileUrl = await saveToLocalStorage(buffer, fileName);
        
        // Update team storage URL
        await prisma.team.update({
          where: { id: team.id },
          data: { storageUrl: fileUrl },
        });
        
        return NextResponse.json({ 
          success: true, 
          url: fileUrl,
          storageType: "local",
          message: "Uploaded using local storage"
        });
      } catch (fallbackErr) {
        console.error("Fallback upload also failed:", fallbackErr);
      }
    }
    
    // Provide helpful error message for Vercel Blob configuration
    if (err instanceof Error && err.message.includes("BLOB_READ_WRITE_TOKEN")) {
      return NextResponse.json(
        { 
          error: "Storage not configured",
          details: "BLOB_READ_WRITE_TOKEN environment variable is not set. Please configure Vercel Blob storage in your Vercel project settings.",
          hint: "Go to Vercel Dashboard → Your Project → Settings → Environment Variables → Add BLOB_READ_WRITE_TOKEN"
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to upload file",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
