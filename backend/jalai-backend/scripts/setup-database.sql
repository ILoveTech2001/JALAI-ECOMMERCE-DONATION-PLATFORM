-- Database setup script for Jalai Donation Platform
-- Run this script to create the database and user for development

-- Create database
CREATE DATABASE IF NOT EXISTS jalai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user for the application (optional - for production)
-- CREATE USER IF NOT EXISTS 'jalai_user'@'localhost' IDENTIFIED BY 'jalai_password';
-- GRANT ALL PRIVILEGES ON jalai_db.* TO 'jalai_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Use the database
USE jalai_db;

-- Show current database
SELECT DATABASE() as 'Current Database';

-- Show tables (will be empty initially)
SHOW TABLES;
