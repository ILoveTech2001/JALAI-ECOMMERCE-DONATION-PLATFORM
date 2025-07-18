-- Database cleanup script for Jalai Donation Platform
-- WARNING: This script will delete all data and drop the database
-- Use with caution!

-- Drop database (this will remove all tables and data)
DROP DATABASE IF EXISTS jalai_db;

-- Drop user (optional - uncomment if you created a specific user)
-- DROP USER IF EXISTS 'jalai_user'@'localhost';

-- Recreate empty database
CREATE DATABASE IF NOT EXISTS jalai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Show confirmation
SELECT 'Database cleaned and recreated successfully' as 'Status';
