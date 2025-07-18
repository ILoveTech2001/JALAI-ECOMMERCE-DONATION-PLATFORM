/**
 * Utility functions for handling price data from backend
 * Backend uses BigDecimal which can be serialized in different formats
 */

/**
 * Normalizes price data from various formats to a JavaScript number
 * @param {*} price - Price value from backend (could be number, string, or BigDecimal object)
 * @returns {number} - Normalized price as a number, or 0 if invalid
 */
export const normalizePrice = (price) => {
  // Handle null/undefined
  if (price === null || price === undefined) {
    return 0;
  }

  // Already a number
  if (typeof price === 'number') {
    return isNaN(price) ? 0 : price;
  }

  // String representation
  if (typeof price === 'string') {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  }

  // BigDecimal object or other object types
  if (typeof price === 'object' && price !== null) {
    // Try to convert to string first, then parse
    try {
      const stringValue = price.toString();
      const parsed = parseFloat(stringValue);
      return isNaN(parsed) ? 0 : parsed;
    } catch (error) {
      console.warn('Failed to parse price object:', price, error);
      return 0;
    }
  }

  // Fallback
  console.warn('Unknown price format:', price, typeof price);
  return 0;
};

/**
 * Calculates total from an array of items with price property
 * @param {Array} items - Array of items with price property
 * @returns {number} - Total price
 */
export const calculateTotal = (items) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce((sum, item) => {
    const price = normalizePrice(item.price);
    return sum + price;
  }, 0);
};

/**
 * Formats price for display with locale-specific formatting
 * @param {*} price - Price value to format
 * @param {string} currency - Currency suffix (default: 'XAF')
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, currency = 'XAF') => {
  const normalizedPrice = normalizePrice(price);
  return `${normalizedPrice.toLocaleString()} ${currency}`;
};

/**
 * Normalizes product data to ensure consistent price handling
 * @param {Object} product - Product object from backend
 * @returns {Object} - Normalized product object
 */
export const normalizeProduct = (product) => {
  if (!product) {
    return null;
  }

  return {
    ...product,
    price: normalizePrice(product.price),
    // Ensure consistent naming
    title: product.name || product.title,
    name: product.name || product.title,
    image: product.imageUrlThumbnail || product.image || "/placeholder.jpg",
    imageUrlThumbnail: product.imageUrlThumbnail || product.image
  };
};
