USE jalai_db;

-- Get the password hash from the most recent working client user
-- This user was created with "password123" and login works
SELECT @working_hash := password FROM clients WHERE email = 'testuser1752165889386@example.com';

-- Delete existing admin
DELETE FROM admins WHERE email = 'admin@jalai.com';

-- Create admin with the same password hash that works for clients
INSERT INTO admins (id, name, email, password, is_active) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), 'System Administrator', 'admin@jalai.com', @working_hash, TRUE);

-- Verify the admin was created
SELECT id, name, email, password, is_active FROM admins WHERE email = 'admin@jalai.com';
