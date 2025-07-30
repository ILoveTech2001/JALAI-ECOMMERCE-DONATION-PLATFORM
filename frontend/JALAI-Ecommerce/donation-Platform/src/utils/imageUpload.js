// Modern Image Upload Utility for JALAI Platform
// Uses proper file upload instead of base64 to prevent server overload

/**
 * Upload image file to server using multipart/form-data
 * @param {File} file - Image file to upload
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} - Upload result with imageId
 */
export const uploadImageFile = async (file, onProgress = null) => {
  try {
    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', file);

    // Get auth token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Upload with progress tracking
    const response = await fetch('/api/images/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      imageId: result.imageId,
      filename: result.filename,
      size: result.size,
      contentType: result.contentType,
      url: `/api/images/${result.imageId}` // URL to access the image
    };

  } catch (error) {
    console.error('Image upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload base64 image data (fallback for compressed images)
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} filename - Original filename
 * @param {string} contentType - MIME type
 * @returns {Promise<Object>} - Upload result with imageId
 */
export const uploadBase64Image = async (base64Data, filename = 'image.jpg', contentType = 'image/jpeg') => {
  try {
    // Validate input
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Invalid base64 data provided');
    }

    // Get auth token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare request body
    const requestBody = {
      imageData: base64Data,
      filename: filename,
      contentType: contentType
    };

    // Upload base64 data
    const response = await fetch('/api/images/upload-base64', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      imageId: result.imageId,
      filename: result.filename,
      url: `/api/images/${result.imageId}`
    };

  } catch (error) {
    console.error('Base64 image upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Smart image upload that chooses the best method
 * @param {File|string} imageInput - File object or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
export const smartImageUpload = async (imageInput, options = {}) => {
  try {
    if (imageInput instanceof File) {
      // Use file upload for File objects
      return await uploadImageFile(imageInput, options.onProgress);
    } else if (typeof imageInput === 'string') {
      // Use base64 upload for strings
      return await uploadBase64Image(
        imageInput, 
        options.filename || 'compressed-image.jpg',
        options.contentType || 'image/jpeg'
      );
    } else {
      throw new Error('Invalid image input type');
    }
  } catch (error) {
    console.error('Smart image upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get image URL by ID
 * @param {string} imageId - Image ID
 * @returns {string} - Image URL
 */
export const getImageUrl = (imageId) => {
  if (!imageId) return '/placeholder.svg?height=200&width=200';
  return `/api/images/${imageId}`;
};

/**
 * Delete image by ID
 * @param {string} imageId - Image ID to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteImage = async (imageId) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`/api/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Image deletion failed:', error);
    return false;
  }
};

/**
 * Compress image file before upload
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - Compressed base64 data
 */
export const compressImageForUpload = async (file, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8,
    maxSizeKB = 200
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Try different quality levels to meet size requirement
      let currentQuality = quality;
      let result = canvas.toDataURL('image/jpeg', currentQuality);
      
      // Reduce quality if file is still too large
      while (result.length > maxSizeKB * 1024 * 1.37 && currentQuality > 0.1) { // 1.37 is base64 overhead factor
        currentQuality -= 0.1;
        result = canvas.toDataURL('image/jpeg', currentQuality);
      }

      resolve(result);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export default {
  uploadImageFile,
  uploadBase64Image,
  smartImageUpload,
  getImageUrl,
  deleteImage,
  compressImageForUpload
};
