USE jalai_db;

-- Check the admin user details
SELECT id, name, email, password, is_active FROM admins WHERE email = 'admin@jalai.com';

-- Check if there are any other admin users
SELECT COUNT(*) as total_admins FROM admins;

-- Check the admin table structure
DESCRIBE admins;
