package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    // Find orders by client
    @Query("SELECT o FROM Order o WHERE o.client.id = :clientId ORDER BY o.createdAt DESC")
    List<Order> findByClientId(@Param("clientId") UUID clientId);

    // Count orders by client
    @Query("SELECT COUNT(o) FROM Order o WHERE o.client.id = :clientId")
    long countByClientId(@Param("clientId") UUID clientId);

    // Find orders by seller
    @Query("SELECT o FROM Order o WHERE o.seller.id = :sellerId ORDER BY o.createdAt DESC")
    List<Order> findBySellerId(@Param("sellerId") UUID sellerId);

    // Find orders by status
    List<Order> findByStatus(Order.OrderStatus status);

    // Find orders by client with pagination
    @Query("SELECT o FROM Order o WHERE o.client.id = :clientId ORDER BY o.createdAt DESC")
    Page<Order> findByClientIdWithPagination(@Param("clientId") UUID clientId, Pageable pageable);

    // Find orders by date range
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Find orders by delivery date range
    @Query("SELECT o FROM Order o WHERE o.deliveryDate BETWEEN :startDate AND :endDate ORDER BY o.deliveryDate ASC")
    List<Order> findByDeliveryDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Find orders by total amount range
    @Query("SELECT o FROM Order o WHERE o.totalAmount BETWEEN :minAmount AND :maxAmount ORDER BY o.totalAmount DESC")
    List<Order> findByTotalAmountRange(@Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount);

    // Calculate total sales for a seller
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.seller.id = :sellerId AND o.status = 'DELIVERED'")
    BigDecimal calculateTotalSalesForSeller(@Param("sellerId") UUID sellerId);

    // Calculate total purchases for a client
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.client.id = :clientId AND o.status = 'DELIVERED'")
    BigDecimal calculateTotalPurchasesForClient(@Param("clientId") UUID clientId);

    // Count orders by status
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") Order.OrderStatus status);

    // Find recent orders
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findRecentOrders(Pageable pageable);

    // Find pending orders older than specified days
    @Query("SELECT o FROM Order o WHERE o.status = 'PENDING' AND o.createdAt < :cutoffDate")
    List<Order> findPendingOrdersOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Find orders requiring delivery today
    @Query("SELECT o FROM Order o WHERE DATE(o.deliveryDate) = DATE(:today) AND o.status IN ('CONFIRMED', 'PROCESSING')")
    List<Order> findOrdersForDeliveryToday(@Param("today") LocalDateTime today);

    // Find top clients by order value
    @Query("SELECT o.client, SUM(o.totalAmount) as totalSpent FROM Order o WHERE o.status = 'DELIVERED' GROUP BY o.client ORDER BY totalSpent DESC")
    List<Object[]> findTopClientsByOrderValue();
}
