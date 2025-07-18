package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {
    
    // Find client by email
    Optional<Client> findByEmail(String email);
    
    // Find client by email and password (for authentication)
    Optional<Client> findByEmailAndPassword(String email, String password);
    
    // Find all active clients
    List<Client> findByIsActiveTrue();
    
    // Find all inactive clients
    List<Client> findByIsActiveFalse();
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Find clients by location
    List<Client> findByLocationContainingIgnoreCase(String location);
    
    // Find clients by name containing (case insensitive)
    @Query("SELECT c FROM Client c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Client> findByNameContainingIgnoreCase(@Param("name") String name);
    
    // Find clients by phone number
    Optional<Client> findByPhone(String phone);
    
    // Find clients managed by specific admin
    @Query("SELECT c FROM Client c WHERE c.managedBy.id = :adminId")
    List<Client> findByManagedByAdminId(@Param("adminId") UUID adminId);
    
    // Find clients who have made orders
    @Query("SELECT DISTINCT c FROM Client c JOIN c.orders o")
    List<Client> findClientsWithOrders();
    
    // Find clients who have made donations
    @Query("SELECT DISTINCT c FROM Client c JOIN c.donations d")
    List<Client> findClientsWithDonations();
    
    // Find clients registered after specific date
    List<Client> findByCreatedAtAfter(LocalDateTime date);
    
    // Count total active clients
    @Query("SELECT COUNT(c) FROM Client c WHERE c.isActive = true")
    long countActiveClients();
    
    // Find top clients by order count
    @Query("SELECT c FROM Client c ORDER BY SIZE(c.orders) DESC")
    List<Client> findTopClientsByOrderCount();
}
