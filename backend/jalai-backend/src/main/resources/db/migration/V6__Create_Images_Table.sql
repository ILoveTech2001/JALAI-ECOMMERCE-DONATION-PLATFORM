-- Migration to create images table for proper image storage
-- This separates image storage from products table

-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    data BYTEA,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_filename ON images(filename);
CREATE INDEX IF NOT EXISTS idx_images_content_type ON images(content_type);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);
CREATE INDEX IF NOT EXISTS idx_images_size ON images(size);

-- Add comments for documentation
COMMENT ON TABLE images IS 'Stores uploaded images separately from products';
COMMENT ON COLUMN images.id IS 'Unique identifier for the image';
COMMENT ON COLUMN images.filename IS 'Original filename of uploaded image';
COMMENT ON COLUMN images.content_type IS 'MIME type of the image (image/jpeg, image/png, etc.)';
COMMENT ON COLUMN images.size IS 'Size of the image in bytes';
COMMENT ON COLUMN images.data IS 'Binary image data stored as BYTEA';
COMMENT ON COLUMN images.created_at IS 'Timestamp when the image was uploaded';

-- For MySQL compatibility (if needed in development)
-- CREATE TABLE IF NOT EXISTS images (
--     id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
--     filename VARCHAR(255) NOT NULL,
--     content_type VARCHAR(100) NOT NULL,
--     size BIGINT NOT NULL,
--     data LONGBLOB,
--     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     INDEX idx_images_filename (filename),
--     INDEX idx_images_content_type (content_type),
--     INDEX idx_images_created_at (created_at),
--     INDEX idx_images_size (size)
-- );
