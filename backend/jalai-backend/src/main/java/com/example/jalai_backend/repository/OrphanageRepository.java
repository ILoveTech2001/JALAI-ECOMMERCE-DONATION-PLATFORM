package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Orphanage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrphanageRepository extends JpaRepository<Orphanage, UUID> {

    // Find orphanage by email
    Optional<Orphanage> findByEmail(String email);

    // Find orphanage by email and password (for authentication)
    Optional<Orphanage> findByEmailAndPassword(String email, String password);

    // Find all active orphanages
    List<Orphanage> findByIsActiveTrue();

    // Find all inactive orphanages
    List<Orphanage> findByIsActiveFalse();

    // Check if email exists
    boolean existsByEmail(String email);

    // Find orphanages by location
    List<Orphanage> findByLocationContainingIgnoreCase(String location);

    // Find orphanages by name containing (case insensitive)
    @Query("SELECT o FROM Orphanage o WHERE LOWER(o.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Orphanage> findByNameContainingIgnoreCase(@Param("name") String name);

    // Find orphanage by phone number
    Optional<Orphanage> findByPhoneNumber(String phoneNumber);

    // Find orphanages managed by specific admin
    @Query("SELECT o FROM Orphanage o WHERE o.managedBy.id = :adminId")
    List<Orphanage> findByManagedByAdminId(@Param("adminId") UUID adminId);

    // Find orphanages with donations
    @Query("SELECT DISTINCT o FROM Orphanage o JOIN o.donations d")
    List<Orphanage> findOrphanagesWithDonations();

    // Calculate total donations received by orphanage
    @Query("SELECT SUM(d.cashAmount) FROM Donation d WHERE d.orphanage.id = :orphanageId AND d.donationType IN ('CASH', 'BOTH') AND d.status = 'COMPLETED'")
    BigDecimal calculateTotalDonationsReceived(@Param("orphanageId") UUID orphanageId);

    // Count total donations for orphanage
    @Query("SELECT COUNT(d) FROM Donation d WHERE d.orphanage.id = :orphanageId AND d.status = 'COMPLETED'")
    long countTotalDonationsForOrphanage(@Param("orphanageId") UUID orphanageId);

    // Find orphanages by donation count (top recipients)
    @Query("SELECT o, COUNT(d) as donationCount FROM Orphanage o LEFT JOIN o.donations d WHERE d.status = 'COMPLETED' GROUP BY o ORDER BY donationCount DESC")
    List<Object[]> findOrphanagesOrderedByDonationCount();

    // Find orphanages by total donation amount
    @Query("SELECT o, SUM(d.cashAmount) as totalAmount FROM Orphanage o LEFT JOIN o.donations d WHERE d.donationType IN ('CASH', 'BOTH') AND d.status = 'COMPLETED' GROUP BY o ORDER BY totalAmount DESC")
    List<Object[]> findOrphanagesOrderedByDonationAmount();

    // Find orphanages needing urgent donations (no recent donations)
    @Query("SELECT o FROM Orphanage o WHERE o.id NOT IN (SELECT DISTINCT d.orphanage.id FROM Donation d WHERE d.createdAt > :cutoffDate)")
    List<Orphanage> findOrphanagesNeedingUrgentDonations(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);

    // Count total active orphanages
    @Query("SELECT COUNT(o) FROM Orphanage o WHERE o.isActive = true")
    long countActiveOrphanages();

    // Combined filters for public access (active orphanages only)
    List<Orphanage> findByLocationContainingIgnoreCaseAndIsActiveTrue(String location);

    @Query("SELECT o FROM Orphanage o WHERE LOWER(o.name) LIKE LOWER(CONCAT('%', :name, '%')) AND o.isActive = true")
    List<Orphanage> findByNameContainingIgnoreCaseAndIsActiveTrue(@Param("name") String name);
}
