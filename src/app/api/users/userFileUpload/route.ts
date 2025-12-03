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

  // Check if we're on Vercel (has BLOB_READ_WRITE_TOKEN automatically)
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
    return "vercel";
  }

  // Fallback to local storage
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
  try {
    const formData = await request.formData();
    const file = formData.get("project") as File;
    const userId = formData.get("userId") as string;
    const eventId = formData.get("eventId") as string;

    if (!file || !userId || !eventId) {
      return NextResponse.json(
        { error: "Missing file, userId, or eventId" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
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

    const team = eventRole.team;
    const safeTeamName = team.name.replace(/[^a-zA-Z0-9]/g, "_");
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
        const blob = await put(fileName, buffer, {
          access: "public",
          contentType: file.type,
        });
        fileUrl = blob.url;
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
    return NextResponse.json(
      { 
        error: "Failed to upload file",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
