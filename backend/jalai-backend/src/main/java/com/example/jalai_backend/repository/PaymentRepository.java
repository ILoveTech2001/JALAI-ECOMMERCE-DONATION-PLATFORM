package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    
    // Find payments by client
    @Query("SELECT p FROM Payment p WHERE p.client.id = :clientId ORDER BY p.paymentDate DESC")
    List<Payment> findByClientId(@Param("clientId") UUID clientId);
    
    // Find payment by order
    @Query("SELECT p FROM Payment p WHERE p.order.orderId = :orderId")
    Optional<Payment> findByOrderId(@Param("orderId") UUID orderId);
    
    // Find payments by status
    List<Payment> findByStatus(Payment.PaymentStatus status);
    
    // Find payments by payment method
    List<Payment> findByPaymentMethod(Payment.PaymentMethod paymentMethod);
    
    // Find payments by transaction ID
    Optional<Payment> findByTransactionId(String transactionId);
    
    // Find payments by date range
    @Query("SELECT p FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate ORDER BY p.paymentDate DESC")
    List<Payment> findByPaymentDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find payments by amount range
    @Query("SELECT p FROM Payment p WHERE p.amount BETWEEN :minAmount AND :maxAmount ORDER BY p.amount DESC")
    List<Payment> findByAmountRange(@Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);
    
    // Calculate total payments for a client
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.client.id = :clientId AND p.status = 'COMPLETED'")
    BigDecimal calculateTotalPaymentsForClient(@Param("clientId") UUID clientId);
    
    // Find failed payments
    List<Payment> findByStatusOrderByPaymentDateDesc(Payment.PaymentStatus status);
    
    // Find pending payments older than specified hours
    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' AND p.createdAt < :cutoffDate")
    List<Payment> findPendingPaymentsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Count payments by status
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = :status")
    long countByStatus(@Param("status") Payment.PaymentStatus status);
    
    // Find payments by customer ID
    List<Payment> findByCustomerId(UUID customerId);
    
    // Calculate daily revenue
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE DATE(p.paymentDate) = DATE(:date) AND p.status = 'COMPLETED'")
    BigDecimal calculateDailyRevenue(@Param("date") LocalDateTime date);
    
    // Find recent successful payments
    @Query("SELECT p FROM Payment p WHERE p.status = 'COMPLETED' ORDER BY p.paymentDate DESC")
    List<Payment> findRecentSuccessfulPayments();
}
