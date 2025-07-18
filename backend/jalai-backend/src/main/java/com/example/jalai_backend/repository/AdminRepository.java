package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminRepository extends JpaRepository<Admin, UUID> {

    // Find admin by email
    Optional<Admin> findByEmail(String email);

    // Find admin by email and password (for authentication)
    Optional<Admin> findByEmailAndPassword(String email, String password);

    // Find all active admins
    List<Admin> findByIsActiveTrue();

    // Find all inactive admins
    List<Admin> findByIsActiveFalse();

    // Check if email exists
    boolean existsByEmail(String email);

    // Delete admin by email
    @Transactional
    void deleteByEmail(String email);

    // Find admins by name containing (case insensitive)
    @Query("SELECT a FROM Admin a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Admin> findByNameContainingIgnoreCase(@Param("name") String name);

    // Count total active admins
    @Query("SELECT COUNT(a) FROM Admin a WHERE a.isActive = true")
    long countActiveAdmins();

    // Find admins who have approved products
    @Query("SELECT DISTINCT a FROM Admin a JOIN a.approvedProducts p WHERE p.isApproved = true")
    List<Admin> findAdminsWithApprovedProducts();

    // Find admins managing specific number of clients
    @Query("SELECT a FROM Admin a WHERE SIZE(a.managedClients) >= :minClients")
    List<Admin> findAdminsManagingAtLeastClients(@Param("minClients") int minClients);
}
