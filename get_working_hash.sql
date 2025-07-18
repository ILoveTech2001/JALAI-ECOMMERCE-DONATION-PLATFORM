USE jalai_db;

-- Get the most recent client user's password hash (this was encoded by the working backend)
SELECT id, name, email, password, is_active FROM clients ORDER BY id DESC LIMIT 1;
