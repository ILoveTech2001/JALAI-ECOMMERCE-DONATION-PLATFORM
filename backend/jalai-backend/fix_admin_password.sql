-- Fix admin password
-- This script updates the admin password to a known BCrypt hash for 'Admin123!'

-- First, let's see what's currently in the admin table
SELECT id, name, email, password, is_active FROM admins WHERE email = 'admin@jalai.com';

-- Update the admin password with a proper BCrypt hash for 'Admin123!'
-- This hash was generated using BCrypt with strength 10
UPDATE admins 
SET password = '$2a$10$N.zmdr9k7uOIW8eBKlzdpOxtdSuwinlRXW5XcVJz7yxnOH.fHq/3u'
WHERE email = 'admin@jalai.com';

-- Verify the update
SELECT id, name, email, password, is_active FROM admins WHERE email = 'admin@jalai.com';

-- Also create a simple admin with a known password 'admin123' (lowercase)
INSERT IGNORE INTO admins (id, name, email, password, is_active) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), 'Simple Admin', 'admin123@jalai.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', TRUE);
