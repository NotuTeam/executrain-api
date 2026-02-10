/**
 * Image Manager Helper
 * 
 * Konsep Manajemen Gambar CDN:
 * 
 * 1. CREATE (Upload Gambar Baru)
 *    - Saat membuat data baru dengan gambar
 *    - Upload gambar ke CDN
 *    - Simpan public_id dan url di database
 *    - TANPA menghapus gambar apapun
 * 
 * 2. UPDATE (Update Data dengan Gambar)
 *    A. Jika gambar DIUBAH (file baru diupload):
 *       1. Ambil data existing dari database
 *       2. Jika ada gambar lama (public_id ada dan tidak kosong):
 *          - Hapus gambar lama dari CDN menggunakan destroy(public_id)
 *       3. Upload gambar baru ke CDN
 *       4. Update database dengan public_id dan url baru
 *    
 *    B. Jika gambar TIDAK diubah (tidak ada file baru):
 *       - JANGAN upload gambar baru
 *       - JANGAN hapus gambar lama
 *       - Pertahankan data gambar yang ada di database
 *       - Data di CDN tetap sama
 * 
 * 3. DELETE (Hapus Data)
 *    - Ambil data yang akan dihapus
 *    - Jika ada gambar (public_id ada dan tidak kosong):
 *      - Hapus gambar dari CDN menggunakan destroy(public_id)
 *    - Hapus data dari database
 * 
 * 4. UPDATE CONTENT (Khusus Article/Pages dengan konten HTML)
 *    - Saat update konten dengan gambar base64
 *    - Hapus semua gambar lama dari konten existing
 *    - Upload gambar baru dari konten yang diupdate
 *    - Update database dengan konten baru
 * 
 * PENTING:
 * - Selalu cek apakah public_id ada sebelum memanggil destroy()
 * - Selalu cek apakah public_id tidak kosong string ""
 * - Gunakan try-catch untuk handle error saat destroy
 * - Log semua operasi hapus untuk debugging
 */

const { destroy } = require("./cd");

/**
 * Hapus gambar dari CDN dengan aman
 * @param {string} public_id - Public ID gambar yang akan dihapus
 * @param {string} entityType - Tipe entity untuk logging (contoh: "product", "promo")
 */
async function deleteImageFromCDN(public_id, entityType = "entity") {
  try {
    // Cek apakah public_id ada dan tidak kosong
    if (!public_id || public_id === "" || public_id === null) {
      console.log(`[${entityType}] No image to delete (public_id is empty)`);
      return;
    }

    // Hapus gambar dari CDN
    await destroy(public_id);
    console.log(`[${entityType}] Successfully deleted image: ${public_id}`);
  } catch (error) {
    console.error(`[${entityType}] Error deleting image ${public_id}:`, error.message);
    // Jangan throw error, biarkan proses tetap lanjut
  }
}

/**
 * Hapus multiple gambar dari CDN
 * @param {Array<string>} public_ids - Array of public IDs
 * @param {string} entityType - Tipe entity untuk logging
 */
async function deleteMultipleImagesFromCDN(public_ids, entityType = "entity") {
  if (!public_ids || public_ids.length === 0) {
    console.log(`[${entityType}] No images to delete (array is empty)`);
    return;
  }

  console.log(`[${entityType}] Deleting ${public_ids.length} images...`);

  for (const public_id of public_ids) {
    await deleteImageFromCDN(public_id, entityType);
  }
}

/**
 * Update gambar dengan menghapus gambar lama
 * Pattern untuk UPDATE operation
 * 
 * @param {Object} existingData - Data existing dari database
 * @param {Object} imageField - Nama field gambar (contoh: "banner", "featured_image")
 * @param {Object} newFile - File baru dari req.files
 * @param {string} entityType - Tipe entity untuk logging
 * @returns {Promise<Object>} - Object berisi public_id dan url baru
 */
async function updateImageWithCleanup(existingData, imageField, newFile, entityType) {
  try {
    // 1. Hapus gambar lama jika ada
    if (existingData[imageField] && existingData[imageField].public_id) {
      const oldPublicId = existingData[imageField].public_id;
      
      if (oldPublicId && oldPublicId !== "") {
        await deleteImageFromCDN(oldPublicId, entityType);
      }
    }

    // 2. Upload gambar baru
    const { upload } = require("./cd");
    const { url_picture, url_public } = await upload(newFile);

    return {
      public_id: url_public,
      url: url_picture,
    };
  } catch (error) {
    console.error(`[${entityType}] Error updating image:`, error.message);
    throw error;
  }
}

/**
 * Hapus gambar saat DELETE operation
 * @param {Object} data - Data yang akan dihapus
 * @param {Array<string>} imageFields - Array nama field gambar yang akan dihapus
 * @param {string} entityType - Tipe entity untuk logging
 */
async function cleanupImagesOnDelete(data, imageFields, entityType) {
  if (!data) {
    console.log(`[${entityType}] No data to cleanup`);
    return;
  }

  console.log(`[${entityType}] Cleaning up images on delete...`);

  for (const field of imageFields) {
    if (data[field] && data[field].public_id) {
      await deleteImageFromCDN(data[field].public_id, entityType);
    }
  }
}

module.exports = {
  deleteImageFromCDN,
  deleteMultipleImagesFromCDN,
  updateImageWithCleanup,
  cleanupImagesOnDelete,
};
