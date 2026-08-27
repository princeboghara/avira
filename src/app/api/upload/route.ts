import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getSession, getAdminSession } from "@/lib/auth";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication Guard: Must be authenticated member or admin
    const memberSession = await getSession(req);
    const adminSession = await getAdminSession(req);

    if (!memberSession && !adminSession) {
      return NextResponse.json(
        { success: false, message: "Authentication required to upload assets." },
        { status: 401 }
      );
    }

    let file = "";
    let folder = "general";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      file = body.file || body.image || body.fileBase64 || body.url || "";
      folder = body.folder || "general";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const fileEntry = formData.get("file") || formData.get("image");
      folder = (formData.get("folder") as string) || "general";

      if (fileEntry && typeof fileEntry === "object" && "arrayBuffer" in fileEntry) {
        const blob = fileEntry as Blob;
        if (blob.size > MAX_FILE_SIZE_BYTES) {
          return NextResponse.json(
            { success: false, message: "File exceeds 5MB limit." },
            { status: 413 }
          );
        }

        if (blob.type && !ALLOWED_MIME_TYPES.includes(blob.type.toLowerCase())) {
          return NextResponse.json(
            { success: false, message: `Unsupported file type: ${blob.type}. Allowed types: JPEG, PNG, WebP, PDF.` },
            { status: 415 }
          );
        }

        const buffer = Buffer.from(await blob.arrayBuffer());
        const mimeType = blob.type || "image/jpeg";
        file = `data:${mimeType};base64,${buffer.toString("base64")}`;
      } else if (typeof fileEntry === "string") {
        file = fileEntry;
      }
    }

    if (!file || typeof file !== "string") {
      return NextResponse.json(
        { success: false, message: "No valid image or document file provided for upload" },
        { status: 400 }
      );
    }

    // Check base64 string size if provided via JSON
    if (file.startsWith("data:") && file.length > MAX_FILE_SIZE_BYTES * 1.37) {
      return NextResponse.json(
        { success: false, message: "File exceeds 5MB limit." },
        { status: 413 }
      );
    }

    // Sanitize folder path to allow subdirectories (e.g. kyc/aadhar) while preventing path traversal
    const cleanFolder = folder
      .replace(/\.\./g, "")
      .replace(/[^a-zA-Z0-9_\/-]/g, "")
      .replace(/^\/+|\/+$/g, "");

    const uploadedUrl = await uploadToCloudinary(file, cleanFolder);

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload image";
    console.error("Upload API error:", error);
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
