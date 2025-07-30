-- Migration to add BYTEA image support to products table
-- This allows storing binary image data directly in the database

-- Add new columns for binary image storage
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_data BYTEA,
ADD COLUMN IF NOT EXISTS image_filename VARCHAR(255),
ADD COLUMN IF NOT EXISTS image_content_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS image_size BIGINT;

-- Increase image_url length for better URL support
ALTER TABLE products 
ALTER COLUMN image_url TYPE VARCHAR(500);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_image_filename ON products(image_filename);
CREATE INDEX IF NOT EXISTS idx_products_image_content_type ON products(image_content_type);

-- Add comments for documentation
COMMENT ON COLUMN products.image_data IS 'Binary image data stored as BYTEA';
COMMENT ON COLUMN products.image_filename IS 'Original filename of uploaded image';
COMMENT ON COLUMN products.image_content_type IS 'MIME type of the image (image/jpeg, image/png, etc.)';
COMMENT ON COLUMN products.image_size IS 'Size of the image in bytes';
COMMENT ON COLUMN products.image_url IS 'URL path to image or external image URL';
