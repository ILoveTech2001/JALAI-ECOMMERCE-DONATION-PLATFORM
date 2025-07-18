USE jalai_db;

-- Check what's currently in the admin table
SELECT id, name, email, password, is_active FROM admins WHERE email = 'admin@jalai.com';

-- Check what's in the clients table to compare password format
SELECT id, name, email, password, is_active FROM clients LIMIT 1;
