-- V5: Ensure all required tables exist (PostgreSQL)
-- This migration ensures all tables are created if they don't exist

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admins table if not exists
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table if not exists
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(25),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orphanages table if not exists
CREATE TABLE IF NOT EXISTS orphanages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT,
    contact_person VARCHAR(100),
    phone VARCHAR(25),
    website VARCHAR(255),
    current_occupancy INTEGER DEFAULT 0,
    capacity INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table if not exists
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    condition VARCHAR(50) DEFAULT 'GOOD',
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    seller_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Create donations table if not exists
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL,
    orphanage_id UUID NOT NULL,
    donation_type VARCHAR(20) NOT NULL CHECK (donation_type IN ('CASH', 'KIND', 'BOTH')),
    cash_amount DECIMAL(10,2),
    item_description TEXT,
    appointment_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (orphanage_id) REFERENCES orphanages(id) ON DELETE CASCADE
);

-- Create orders table if not exists
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('CLIENT', 'ORPHANAGE', 'ADMIN')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table if not exists
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    transaction_id VARCHAR(255),
    mobile_money_provider VARCHAR(50),
    mobile_money_number VARCHAR(25),
    reference_number VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Insert default admin if not exists
INSERT INTO admins (name, email, password, is_active)
SELECT 'System Admin', 'admin@jalai.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM5lIX.P9fUKKDDN2Z6y', true
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'admin@jalai.com');

-- Insert sample orphanage if not exists
INSERT INTO orphanages (name, email, password, location, description, contact_person, phone, current_occupancy, capacity, is_verified, is_active)
SELECT 'Hope Children Home', 'hope@jalai.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM5lIX.P9fUKKDDN2Z6y', 'Douala, Cameroon', 'A loving home for children in need', 'Sister Mary', '+237 123 456 789', 25, 50, true, true
WHERE NOT EXISTS (SELECT 1 FROM orphanages WHERE email = 'hope@jalai.com');

-- Insert sample client if not exists
INSERT INTO clients (name, email, password, phone, address, is_active)
SELECT 'John Doe', 'john@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM5lIX.P9fUKKDDN2Z6y', '+237 123 456 789', 'Yaoundé, Cameroon', true
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'john@example.com');
