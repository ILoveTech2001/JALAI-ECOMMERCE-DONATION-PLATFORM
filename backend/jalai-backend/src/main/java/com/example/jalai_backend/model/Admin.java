package com.example.jalai_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
@Table(name = "admins")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Column(nullable = false)
    private String password;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @JsonIgnore
    @OneToMany(mappedBy = "approvedBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Product> approvedProducts;

    @JsonIgnore
    @OneToMany(mappedBy = "managedBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Client> managedClients;

    @JsonIgnore
    @OneToMany(mappedBy = "managedBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Orphanage> managedOrphanages;

    @JsonIgnore
    @OneToMany(mappedBy = "managedBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Category> managedCategories;

    // Business methods
    public void approveProduct(Product product) {
        product.setApprovedBy(this);
        product.setIsApproved(true);
    }

    public void manageUser(Client client) {
        client.setManagedBy(this);
    }

    public void manageOrphanage(Orphanage orphanage) {
        orphanage.setManagedBy(this);
    }
}
