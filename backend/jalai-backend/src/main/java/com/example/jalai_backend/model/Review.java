package com.example.jalai_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "review_id", columnDefinition = "BINARY(16)")
    private UUID reviewId;

    @NotNull(message = "Client ID is required")
    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @NotNull(message = "Product ID is required")
    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    @Column(nullable = false)
    private Integer rating;

    @Size(max = 1000, message = "Comment must not exceed 1000 characters")
    @Column(length = 1000)
    private String comment;

    @NotNull(message = "Date is required")
    @Column(nullable = false)
    private Date date;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false, insertable = false, updatable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, insertable = false, updatable = false)
    private Product product;

    // Business methods
    public void submitReview() {
        // Implementation for submitting review
    }

    public void editReview() {
        // Implementation for editing review
    }
}
