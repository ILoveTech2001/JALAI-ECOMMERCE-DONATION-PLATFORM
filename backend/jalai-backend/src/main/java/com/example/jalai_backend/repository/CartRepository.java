package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {
    
    // Find all cart items for a specific client
    @Query("SELECT c FROM Cart c WHERE c.client.id = :clientId")
    List<Cart> findByClientId(@Param("clientId") UUID clientId);
    
    // Find specific cart item by client and product
    @Query("SELECT c FROM Cart c WHERE c.client.id = :clientId AND c.product.id = :productId")
    Optional<Cart> findByClientIdAndProductId(@Param("clientId") UUID clientId, @Param("productId") UUID productId);
    
    // Calculate total cart value for a client
    @Query("SELECT SUM(c.productPrice * c.quantity) FROM Cart c WHERE c.client.id = :clientId")
    BigDecimal calculateTotalCartValue(@Param("clientId") UUID clientId);
    
    // Count total items in cart for a client
    @Query("SELECT SUM(c.quantity) FROM Cart c WHERE c.client.id = :clientId")
    Long countTotalItemsInCart(@Param("clientId") UUID clientId);
    
    // Find cart items by product
    @Query("SELECT c FROM Cart c WHERE c.product.id = :productId")
    List<Cart> findByProductId(@Param("productId") UUID productId);
    
    // Delete all cart items for a client
    @Modifying
    @Transactional
    @Query("DELETE FROM Cart c WHERE c.client.id = :clientId")
    void deleteByClientId(@Param("clientId") UUID clientId);
    
    // Delete specific cart item
    @Modifying
    @Transactional
    @Query("DELETE FROM Cart c WHERE c.client.id = :clientId AND c.product.id = :productId")
    void deleteByClientIdAndProductId(@Param("clientId") UUID clientId, @Param("productId") UUID productId);
    
    // Check if product exists in client's cart
    @Query("SELECT COUNT(c) > 0 FROM Cart c WHERE c.client.id = :clientId AND c.product.id = :productId")
    boolean existsByClientIdAndProductId(@Param("clientId") UUID clientId, @Param("productId") UUID productId);
    
    // Find cart items with quantity greater than specified amount
    @Query("SELECT c FROM Cart c WHERE c.quantity > :quantity")
    List<Cart> findByQuantityGreaterThan(@Param("quantity") Integer quantity);
    
    // Update quantity for specific cart item
    @Modifying
    @Transactional
    @Query("UPDATE Cart c SET c.quantity = :quantity WHERE c.client.id = :clientId AND c.product.id = :productId")
    void updateQuantity(@Param("clientId") UUID clientId, @Param("productId") UUID productId, @Param("quantity") Integer quantity);
}
