USE jalai_db;

-- Delete the current admin
DELETE FROM admins WHERE email = 'admin@jalai.com';

-- Insert admin with a simple password that we'll update via the backend
INSERT INTO admins (id, name, email, password, is_active) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), 'System Administrator', 'admin@jalai.com', 'temp_password', TRUE);

-- Verify the admin was created
SELECT id, name, email, password, is_active FROM admins WHERE email = 'admin@jalai.com';
