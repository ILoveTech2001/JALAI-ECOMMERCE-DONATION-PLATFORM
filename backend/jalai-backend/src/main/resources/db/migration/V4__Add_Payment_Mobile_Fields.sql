-- Add mobile money fields to payments table
ALTER TABLE payments 
ADD COLUMN phone_number VARCHAR(20),
ADD COLUMN provider VARCHAR(50);

-- Update existing payment methods enum to include mobile payment options
-- Note: This is for MySQL. For PostgreSQL, you would need to handle enum updates differently

-- Add some sample mobile money payment data for testing
-- Update existing payments to have phone numbers for demo purposes
UPDATE payments 
SET phone_number = '+237123456789', 
    provider = 'MTN' 
WHERE payment_method = 'MOBILE_PAYMENT' AND phone_number IS NULL;

-- Add index for better performance on phone number lookups
CREATE INDEX idx_payments_phone_number ON payments(phone_number);
CREATE INDEX idx_payments_provider ON payments(provider);
