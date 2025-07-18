package com.example.jalai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSummaryDTO {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private Boolean isDonated;
    private Boolean isApproved;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Simplified references without full objects to avoid circular references
    private UUID sellerId;
    private String sellerName;
    private UUID categoryId;
    private String categoryName;
    private UUID approvedByAdminId;
    private String approvedByAdminName;

    // Thumbnail image URL (truncated for performance)
    private String imageUrlThumbnail;

    // Additional fields for admin dashboard
    private String status; // derived from isApproved, isAvailable
    private String dateAdded; // formatted createdAt
    private Integer sales; // placeholder for now
    private Integer stock; // placeholder for now
}
