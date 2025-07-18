USE jalai_db;

-- Truncate the admins table to remove all existing admin records
TRUNCATE TABLE admins;

-- Insert a fresh admin user with password 'admin123'
-- BCrypt hash for 'admin123': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.
INSERT INTO admins (id, name, email, password, is_active) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), 'System Administrator', 'admin@jalai.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', TRUE);

-- Verify the admin was created
SELECT id, name, email, is_active, password FROM admins WHERE email = 'admin@jalai.com';

-- Show total count of admins
SELECT COUNT(*) as total_admins FROM admins;
