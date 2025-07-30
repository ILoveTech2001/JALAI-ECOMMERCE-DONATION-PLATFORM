// Alternative Image Storage Solutions for JALAI Platform
// Provides multiple strategies for handling large images

/**
 * Image storage strategies to prevent server overload
 */
export const ImageStorageStrategy = {
  BASE64_COMPRESSED: 'base64_compressed',
  OBJECT_URL: 'object_url',
  CHUNKED_UPLOAD: 'chunked_upload',
  EXTERNAL_SERVICE: 'external_service'
};

/**
 * Determine the best storage strategy based on image size
 * @param {number} sizeBytes - Image size in bytes
 * @returns {string} - Storage strategy
 */
export const determineStorageStrategy = (sizeBytes) => {
  const sizeKB = sizeBytes / 1024;

  if (sizeKB <= 200) {
    return ImageStorageStrategy.BASE64_COMPRESSED;
  } else if (sizeKB <= 1000) {
    return ImageStorageStrategy.OBJECT_URL;
  } else if (sizeKB <= 3000) {
    return ImageStorageStrategy.CHUNKED_UPLOAD;
  } else {
    return ImageStorageStrategy.EXTERNAL_SERVICE;
  }
};

/**
 * Store image using object URL (for temporary local storage)
 * @param {File} file - Image file
 * @returns {Object} - Storage result
 */
export const storeAsObjectURL = (file) => {
  const objectURL = URL.createObjectURL(file);
  
  return {
    strategy: ImageStorageStrategy.OBJECT_URL,
    url: objectURL,
    cleanup: () => URL.revokeObjectURL(objectURL),
    metadata: {
      size: file.size,
      type: file.type,
      name: file.name
    }
  };
};

/**
 * Prepare image for server upload based on strategy
 * @param {File} file - Image file
 * @param {string} strategy - Storage strategy
 * @returns {Promise<Object>} - Prepared image data
 */
export const prepareImageForUpload = async (file, strategy) => {
  switch (strategy) {
    case ImageStorageStrategy.BASE64_COMPRESSED:
      const { compressImage } = await import('./imageUtils.js');
      const compressed = await compressImage(file, {
        maxWidth: 200,
        maxHeight: 150,
        quality: 0.3,
        maxSizeKB: 5  // Tiny to fit in VARCHAR(1000) - 5KB → ~7KB base64 → ~9,300 chars
      });
      return {
        type: 'base64',
        data: compressed,
        size: (compressed.length * 0.75) // Approximate size
      };

    case ImageStorageStrategy.OBJECT_URL:
      // For object URLs, we'll send a placeholder and upload separately
      return {
        type: 'placeholder',
        data: '/placeholder.svg?height=200&width=200',
        size: file.size,
        needsUpload: true,
        file: file
      };

    case ImageStorageStrategy.CHUNKED_UPLOAD:
      // For chunked upload, we'll implement a multi-part upload
      return {
        type: 'chunked',
        data: '/placeholder.svg?height=200&width=200',
        size: file.size,
        needsChunkedUpload: true,
        file: file
      };

    case ImageStorageStrategy.EXTERNAL_SERVICE:
      // For external services, we'd upload to a service like Cloudinary
      return {
        type: 'external',
        data: '/placeholder.svg?height=200&width=200',
        size: file.size,
        needsExternalUpload: true,
        file: file
      };

    default:
      throw new Error(`Unknown storage strategy: ${strategy}`);
  }
};

/**
 * Upload image using chunked upload for large files
 * @param {File} file - Image file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} - Upload result URL
 */
export const chunkedImageUpload = async (file, onProgress = () => {}) => {
  const chunkSize = 1024 * 1024; // 1MB chunks
  const totalChunks = Math.ceil(file.size / chunkSize);
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('uploadId', uploadId);
      formData.append('fileName', file.name);
      
      const response = await fetch('/api/upload/chunk', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Chunk upload failed: ${response.statusText}`);
      }
      
      onProgress((chunkIndex + 1) / totalChunks * 100);
    }
    
    // Finalize the upload
    const finalizeResponse = await fetch('/api/upload/finalize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ uploadId })
    });
    
    if (!finalizeResponse.ok) {
      throw new Error(`Upload finalization failed: ${finalizeResponse.statusText}`);
    }
    
    const result = await finalizeResponse.json();
    return result.imageUrl;
    
  } catch (error) {
    // Cleanup on error
    try {
      await fetch('/api/upload/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ uploadId })
      });
    } catch (cleanupError) {
      console.warn('Failed to cleanup failed upload:', cleanupError);
    }
    
    throw error;
  }
};

/**
 * Smart image handler that chooses the best approach
 * @param {File} file - Image file
 * @param {Object} options - Options
 * @returns {Promise<Object>} - Processed image data
 */
export const smartImageHandler = async (file, options = {}) => {
  const strategy = determineStorageStrategy(file.size);
  
  console.log(`📸 Using ${strategy} strategy for ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
  
  try {
    const result = await prepareImageForUpload(file, strategy);
    
    return {
      ...result,
      strategy,
      originalSize: file.size,
      fileName: file.name
    };
  } catch (error) {
    console.error('Smart image handler failed:', error);
    
    // Fallback to basic compression
    const { compressImage } = await import('./imageUtils.js');
    const fallbackCompressed = await compressImage(file, {
      maxWidth: 150,
      maxHeight: 100,
      quality: 0.2,
      maxSizeKB: 3  // Ultra small for fallback - 3KB → ~4KB base64 → ~5,300 chars
    });
    
    return {
      type: 'base64_fallback',
      data: fallbackCompressed,
      size: fallbackCompressed.length * 0.75,
      strategy: 'fallback',
      originalSize: file.size,
      fileName: file.name
    };
  }
};

export default {
  ImageStorageStrategy,
  determineStorageStrategy,
  storeAsObjectURL,
  prepareImageForUpload,
  chunkedImageUpload,
  smartImageHandler
};
