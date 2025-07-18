-- V3: Create notifications table
CREATE TABLE notifications (
    id BINARY(16) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Recipient information
    recipient_client_id BINARY(16),
    recipient_admin_id BINARY(16),
    
    -- Related entity information (optional)
    related_entity_id BINARY(16),
    related_entity_type VARCHAR(50),
    
    -- Constraints
    CONSTRAINT fk_notification_client FOREIGN KEY (recipient_client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_admin FOREIGN KEY (recipient_admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    
    -- Ensure at least one recipient is specified
    CONSTRAINT chk_notification_recipient CHECK (
        (recipient_client_id IS NOT NULL AND recipient_admin_id IS NULL) OR
        (recipient_client_id IS NULL AND recipient_admin_id IS NOT NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_recipient_client ON notifications(recipient_client_id);
CREATE INDEX idx_notifications_recipient_admin ON notifications(recipient_admin_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_related_entity ON notifications(related_entity_id, related_entity_type);
