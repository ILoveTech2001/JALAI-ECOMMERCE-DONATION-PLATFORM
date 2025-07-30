// Test script for product creation workflow
import apiService from '../services/apiService';

/**
 * Test the complete product creation workflow
 * This function tests:
 * 1. Authentication
 * 2. Category fetching
 * 3. Image upload
 * 4. Product creation
 * 5. Product retrieval
 */
export const testProductCreationWorkflow = async () => {
  console.log('🧪 Starting Product Creation Workflow Test...');
  
  try {
    // Step 1: Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('User not authenticated. Please login first.');
    }
    console.log('✅ Step 1: User authentication verified');

    // Step 2: Test category fetching
    console.log('🔍 Step 2: Testing category fetching...');
    const categories = await apiService.getCategories();
    if (!categories || categories.length === 0) {
      throw new Error('No categories available');
    }
    console.log('✅ Step 2: Categories fetched successfully:', categories.length, 'categories');

    // Step 3: Create a test image blob
    console.log('🖼️ Step 3: Creating test image...');
    const testImageBlob = createTestImageBlob();
    console.log('✅ Step 3: Test image created');

    // Step 4: Test image upload
    console.log('📤 Step 4: Testing image upload...');
    const uploadResult = await apiService.uploadImage(testImageBlob);
    if (!uploadResult || !uploadResult.imageId) {
      throw new Error('Image upload failed or did not return imageId');
    }
    console.log('✅ Step 4: Image uploaded successfully, imageId:', uploadResult.imageId);

    // Step 5: Test product creation
    console.log('🛍️ Step 5: Testing product creation...');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const testProduct = {
      name: `Test Product ${Date.now()}`,
      description: 'This is a test product created by the automated test script',
      price: 99.99,
      categoryId: categories[0].id,
      sellerId: userData.id,
      imageId: uploadResult.imageId
    };

    const createdProduct = await apiService.createProduct(testProduct);
    if (!createdProduct || !createdProduct.id) {
      throw new Error('Product creation failed');
    }
    console.log('✅ Step 5: Product created successfully, ID:', createdProduct.id);

    // Step 6: Test product retrieval
    console.log('📋 Step 6: Testing product retrieval...');
    const userProducts = await apiService.getProductsByClient(userData.id);
    const foundProduct = userProducts.find(p => p.id === createdProduct.id);
    if (!foundProduct) {
      throw new Error('Created product not found in user products list');
    }
    console.log('✅ Step 6: Product retrieval successful');

    console.log('🎉 All tests passed! Product creation workflow is working correctly.');
    return {
      success: true,
      productId: createdProduct.id,
      imageId: uploadResult.imageId,
      message: 'Product creation workflow test completed successfully'
    };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Product creation workflow test failed'
    };
  }
};

/**
 * Create a test image blob for testing
 */
function createTestImageBlob() {
  // Create a simple 100x100 red square image
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  // Fill with red color
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(0, 0, 100, 100);
  
  // Add some text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px Arial';
  ctx.fillText('TEST', 35, 55);
  
  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      // Create a File object from the blob
      const file = new File([blob], 'test-image.png', { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
}

/**
 * Quick connectivity test
 */
export const testAPIConnectivity = async () => {
  console.log('🔗 Testing API connectivity...');
  
  try {
    // Test public endpoint
    const response = await fetch(`${apiService.baseURL}/actuator/health`);
    if (response.ok) {
      console.log('✅ API connectivity test passed');
      return { success: true, message: 'API is reachable' };
    } else {
      throw new Error(`API returned status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ API connectivity test failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test authentication endpoints
 */
export const testAuthentication = async (email, password) => {
  console.log('🔐 Testing authentication...');
  
  try {
    const result = await apiService.login(email, password);
    if (result && result.accessToken) {
      console.log('✅ Authentication test passed');
      return { success: true, message: 'Authentication successful' };
    } else {
      throw new Error('Login did not return access token');
    }
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testProductCreation = testProductCreationWorkflow;
  window.testAPIConnectivity = testAPIConnectivity;
  window.testAuthentication = testAuthentication;
}
