package com.example.jalai_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "donation_type", nullable = false)
    private DonationType donationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status = DonationStatus.PENDING;

    @Column(name = "appointment_date")
    private LocalDateTime appointmentDate;

    @NotNull(message = "Orphanage ID is required")
    @Column(name = "orphanage_id", nullable = false)
    private UUID orphanageId;

    @Column(name = "cash_amount", precision = 10, scale = 2)
    private BigDecimal cashAmount;

    @Column(name = "item_description", length = 1000)
    private String itemDescription;

    @Column(name = "is_confirmed")
    private Boolean isConfirmed = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orphanage_id", nullable = false, insertable = false, updatable = false)
    private Orphanage orphanage;

    // Business methods
    public void trackDonation() {
        // Implementation for tracking donation
    }

    public void confirmDonation() {
        // Implementation for confirming donation
        this.isConfirmed = true;
        this.status = DonationStatus.CONFIRMED;
    }

    // Donation type enum
    public enum DonationType {
        CASH,
        KIND,
        BOTH
    }

    // Donation status enum
    public enum DonationStatus {
        PENDING,
        CONFIRMED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}
