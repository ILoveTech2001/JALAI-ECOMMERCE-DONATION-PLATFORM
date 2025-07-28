package com.example.jalai_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 200, message = "Title must be between 2 and 200 characters")
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank(message = "Message is required")
    @Size(min = 2, max = 1000, message = "Message must be between 2 and 1000 characters")
    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType type;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "is_sent")
    private Boolean isSent = false;

    @Column(name = "related_entity_id")
    private UUID relatedEntityId;

    @Column(name = "related_entity_type", length = 50)
    private String relatedEntityType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_client_id")
    private Client recipientClient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_admin_id")
    private Admin recipientAdmin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_orphanage_id")
    private Orphanage recipientOrphanage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_admin_id")
    private Admin senderAdmin;

    // Enums
    public enum NotificationType {
        PRODUCT_APPROVED,
        PRODUCT_REJECTED,
        ORDER_STATUS_CHANGED,
        DONATION_CONFIRMED,
        DONATION_COMPLETED,
        GENERAL_ANNOUNCEMENT,
        SYSTEM_ALERT,
        PAYMENT_INITIATED,
        PAYMENT_RECEIVED,
        PAYMENT_FAILED
    }

    // Business methods
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }

    public void markAsSent() {
        this.isSent = true;
    }

    public boolean isUnread() {
        return !this.isRead;
    }

    public boolean isPending() {
        return !this.isSent;
    }

    // Static factory methods for common notification types
    public static Notification createProductApprovalNotification(Client recipient, Product product, Admin approver) {
        Notification notification = new Notification();
        notification.setTitle("Product Approved!");
        notification.setMessage(String.format("Your product '%s' has been approved and is now live on the marketplace.",
                product.getName()));
        notification.setType(NotificationType.PRODUCT_APPROVED);
        notification.setRecipientClient(recipient);
        notification.setSenderAdmin(approver);
        notification.setRelatedEntityId(product.getId());
        notification.setRelatedEntityType("PRODUCT");
        return notification;
    }

    public static Notification createProductRejectionNotification(Client recipient, Product product, Admin rejector,
            String reason) {
        Notification notification = new Notification();
        notification.setTitle("Product Rejected");
        notification.setMessage(
                String.format("Your product '%s' has been rejected. Reason: %s", product.getName(), reason));
        notification.setType(NotificationType.PRODUCT_REJECTED);
        notification.setRecipientClient(recipient);
        notification.setSenderAdmin(rejector);
        notification.setRelatedEntityId(product.getId());
        notification.setRelatedEntityType("PRODUCT");
        return notification;
    }

    public static Notification createOrderStatusNotification(Client recipient, Order order) {
        Notification notification = new Notification();
        notification.setTitle("Order Status Updated");
        notification.setMessage(String.format("Your order #%s status has been updated to: %s",
                order.getOrderId().toString().substring(0, 8), order.getStatus()));
        notification.setType(NotificationType.ORDER_STATUS_CHANGED);
        notification.setRecipientClient(recipient);
        notification.setRelatedEntityId(order.getOrderId());
        notification.setRelatedEntityType("ORDER");
        return notification;
    }

    public static Notification createDonationConfirmationNotification(Client recipient, Donation donation) {
        Notification notification = new Notification();
        notification.setTitle("Donation Confirmed");
        notification.setMessage(
                "Thank you! Your donation has been confirmed and will make a difference in children's lives.");
        notification.setType(NotificationType.DONATION_CONFIRMED);
        notification.setRecipientClient(recipient);
        notification.setRelatedEntityId(donation.getId());
        notification.setRelatedEntityType("DONATION");
        return notification;
    }
}
