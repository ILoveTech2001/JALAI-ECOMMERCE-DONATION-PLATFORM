package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    /**
     * Find all order items for a specific order
     */
    List<OrderItem> findByOrderOrderId(UUID orderId);

    /**
     * Find all order items for a specific product
     */
    List<OrderItem> findByProductId(UUID productId);

    /**
     * Find order items by order ID and product ID
     */
    List<OrderItem> findByOrderOrderIdAndProductId(UUID orderId, UUID productId);

    /**
     * Calculate total quantity for a specific product across all orders
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.product.id = :productId")
    Integer getTotalQuantityByProductId(@Param("productId") UUID productId);

    /**
     * Get order items with their order and product details
     */
    @Query("SELECT oi FROM OrderItem oi " +
            "JOIN FETCH oi.order o " +
            "JOIN FETCH oi.product p " +
            "WHERE oi.order.orderId = :orderId")
    List<OrderItem> findByOrderOrderIdWithDetails(@Param("orderId") UUID orderId);

    /**
     * Delete all order items for a specific order
     */
    void deleteByOrderOrderId(UUID orderId);

    /**
     * Delete all order items for a specific product
     */
    void deleteByProductId(UUID productId);
}
