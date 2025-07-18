package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    // Find all available products
    List<Product> findByIsAvailableTrue();

    // Find all approved products
    List<Product> findByIsApprovedTrue();

    // Find all donated products
    List<Product> findByIsDonatedTrue();

    // Find products by category
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.isAvailable = true")
    List<Product> findByCategoryId(@Param("categoryId") UUID categoryId);

    // Find products by seller
    @Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId")
    List<Product> findBySellerId(@Param("sellerId") UUID sellerId);

    // Find products by name containing (case insensitive)
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) AND p.isAvailable = true")
    List<Product> findByNameContainingIgnoreCase(@Param("name") String name);

    // Find products by price range
    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice AND p.isAvailable = true")
    List<Product> findByPriceBetween(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);

    // Find products with pagination
    Page<Product> findByIsAvailableTrue(Pageable pageable);

    // Find products by category with pagination
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.isAvailable = true")
    Page<Product> findByCategoryIdWithPagination(@Param("categoryId") UUID categoryId, Pageable pageable);

    // Search products by keyword in name or description
    @Query("SELECT p FROM Product p WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND p.isAvailable = true")
    List<Product> searchByKeyword(@Param("keyword") String keyword);

    // Find products pending approval
    List<Product> findByIsApprovedFalse();

    // Find products approved by specific admin
    @Query("SELECT p FROM Product p WHERE p.approvedBy.id = :adminId")
    List<Product> findByApprovedByAdminId(@Param("adminId") UUID adminId);

    // Find top-rated products
    @Query("SELECT p FROM Product p LEFT JOIN p.reviews r GROUP BY p ORDER BY AVG(r.rating) DESC")
    List<Product> findTopRatedProducts();

    // Find recently added products
    @Query("SELECT p FROM Product p WHERE p.isAvailable = true ORDER BY p.createdAt DESC")
    List<Product> findRecentProducts();

    // Count products by category
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.isAvailable = true")
    long countByCategoryId(@Param("categoryId") UUID categoryId);

    // Find approved and available products with pagination
    Page<Product> findByIsApprovedTrueAndIsAvailableTrue(Pageable pageable);

    // Find approved and available products by category name with pagination
    @Query("SELECT p FROM Product p WHERE p.isApproved = true AND p.isAvailable = true AND LOWER(p.category.name) = LOWER(:categoryName)")
    Page<Product> findByIsApprovedTrueAndIsAvailableTrueAndCategoryNameIgnoreCase(
            @Param("categoryName") String categoryName, Pageable pageable);

    // Find products by seller/client ID ordered by creation date
    List<Product> findBySellerIdOrderByCreatedAtDesc(UUID sellerId);
}
