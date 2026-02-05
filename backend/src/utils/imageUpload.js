const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

/**
 * Upload single image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Object} - Upload result with url and publicId
 */
const uploadImage = async (fileBuffer, folder = 'inventory') => {
  try {
    if (!fileBuffer) {
      throw new Error('No file buffer provided');
    }

    const result = await uploadToCloudinary(fileBuffer, folder);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} fileBuffers - Array of file buffers
 * @param {String} folder - Cloudinary folder name
 * @returns {Array} - Array of upload results
 */
const uploadMultipleImages = async (fileBuffers, folder = 'inventory') => {
  try {
    if (!fileBuffers || !Array.isArray(fileBuffers)) {
      throw new Error('Invalid file buffers array');
    }

    const uploadPromises = fileBuffers.map(buffer => uploadImage(buffer, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple images upload error:', error);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Object} - Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    const result = await deleteFromCloudinary(publicId);
    return result;
  } catch (error) {
    console.error('Image deletion error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public IDs
 * @returns {Array} - Array of deletion results
 */
const deleteMultipleImages = async (publicIds) => {
  try {
    if (!publicIds || !Array.isArray(publicIds)) {
      throw new Error('Invalid public IDs array');
    }

    const deletePromises = publicIds.map(id => deleteImage(id));
    return await Promise.all(deletePromises);
  } catch (error) {
    console.error('Multiple images deletion error:', error);
    throw new Error(`Failed to delete images: ${error.message}`);
  }
};

/**
 * Validate image file
 * @param {Object} file - Multer file object
 * @returns {Boolean} - Validation result
 */
const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!file) {
    return { valid: false, message: 'No file provided' };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return { 
      valid: false, 
      message: 'Invalid file type. Only JPG, PNG, and WEBP are allowed.' 
    };
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      message: 'File too large. Maximum size is 10MB.' 
    };
  }

  return { valid: true };
};

/**
 * Get image dimensions from buffer
 * @param {Buffer} buffer - Image buffer
 * @returns {Object} - Width and height
 */
const getImageDimensions = async (buffer) => {
  try {
    // This would require 'sharp' or 'image-size' package
    // For now, return null - dimensions come from Cloudinary response
    return null;
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return null;
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  validateImageFile,
  getImageDimensions
};