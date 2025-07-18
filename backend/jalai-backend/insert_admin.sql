USE jalai_db;

-- Delete existing admin if any
DELETE FROM admins WHERE email = 'admin@jalai.com';

-- Insert admin user with correct password hash for 'admin123'
INSERT INTO admins (id, name, email, password, is_active) VALUES
(UNHEX(REPLACE(UUID(), '-', '')), 'System Administrator', 'admin@jalai.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', TRUE);

-- Delete existing client if any
DELETE FROM clients WHERE email = 'john.doe@email.com';

-- Insert a test client with password 'Client123!'
INSERT INTO clients (id, name, email, password, phone, location, is_active) VALUES
(UNHEX(REPLACE(UUID(), '-', '')), 'John Doe', 'john.doe@email.com', '$2a$10$N.zmdr9k7uOIW8eBKlzdpOxtdSuwinlRXW5XcVJz7yxnOH.fHq/3u', '+1234567890', 'Test City', TRUE);

-- Check what we inserted
SELECT 'Admin:' as type, email, name FROM admins
UNION ALL
SELECT 'Client:' as type, email, name FROM clients;
