package com.example.jalai_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orphanages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Orphanage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Orphanage name is required")
    @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
    @Column(nullable = false, length = 200)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Column(nullable = false)
    private String password;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number should be valid")
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Size(max = 500, message = "Location must not exceed 500 characters")
    @Column(length = 500)
    private String location;

    @Column(name = "is_active")
    private Boolean isActive = false; // New orphanages start as inactive (pending approval)

    @Column(name = "number_of_children")
    private Integer numberOfChildren;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(length = 1000)
    private String description;

    @Size(max = 200, message = "Contact person name must not exceed 200 characters")
    @Column(name = "contact_person", length = 200)
    private String contactPerson;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "current_occupancy")
    private Integer currentOccupancy;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "managed_by_admin_id")
    private Admin managedBy;

    @OneToMany(mappedBy = "orphanage", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Donation> donations;

    // Business methods
    public void approveDonation(Donation donation) {
        donation.setStatus(Donation.DonationStatus.CONFIRMED);
    }

    public void updateProfile() {
        // Implementation for updating orphanage profile
    }

    public void viewDonations() {
        // Implementation for viewing donations
    }

    public void contactUsers() {
        // Implementation for contacting users
    }
}
