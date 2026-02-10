/** @format */

const { upload } = require("../../lib/cd");

/**
 * Extract base64 images from HTML content
 * @param {string} htmlContent - HTML content from rich text editor
 * @returns {Array} Array of base64 image data
 */
function extractBase64Images(htmlContent) {
  const base64Images = [];
  const base64Regex =
    /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/gi;

  let match;
  while ((match = base64Regex.exec(htmlContent)) !== null) {
    base64Images.push({
      fullMatch: match[0],
      mimeType: match[1],
      base64Data: match[2],
      index: match.index,
    });
  }

  return base64Images;
}

/**
 * Upload base64 image to Cloudinary
 * @param {string} mimeType - Image mime type (e.g., "png", "jpeg")
 * @param {string} base64Data - Base64 encoded image data
 * @param {number} index - Image index for unique naming
 * @returns {Promise<{url: string, public_id: string}>}
 */
async function uploadBase64Image(mimeType, base64Data, index) {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Add file object similar to express-fileupload
    const file = {
      name: `article_image_${Date.now()}_${index}.${mimeType}`,
      data: buffer,
      mimetype: `image/${mimeType}`,
      size: buffer.length,
    };

    // Upload to Cloudinary
    const { url_picture, url_public } = await upload(file);

    return {
      url: url_picture,
      public_id: url_public,
    };
  } catch (error) {
    console.error("Error uploading base64 image:", error);
    throw error;
  }
}

/**
 * Process article content: Extract and upload base64 images
 * @param {string} htmlContent - HTML content from rich text editor
 * @returns {Promise<{processedContent: string, uploadedImages: Array}>}
 */
async function processArticleContentImages(htmlContent) {
  if (!htmlContent) {
    return {
      processedContent: htmlContent,
      uploadedImages: [],
    };
  }

  // Extract all base64 images from content
  const base64Images = extractBase64Images(htmlContent);

  if (base64Images.length === 0) {
    return {
      processedContent: htmlContent,
      uploadedImages: [],
    };
  }

  console.log(`Found ${base64Images.length} base64 images to upload...`);

  let processedContent = htmlContent;
  const uploadedImages = [];

  // Upload each image and replace in content
  // Process in reverse order to maintain correct indices when replacing
  for (let i = base64Images.length - 1; i >= 0; i--) {
    const img = base64Images[i];

    try {
      // Upload image to Cloudinary
      const uploadedImage = await uploadBase64Image(
        img.mimeType,
        img.base64Data,
        i
      );

      uploadedImages.push(uploadedImage);

      // Replace base64 img tag with CDN URL
      const newImgTag = img.fullMatch.replace(
        /src="data:image\/[^;]+;base64,([^"]+)"/,
        `src="${uploadedImage.url}"`
      );

      // Replace in content (using substring to replace specific occurrence)
      processedContent =
        processedContent.substring(0, img.index) +
        newImgTag +
        processedContent.substring(img.index + img.fullMatch.length);

      console.log(`Uploaded image ${i + 1}/${base64Images.length}`);
    } catch (error) {
      console.error(`Failed to upload image ${i}:`, error);
      // Keep original base64 if upload fails
      continue;
    }
  }

  return {
    processedContent,
    uploadedImages,
  };
}

/**
 * Delete images from Cloudinary when article is deleted/updated
 * @param {string} htmlContent - HTML content containing image URLs
 */
async function deleteArticleContentImages(htmlContent) {
  if (!htmlContent) {
    return;
  }

  // Extract Cloudinary URLs from OLD content
  const oldImgRegex =
    /<img[^>]+src="(https:\/\/res\.cloudinary\.com\/[^"]+)"[^>]*>/gi;
  const oldCloudinaryImages = [];

  let match;
  while ((match = oldImgRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/<cloud_name>/image/upload/v<timestamp>/<folder>/<public_id>.<ext>
    const urlParts = url.split("/");
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.substring(0, filename.lastIndexOf("."));

    oldCloudinaryImages.push({
      url,
      publicId
    });
  }

  // If new content is provided, extract and keep images that are still in use
  if (newContent) {
    // Extract images from NEW content
    const newImgRegex =
      /<img[^>]+src="(https:\/\/res\.cloudinary\.com\/[^"]+)"[^>]*>/gi;
    const newCloudinaryImages = new Set();
    
    while ((match = newImgRegex.exec(newContent)) !== null) {
      const url = match[1];
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1];
      const publicId = filename.substring(0, filename.lastIndexOf("."));
      newCloudinaryImages.add(publicId);
    }
    
    // Only delete images that are NOT in new content (i.e., images removed from article)
    const imagesToDelete = oldCloudinaryImages.filter(img => !newCloudinaryImages.has(img.publicId));
    
    console.log(`Deleting ${imagesToDelete.length} old content images (keeping ${oldCloudinaryImages.length - imagesToDelete.length} images)...`);

    // Delete only images that are not in use anymore
    const { destroy } = require("../../lib/cd");
    for (const img of imagesToDelete) {
      try {
        await destroy(img.publicId);
        console.log(`Deleted removed content image: ${img.publicId}`);
      } catch (error) {
        console.error(`Failed to delete image ${img.publicId}:`, error);
      }
    }
  } else {
    // If no new content provided (article deletion), delete ALL images
    console.log(`Deleting all ${oldCloudinaryImages.length} content images...`);

    const { destroy } = require("../../lib/cd");
    for (const img of oldCloudinaryImages) {
      try {
        await destroy(img.publicId);
        console.log(`Deleted content image: ${img.publicId}`);
      } catch (error) {
        console.error(`Failed to delete image ${img.publicId}:`, error);
      }
    }
  }
}

module.exports = {
  processArticleContentImages,
  deleteArticleContentImages,
  extractBase64Images,
};
