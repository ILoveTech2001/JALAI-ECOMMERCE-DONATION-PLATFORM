USE jalai_db;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all existing admin records
DELETE FROM admins;

-- Reset auto-increment if needed
ALTER TABLE admins AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Insert a fresh admin user with password 'admin123'
-- BCrypt hash for 'admin123': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.
INSERT INTO admins (id, name, email, password, is_active) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), 'System Administrator', 'admin@jalai.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', TRUE);

-- Verify the admin was created
SELECT id, name, email, is_active FROM admins WHERE email = 'admin@jalai.com';

-- Show total count of admins
SELECT COUNT(*) as total_admins FROM admins;
