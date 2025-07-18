-- Insert initial data for Jalai Donation Platform
-- Version 2.0 - Initial Data Seeding

-- Insert default admin user
-- Password: Admin123! (BCrypt encoded)
INSERT INTO admins (id, name, email, password, is_active) VALUES
(UNHEX(REPLACE(UUID(), '-', '')), 'System Administrator', 'admin@jalai.com', '$2a$10$N.zmdr9k7uOIW8eBKlzdpOxtdSuwinlRXW5XcVJz7yxnOH.fHq/3u', TRUE);

-- Insert sample categories
INSERT INTO categories (id, name, description, is_active) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), 'Electronics', 'Electronic devices and gadgets', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Clothing', 'Clothes and fashion items', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Books', 'Books and educational materials', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Toys', 'Toys and games for children', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Furniture', 'Home and office furniture', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Sports', 'Sports equipment and accessories', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Kitchen', 'Kitchen appliances and utensils', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Health', 'Health and medical supplies', TRUE);

-- Insert sample orphanages
-- Password: Orphan123! (BCrypt encoded)
INSERT INTO orphanages (id, name, email, password, phone_number, location, is_active) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), 'Hope Children Home', 'hope@orphanage.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+1234567890', '123 Hope Street, City Center', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Sunshine Orphanage', 'sunshine@orphanage.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+1234567891', '456 Sunshine Avenue, Downtown', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Little Angels Home', 'angels@orphanage.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+1234567892', '789 Angel Road, Suburbs', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Rainbow Children Center', 'rainbow@orphanage.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+1234567893', '321 Rainbow Lane, Uptown', TRUE);

-- Insert sample clients
-- Password: Client123! (BCrypt encoded)
INSERT INTO clients (id, name, email, password, phone, location, is_active) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), 'John Doe', 'john.doe@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+1234567894', 'New York, NY', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Jane Smith', 'jane.smith@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+1234567895', 'Los Angeles, CA', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Mike Johnson', 'mike.johnson@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+1234567896', 'Chicago, IL', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Sarah Wilson', 'sarah.wilson@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+1234567897', 'Houston, TX', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'David Brown', 'david.brown@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+1234567898', 'Phoenix, AZ', TRUE);

-- Insert sample products (using variables for better readability)
SET @electronics_cat_id = (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1);
SET @clothing_cat_id = (SELECT id FROM categories WHERE name = 'Clothing' LIMIT 1);
SET @books_cat_id = (SELECT id FROM categories WHERE name = 'Books' LIMIT 1);
SET @toys_cat_id = (SELECT id FROM categories WHERE name = 'Toys' LIMIT 1);
SET @john_id = (SELECT id FROM clients WHERE email = 'john.doe@email.com' LIMIT 1);
SET @jane_id = (SELECT id FROM clients WHERE email = 'jane.smith@email.com' LIMIT 1);
SET @mike_id = (SELECT id FROM clients WHERE email = 'mike.johnson@email.com' LIMIT 1);

INSERT INTO products (id, name, description, price, seller_id, category_id, is_approved, is_available) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), 'iPhone 12', 'Gently used iPhone 12 in excellent condition', 599.99, @john_id, @electronics_cat_id, TRUE, TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Samsung Galaxy S21', 'Samsung Galaxy S21 with original box', 499.99, @jane_id, @electronics_cat_id, TRUE, TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Winter Jacket', 'Warm winter jacket, size M', 89.99, @mike_id, @clothing_cat_id, TRUE, TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Programming Books Set', 'Collection of programming books', 149.99, @john_id, @books_cat_id, TRUE, TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'LEGO Building Set', 'Complete LEGO building set for kids', 79.99, @jane_id, @toys_cat_id, TRUE, TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'MacBook Air', 'MacBook Air 2020 model, barely used', 899.99, @mike_id, @electronics_cat_id, FALSE, TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Designer Dress', 'Beautiful designer dress, size S', 199.99, @jane_id, @clothing_cat_id, TRUE, TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), 'Educational Toys Bundle', 'Bundle of educational toys for toddlers', 129.99, @john_id, @toys_cat_id, TRUE, TRUE);

-- Insert sample donations
SET @hope_id = (SELECT id FROM orphanages WHERE email = 'hope@orphanage.com' LIMIT 1);
SET @sunshine_id = (SELECT id FROM orphanages WHERE email = 'sunshine@orphanage.com' LIMIT 1);
SET @angels_id = (SELECT id FROM orphanages WHERE email = 'angels@orphanage.com' LIMIT 1);

INSERT INTO donations (id, client_id, user_id, orphanage_id, donation_type, status, appointment_date, cash_amount, item_description, is_confirmed) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), @john_id, @john_id, @hope_id, 'CASH', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 5 DAY), 500.00, NULL, TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), @jane_id, @jane_id, @sunshine_id, 'KIND', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 3 DAY), NULL, 'Clothes and toys for children', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), @mike_id, @mike_id, @angels_id, 'BOTH', 'CONFIRMED', DATE_ADD(NOW(), INTERVAL 2 DAY), 300.00, 'Books and educational materials', TRUE),
(UNHEX(REPLACE(UUID(), '-', '')), @john_id, @john_id, @sunshine_id, 'CASH', 'PENDING', DATE_ADD(NOW(), INTERVAL 7 DAY), 750.00, NULL, FALSE),
(UNHEX(REPLACE(UUID(), '-', '')), @jane_id, @jane_id, @hope_id, 'KIND', 'PENDING', DATE_ADD(NOW(), INTERVAL 10 DAY), NULL, 'Kitchen appliances and utensils', FALSE);

-- Insert sample orders
SET @sarah_id = (SELECT id FROM clients WHERE email = 'sarah.wilson@email.com' LIMIT 1);
SET @david_id = (SELECT id FROM clients WHERE email = 'david.brown@email.com' LIMIT 1);
SET @iphone_id = (SELECT id FROM products WHERE name = 'iPhone 12' LIMIT 1);
SET @jacket_id = (SELECT id FROM products WHERE name = 'Winter Jacket' LIMIT 1);

INSERT INTO orders (order_id, client_id, seller_id, status, delivery_date, total_amount) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), @sarah_id, @john_id, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 2 DAY), 599.99),
(UNHEX(REPLACE(UUID(), '-', '')), @david_id, @mike_id, 'SHIPPED', DATE_ADD(NOW(), INTERVAL 1 DAY), 89.99),
(UNHEX(REPLACE(UUID(), '-', '')), @sarah_id, @jane_id, 'PROCESSING', DATE_ADD(NOW(), INTERVAL 3 DAY), 79.99),
(UNHEX(REPLACE(UUID(), '-', '')), @david_id, @john_id, 'CONFIRMED', DATE_ADD(NOW(), INTERVAL 5 DAY), 149.99);

-- Insert sample payments
SET @order1_id = (SELECT order_id FROM orders WHERE total_amount = 599.99 LIMIT 1);
SET @order2_id = (SELECT order_id FROM orders WHERE total_amount = 89.99 LIMIT 1);

INSERT INTO payments (payment_id, client_id, order_id, customer_id, payment_method, payment_date, status, amount, transaction_id) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), @sarah_id, @order1_id, @sarah_id, 'CREDIT_CARD', DATE_SUB(NOW(), INTERVAL 3 DAY), 'COMPLETED', 599.99, 'TXN_001234567890'),
(UNHEX(REPLACE(UUID(), '-', '')), @david_id, @order2_id, @david_id, 'PAYPAL', DATE_SUB(NOW(), INTERVAL 1 DAY), 'COMPLETED', 89.99, 'TXN_001234567891');

-- Insert sample reviews
INSERT INTO reviews (review_id, client_id, product_id, rating, comment, date) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), @sarah_id, @iphone_id, 5, 'Excellent condition, exactly as described!', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(UNHEX(REPLACE(UUID(), '-', '')), @david_id, @jacket_id, 4, 'Good quality jacket, very warm and comfortable.', CURDATE());

-- Insert sample cart items
SET @galaxy_id = (SELECT id FROM products WHERE name = 'Samsung Galaxy S21' LIMIT 1);
SET @dress_id = (SELECT id FROM products WHERE name = 'Designer Dress' LIMIT 1);

INSERT INTO cart (id, client_id, product_id, quantity, product_price) VALUES 
(UNHEX(REPLACE(UUID(), '-', '')), @sarah_id, @galaxy_id, 1, 499.99),
(UNHEX(REPLACE(UUID(), '-', '')), @david_id, @dress_id, 1, 199.99);
