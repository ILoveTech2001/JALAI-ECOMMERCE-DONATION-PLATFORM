package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DonationRepository extends JpaRepository<Donation, UUID> {
    
    // Find donations by client
    @Query("SELECT d FROM Donation d WHERE d.client.id = :clientId ORDER BY d.createdAt DESC")
    List<Donation> findByClientId(@Param("clientId") UUID clientId);
    
    // Find donations by orphanage
    @Query("SELECT d FROM Donation d WHERE d.orphanage.id = :orphanageId ORDER BY d.createdAt DESC")
    List<Donation> findByOrphanageId(@Param("orphanageId") UUID orphanageId);
    
    // Find donations by type
    List<Donation> findByDonationType(Donation.DonationType donationType);
    
    // Find donations by status
    List<Donation> findByStatus(Donation.DonationStatus status);
    
    // Find confirmed donations
    List<Donation> findByIsConfirmedTrue();
    
    // Find pending donations
    List<Donation> findByIsConfirmedFalse();
    
    // Find donations by appointment date range
    @Query("SELECT d FROM Donation d WHERE d.appointmentDate BETWEEN :startDate AND :endDate ORDER BY d.appointmentDate ASC")
    List<Donation> findByAppointmentDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find cash donations
    @Query("SELECT d FROM Donation d WHERE d.donationType = 'CASH' AND d.cashAmount IS NOT NULL")
    List<Donation> findCashDonations();
    
    // Find kind donations
    @Query("SELECT d FROM Donation d WHERE d.donationType = 'KIND' AND d.itemDescription IS NOT NULL")
    List<Donation> findKindDonations();
    
    // Calculate total cash donations for an orphanage
    @Query("SELECT SUM(d.cashAmount) FROM Donation d WHERE d.orphanage.id = :orphanageId AND d.donationType IN ('CASH', 'BOTH') AND d.status = 'COMPLETED'")
    BigDecimal calculateTotalCashDonationsForOrphanage(@Param("orphanageId") UUID orphanageId);
    
    // Calculate total cash donations by a client
    @Query("SELECT SUM(d.cashAmount) FROM Donation d WHERE d.client.id = :clientId AND d.donationType IN ('CASH', 'BOTH') AND d.status = 'COMPLETED'")
    BigDecimal calculateTotalCashDonationsByClient(@Param("clientId") UUID clientId);
    
    // Count donations by type for an orphanage
    @Query("SELECT COUNT(d) FROM Donation d WHERE d.orphanage.id = :orphanageId AND d.donationType = :donationType")
    long countDonationsByTypeForOrphanage(@Param("orphanageId") UUID orphanageId, @Param("donationType") Donation.DonationType donationType);
    
    // Find donations scheduled for today
    @Query("SELECT d FROM Donation d WHERE DATE(d.appointmentDate) = DATE(:today) AND d.status IN ('CONFIRMED', 'IN_PROGRESS')")
    List<Donation> findDonationsScheduledForToday(@Param("today") LocalDateTime today);
    
    // Find overdue donations
    @Query("SELECT d FROM Donation d WHERE d.appointmentDate < :currentDate AND d.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Donation> findOverdueDonations(@Param("currentDate") LocalDateTime currentDate);
    
    // Find recent donations
    @Query("SELECT d FROM Donation d ORDER BY d.createdAt DESC")
    List<Donation> findRecentDonations();
    
    // Find top donors by donation count
    @Query("SELECT d.client, COUNT(d) as donationCount FROM Donation d WHERE d.status = 'COMPLETED' GROUP BY d.client ORDER BY donationCount DESC")
    List<Object[]> findTopDonorsByCount();
    
    // Find top donors by cash amount
    @Query("SELECT d.client, SUM(d.cashAmount) as totalAmount FROM Donation d WHERE d.donationType IN ('CASH', 'BOTH') AND d.status = 'COMPLETED' GROUP BY d.client ORDER BY totalAmount DESC")
    List<Object[]> findTopDonorsByCashAmount();
}
