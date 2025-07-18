package com.example.jalai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailDTO {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Boolean isAvailable;
    private Boolean isApproved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Seller information
    private UUID sellerId;
    private String sellerName;
    private String sellerEmail;
    
    // Category information
    private UUID categoryId;
    private String categoryName;
    
    // Admin approval information
    private UUID approvedByAdminId;
    private String approvedByAdminName;
    
    // Formatted dates for frontend
    private String formattedCreatedAt;
    private String formattedUpdatedAt;
    
    // Status for display
    private String status;
    
    public void setFormattedDates() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        if (this.createdAt != null) {
            this.formattedCreatedAt = this.createdAt.format(formatter);
        }
        if (this.updatedAt != null) {
            this.formattedUpdatedAt = this.updatedAt.format(formatter);
        }
    }
    
    public void setStatusFromFlags() {
        if (this.isApproved != null && this.isApproved) {
            this.status = "approved";
        } else if (this.isApproved != null && !this.isApproved) {
            this.status = "rejected";
        } else {
            this.status = "pending";
        }
    }
}
