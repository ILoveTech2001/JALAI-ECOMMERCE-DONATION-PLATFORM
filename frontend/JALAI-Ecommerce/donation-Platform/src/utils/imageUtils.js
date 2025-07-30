// Image Utilities for JALAI Platform
// Handles image compression, resizing, and format conversion

/**
 * Compress and resize an image file
 * @param {File} file - The image file to process
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - Compressed image as base64 or blob URL
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 800,
      maxHeight = 600,
      quality = 0.7,
      format = 'image/jpeg',
      maxSizeKB = 100 // Maximum size in KB
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Try different quality levels to meet size requirement
      let currentQuality = quality;
      let compressedDataUrl;
      
      do {
        compressedDataUrl = canvas.toDataURL(format, currentQuality);
        const sizeKB = (compressedDataUrl.length * 0.75) / 1024; // Approximate size in KB
        
        if (sizeKB <= maxSizeKB || currentQuality <= 0.1) {
          break;
        }
        
        currentQuality -= 0.1;
      } while (currentQuality > 0.1);

      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert image to WebP format for better compression
 * @param {File} file - The image file
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<string>} - WebP image as base64
 */
export const convertToWebP = (file, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = Math.min(img.width, 800);
      canvas.height = Math.min(img.height, 600);
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Check if browser supports WebP
      const webpDataUrl = canvas.toDataURL('image/webp', quality);
      if (webpDataUrl.startsWith('data:image/webp')) {
        resolve(webpDataUrl);
      } else {
        // Fallback to JPEG
        resolve(canvas.toDataURL('image/jpeg', quality));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Create multiple image sizes (thumbnail, medium, full)
 * @param {File} file - The image file
 * @returns {Promise<Object>} - Object with different sizes
 */
export const createImageSizes = async (file) => {
  try {
    const [thumbnail, medium, full] = await Promise.all([
      compressImage(file, { maxWidth: 150, maxHeight: 150, quality: 0.6, maxSizeKB: 20 }),
      compressImage(file, { maxWidth: 400, maxHeight: 300, quality: 0.7, maxSizeKB: 50 }),
      compressImage(file, { maxWidth: 800, maxHeight: 600, quality: 0.8, maxSizeKB: 100 })
    ]);

    return {
      thumbnail,
      medium,
      full,
      sizes: {
        thumbnail: `${(thumbnail.length * 0.75 / 1024).toFixed(1)}KB`,
        medium: `${(medium.length * 0.75 / 1024).toFixed(1)}KB`,
        full: `${(full.length * 0.75 / 1024).toFixed(1)}KB`
      }
    };
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result
 */
export const validateImage = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
  } else {
    if (file.size > maxSize) {
      errors.push(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: file ? {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)}KB`,
      type: file.type
    } : null
  };
};

/**
 * Convert base64 to blob for more efficient handling
 * @param {string} base64 - Base64 string
 * @param {string} mimeType - MIME type
 * @returns {Blob} - Blob object
 */
export const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Create a placeholder image URL
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @param {string} text - Text to display
 * @returns {string} - Data URL for placeholder
 */
export const createPlaceholder = (width = 300, height = 200, text = 'No Image') => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = width;
  canvas.height = height;
  
  // Background
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, width, height);
  
  // Border
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);
  
  // Text
  ctx.fillStyle = '#6b7280';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toDataURL('image/png');
};

export default {
  compressImage,
  convertToWebP,
  createImageSizes,
  validateImage,
  base64ToBlob,
  createPlaceholder
};
