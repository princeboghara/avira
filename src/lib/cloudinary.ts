import { v2 as cloudinary } from "cloudinary";

function getCloudinaryConfig() {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  return { cloudName, apiKey, apiSecret };
}

/**
 * Uploads a base64 image or file URL to Cloudinary in the AVIRALIFECARE directory
 * @param fileBase64OrUrl Data URI or base64 image string
 * @param subFolder Target subfolder inside AVIRALIFECARE (e.g. 'kyc', 'slips', 'products', 'avatars')
 * @returns Secure HTTPS URL of the uploaded image
 */
export async function uploadToCloudinary(
  fileBase64OrUrl: string,
  subFolder: string = "general"
): Promise<string> {
  if (!fileBase64OrUrl) return "";

  // If it's already a Cloudinary or remote HTTPS URL, no need to re-upload
  if (fileBase64OrUrl.startsWith("http://") || fileBase64OrUrl.startsWith("https://")) {
    return fileBase64OrUrl;
  }

  try {
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("Cloudinary credentials not configured; returning original data URI.");
      return fileBase64OrUrl;
    }

    const cleanSub = subFolder
      .replace(/^aviracare\/?/i, "")
      .replace(/^AVIRALIFECARE\/?/i, "")
      .replace(/^\/+|\/+$/g, "");
    const targetFolder = `AVIRALIFECARE/${cleanSub || "general"}`;

    const uploadResponse = await cloudinary.uploader.upload(fileBase64OrUrl, {
      folder: targetFolder,
      resource_type: "auto",
      transformation: [{ quality: "auto:good", fetch_format: "auto" }],
    });

    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Return original string so workflow does not crash if network fails
    return fileBase64OrUrl;
  }
}

export { cloudinary };
