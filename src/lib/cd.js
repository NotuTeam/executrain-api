/** @format */

const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/cd");

/**
 * Upload file to Cloudinary (Vercel compatible)
 * @param {Object} file - File object from express-fileupload
 * @returns {Promise<{url_picture: string, url_public: string}>}
 */
async function upload(file) {
  let tempFilePath = null;

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = path.extname(file.name);
    const uniqueFileName = `temp_${timestamp}_${randomStr}${fileExt}`;

    // Determine temp directory based on environment
    const isVercel = process.env.VERCEL === "1";
    const tempDir = isVercel
      ? "/tmp" // Vercel's writable directory
      : path.join(__dirname, "..", "temp"); // Local development

    // Add temp directory if it doesn't exist (local only)
    if (!isVercel && !fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    tempFilePath = path.join(tempDir, uniqueFileName);

    // Write file to temp location
    fs.writeFileSync(tempFilePath, file.data);

    // Upload to Cloudinary
    const { secure_url: url_picture, public_id: url_public } =
      await cloudinary.uploader.upload(tempFilePath, {
        folder: "pages",
        resource_type: "auto",
        timeout: 60000, // 60 seconds timeout
      });

    // Clean up temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    return { url_picture, url_public };
  } catch (error) {
    // Clean up temp file on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkError) {
        console.error("Error cleaning up temp file:", unlinkError);
      }
    }

    console.error("Upload error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Alternative: Upload directly from buffer (no temp file needed)
 * Best for serverless environments like Vercel
 */
async function uploadFromBuffer(file) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "pages",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Upload stream error:", error);
          reject(new Error(`Failed to upload: ${error.message}`));
        } else {
          resolve({
            url_picture: result.secure_url,
            url_public: result.public_id,
          });
        }
      }
    );

    // Write buffer to stream
    uploadStream.end(file.data);
  });
}

/**
 * Delete file from Cloudinary
 */
async function destroy(public_id) {
  try {
    if (!public_id) {
      console.warn("No public_id provided for deletion");
      return;
    }

    await cloudinary.uploader.destroy(public_id);
    console.log(`Successfully deleted: ${public_id}`);
  } catch (error) {
    console.error(`Error deleting ${public_id}:`, error);
  }
}

function cleanupTempFiles() {
  // Skip on Vercel
  if (process.env.VERCEL === "1") {
    return;
  }

  try {
    const tempDir = path.join(__dirname, "..", "temp");

    if (!fs.existsSync(tempDir)) {
      return;
    }

    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old temp file: ${file}`);
      }
    });
  } catch (error) {
    console.error("Error cleaning up temp files:", error);
  }
}

// Export appropriate upload function based on environment
const uploadFunction =
  process.env.USE_BUFFER_UPLOAD === "true" ? uploadFromBuffer : upload;

module.exports = {
  upload: uploadFunction,
  destroy,
  cleanupTempFiles,
};
